/**
 * Host half of the balance pill: one same-origin HTTP route that proxies the
 * DeepSeek Platform balance query for the browser half.
 *
 * Why a Host route exists at all. The browser cannot call
 * `https://api.deepseek.com/user/balance` itself for two independent reasons:
 *
 *   1. Cross-origin. The Platform endpoint answers no cross-origin reads, so a
 *      `fetch` from the page fails before it can ever read a byte. Same-origin
 *      is not a stylistic choice here; it is the only way through.
 *   2. The key must never reach the page. Settings stores the DeepSeek key in
 *      the credential service, addressed by reference (`DEEPSEEK_API_KEY`).
 *      Shipping that value to the browser half would turn a machine-local
 *      secret into part of every page load, so the reference is resolved here,
 *      in the process that already owns it, and only the *result* crosses back.
 *
 * Route registration goes through the host's authenticated seam,
 * `ctx.connection.fetch.register`, and therefore lands under `/api/`. An
 * earlier revision registered on `webServer` with a bare `/balance-rpc` path:
 * that worked, but it sat outside the fence, so every process on the machine
 * could read the account balance with one unauthenticated GET. The seam also
 * subsumes the old `service-added` listener and bounded poll — `ctx.inject`
 * runs once the dependency exists and owns the disposer.
 */
import { createHash, createHmac, randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'

/**
 * Same-origin routes the browser half polls.
 *
 * Both live under `/api/`, the host's authenticated fence: the route only
 * answers requests carrying the page's own session, so a bare request from
 * another process gets 401 instead of somebody's balance. The previous bare
 * `/balance-rpc` sat outside that fence and answered anyone who asked.
 *
 * `POST` with a buffered body is the seam's convention for on-demand reads.
 * The path is declared again on the browser side — a client plugin may not
 * import host values — and the two copies are kept identical by construction.
 */
const BALANCE_ROUTE = '/api/dsh-client-ui-balance/balance'
/**
 * Credential reference Settings writes the DeepSeek key under. A plain string
 * is used rather than importing `credentialRef`: that helper is a brand-only
 * identity at runtime, and avoiding the import keeps this half free of a
 * dependency whose version may not be resolvable inside a profile install.
 */
const DEFAULT_KEY_REF = 'DEEPSEEK_API_KEY'
/** DeepSeek Platform's own account-balance endpoint. */
const BALANCE_URL = 'https://api.deepseek.com/user/balance'
/** Cap one upstream call well below the browser's own request budget. */
const UPSTREAM_TIMEOUT_MS = 15_000

/**
 * Wire layer-level outputs of the route, shaped like the browser half's
 * historical `LlmBalanceView` so no changes are needed on that side.
 */
interface BalanceSnapshot {
  /** False when no key is resolvable; the pill renders its muted state. */
  supported: boolean
  /** Platform's `is_available`: whether the account may spend right now. */
  available: boolean
  /** Label shown in the panel footer; empty reads as "no provider". */
  provider: string
  /** ISO timestamp of this successful read. */
  fetchedAt?: string
  /** Per-currency wallets, richest first exactly as Platform returned them. */
  balances?: Array<{
    currency: string
    totalBalance: string
    grantedBalance?: string
    toppedUpBalance?: string
  }>
}

/**
 * One JSON reply, tagged `no-store`.
 *
 * `no-store` is not decoration: freshness is this plugin's own cache plus BSS
 * state, never an HTTP cache, so a spent coupon must not come back out of the
 * browser's cache looking unspent.
 * @param body - JSON-serializable payload.
 * @returns a response the seam can hand back unchanged.
 */
function jsonReply(body: unknown): Response {
  return Response.json(body, { headers: { 'cache-control': 'no-store' } })
}

/**
 * @param code - stable, plugin-prefixed failure code.
 * @param message - human-readable detail.
 * @returns a failed envelope, still HTTP 200 so the capsule keeps rendering.
 */
function jsonFailure(code: string, message: string): Response {
  return jsonReply({ ok: false, error: { code, message } })
}

/**
 * How this Host exposes the authenticated route seam, declared structurally.
 *
 * Every level is optional because a deployment may predate the service or ship
 * a shape without it; each level is probed with `typeof` before use.
 */
interface ConnectionHostFace {
  fetch?: {
    register?(route: {
      path: string
      methods: readonly string[]
      requestBody: 'buffered'
      fetch: (request: Request) => Response | Promise<Response>
    }): () => void
  }
}

/* ------------------------------------------------------------------ *
 * Aliyun account quota — a second, independent data source.
 *
 * It shares nothing with the Platform path above: different host, different
 * auth (a RAM AccessKey pair signed per request, never a bearer token), and
 * the number that actually matters here is not a wallet at all.
 *
 * What a student grant really is, per Aliyun's own docs: a *cash coupon*, not
 * a currency balance. `QueryCashCoupons` (BSS OpenApi 2017-12-14) answers
 * `Data.CashCoupon[]` carrying `Balance` (what is left), `NominalValue` (face
 * value), `ExpiryTime` and `Status` (`Available` | `Expired` | `Cancelled`).
 * `QueryAccountBalance` answers only the cash wallet
 * (`AvailableCashAmount` / `AvailableAmount`), which on a coupon-funded
 * account is normally 0.00 — so both are read, and the capsule leads with the
 * coupon figure instead of a misleading zero.
 *
 * Signing: ACS3-HMAC-SHA256 (the current V3 scheme). A V1 (HMAC-SHA1 query
 * signature) retry is kept behind it because some older AccessKey pairs are
 * still rejected by V3; that retry only fires on a signature-shaped
 * rejection, never on a genuine permission error, so a missing
 * `bss:DescribeCoupons` grant still surfaces as itself instead of being
 * retried into a second, more confusing failure.
 *
 * Credentials resolve per request exactly like the DeepSeek key, so the
 * secret never leaves this process and a rotated pair takes effect without a
 * restart.
 * ------------------------------------------------------------------ */

/** Same-origin route the Aliyun capsule polls; see BALANCE_ROUTE for the fence. */
const ALIYUN_ROUTE = '/api/dsh-client-ui-balance/aliyun'
/** Credential references the RAM AccessKey pair is stored under. */
const ALIYUN_KEY_ID_REF = 'ALIYUN_ACCESS_KEY_ID'
const ALIYUN_KEY_SECRET_REF = 'ALIYUN_ACCESS_KEY_SECRET'
/**
 * BSS OpenApi endpoint and the frozen API version every call below uses.
 *
 * The endpoint is `business.aliyuncs.com` (region cn-hangzhou) — NOT
 * `bssopenapi.aliyuncs.com`, which does not resolve at all. Confirmed against
 * the official request-structure page and repeated in every SDK's default
 * config.
 */
const BSS_HOST = 'business.aliyuncs.com'
const BSS_VERSION = '2017-12-14'
/** Cap one BSS call; Aliyun answers far slower than Platform's edge. */
const BSS_TIMEOUT_MS = 12_000
/**
 * Coupon state moves on the hour at best, while the pill polls once a minute.
 * Caching here keeps a browser left open all day from turning a 1 r/min poll
 * into 1 440 BSS calls the account never needed.
 */
const ALIYUN_CACHE_MS = 60_000

/** Parsed pair resolved from the credential service. */
interface AliyunCredentials {
  id: string
  secret: string
}

/** One usable voucher, projected to what the capsule actually renders. */
interface AliyunCoupon {
  balance: string
  nominalValue: string
  expiryTime?: string
  applicableProducts?: string
}

/**
 * Projected Aliyun quota snapshot for the browser half.
 *
 * Every field is optional on purpose: a partial read (coupons answer, cash
 * wallet times out) must still render what did arrive instead of blanking the
 * capsule. `configured: false` is the "no AccessKey yet" state, which is not
 * an error and must not look like one.
 */
interface AliyunSnapshot {
  configured: boolean
  currency: string
  /** Sum of every `Available` coupon's `Balance` — the headline number. */
  couponBalance?: string
  /** Sum of those coupons' face value, for the "of 300" context. */
  couponNominal?: string
  couponCount?: number
  /** Earliest expiry among the usable coupons. */
  couponExpiry?: string
  coupons?: AliyunCoupon[]
  /** `QueryAccountBalance` answers; absent when that call failed. */
  availableAmount?: string
  cashAmount?: string
  creditAmount?: string
  fetchedAt: string
  /** Present when part of the read failed; the snapshot still renders. */
  error?: string
  /** Present when the coupons call failed specifically. */
  couponError?: string
}

/** Last successful Aliyun read, so the poll cadence does not become API load. */
let aliyunCache: { at: number; value: AliyunSnapshot } | undefined

/**
 * RFC 3986 encoding as Aliyun defines it: `encodeURIComponent` plus the four
 * characters it leaves bare that the spec does not.
 * @param value - raw text.
 * @returns percent-encoded text.
 */
function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
}

/**
 * @param text - raw text.
 * @returns lowercase hex SHA-256.
 */
function hexSha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * @param key - secret key.
 * @param text - message.
 * @returns lowercase hex HMAC-SHA256.
 */
function hexHmac256(key: string, text: string): string {
  return createHmac('sha256', key).update(text, 'utf8').digest('hex')
}

/**
 * Build the canonical query string: keys sorted byte-wise, both sides encoded,
 * joined by `&`. An empty parameter map yields an empty string, which is what
 * the canonical request expects when no business parameters are passed.
 * @param params - flat parameter map.
 * @returns canonical query string.
 */
function canonicalQuery(params: Record<string, string>): string {
  return Object.keys(params).sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key] ?? '')}`)
    .join('&')
}

/** Error carrying the BSS error code, so the V1 fallback can tell failures apart. */
class BssError extends Error {
  readonly code: string
  readonly status: number
  /**
   * @param code - Aliyun error code (`InvalidAccessKeyId.NotFound`, …).
   * @param status - HTTP status.
   * @param message - human-readable detail.
   */
  constructor(code: string, status: number, message: string) {
    super(message)
    this.name = 'BssError'
    this.code = code
    this.status = status
  }
}

/**
 * True when a rejection is about *how* the request was signed rather than
 * about what the caller is allowed to do. Only these are worth a V1 retry.
 * @param error - thrown value.
 * @returns whether the V1 fallback should run.
 */
function isSignatureRejection(error: unknown): boolean {
  if (!(error instanceof BssError)) return false
  return /signature|signatureversion|incompletesignature|invalidaccesskeyid/i.test(error.code)
}

/**
 * Read a JSON body from a BSS answer, translating a non-2xx into a typed error.
 * @param response - fetch response.
 * @returns parsed body.
 */
async function readBssBody(response: Response): Promise<Record<string, unknown>> {
  let body: Record<string, unknown> = {}
  try {
    body = await response.json() as Record<string, unknown>
  } catch {
    // Non-JSON error pages happen on gateway failures; keep the status alone.
    body = {}
  }
  if (!response.ok) {
    const code = typeof body.Code === 'string' ? body.Code : `HTTP${String(response.status)}`
    const message = typeof body.Message === 'string' ? body.Message : response.statusText
    throw new BssError(code, response.status, `Aliyun BSS ${code}: ${message}`)
  }
  if (body.Success === false) {
    const code = typeof body.Code === 'string' ? body.Code : 'UnknownError'
    const message = typeof body.Message === 'string' ? body.Message : 'request rejected'
    throw new BssError(code, response.status, `Aliyun BSS ${code}: ${message}`)
  }
  return body
}

/**
 * One signed BSS call using ACS3-HMAC-SHA256.
 * @param credentials - resolved AccessKey pair.
 * @param action - BSS action name.
 * @param params - business parameters.
 * @returns the parsed response body.
 */
async function callBssV3(
  credentials: AliyunCredentials,
  action: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const query = canonicalQuery(params)
  const nonce = randomUUID().replace(/-/g, '')
  // BSS wants `yyyy-MM-ddTHH:mm:ssZ`; toISOString's milliseconds must go.
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const payloadHash = hexSha256('')
  const signedHeaders = 'host;x-acs-action;x-acs-content-sha256;x-acs-date;x-acs-signature-nonce;x-acs-version'
  const canonicalHeaders = [
    `host:${BSS_HOST}`,
    `x-acs-action:${action}`,
    `x-acs-content-sha256:${payloadHash}`,
    `x-acs-date:${date}`,
    `x-acs-signature-nonce:${nonce}`,
    `x-acs-version:${BSS_VERSION}`,
  ].join('\n') + '\n'
  // Six lines, in the exact order the canonical request defines.
  const canonicalRequest = ['GET', '/', query, canonicalHeaders, signedHeaders, payloadHash].join('\n')
  const signature = hexHmac256(credentials.secret, `ACS3-HMAC-SHA256\n${hexSha256(canonicalRequest)}`)
  const authorization = `ACS3-HMAC-SHA256 Credential=${credentials.id},SignedHeaders=${signedHeaders},Signature=${signature}`
  const response = await fetch(`https://${BSS_HOST}/${query.length > 0 ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-acs-action': action,
      'x-acs-version': BSS_VERSION,
      'x-acs-date': date,
      'x-acs-signature-nonce': nonce,
      'x-acs-content-sha256': payloadHash,
      authorization,
    },
    signal: AbortSignal.timeout(BSS_TIMEOUT_MS),
  })
  return await readBssBody(response)
}

/**
 * One signed BSS call using the legacy V1 (HMAC-SHA1 query) scheme. Kept as a
 * fallback only; see `isSignatureRejection`.
 * @param credentials - resolved AccessKey pair.
 * @param action - BSS action name.
 * @param params - business parameters.
 * @returns the parsed response body.
 */
async function callBssV1(
  credentials: AliyunCredentials,
  action: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const all: Record<string, string> = {
    ...params,
    Action: action,
    Format: 'JSON',
    Version: BSS_VERSION,
    AccessKeyId: credentials.id,
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: randomUUID().replace(/-/g, ''),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  }
  const canonicalized = canonicalQuery(all)
  const signature = createHmac('sha1', `${credentials.secret}&`)
    .update(`GET&%2F&${percentEncode(canonicalized)}`, 'utf8')
    .digest('base64')
  const response = await fetch(`https://${BSS_HOST}/?${canonicalized}&Signature=${percentEncode(signature)}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(BSS_TIMEOUT_MS),
  })
  return await readBssBody(response)
}

/**
 * Call BSS, preferring V3 and retrying once with V1 only on a signature-shaped
 * rejection.
 * @param credentials - resolved AccessKey pair.
 * @param action - BSS action name.
 * @param params - business parameters.
 * @returns the parsed response body.
 */
async function callBss(
  credentials: AliyunCredentials,
  action: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  try {
    return await callBssV3(credentials, action, params)
  } catch (error: unknown) {
    if (!isSignatureRejection(error)) throw error
    console.warn(`[ui-balance] BSS ${action} rejected V3 signing; retrying with V1`)
    return await callBssV1(credentials, action, params)
  }
}

/**
 * Resolve the RAM AccessKey pair from the credential service.
 * @param ctx - this plugin's Host context.
 * @returns the pair, or undefined when either half is missing.
 */
async function resolveAliyunCredentials(ctx: Context): Promise<AliyunCredentials | undefined> {
  const credentials = ctx.get('credentials') as
    { resolve(ref: string): Promise<{ value: string } | undefined> } | undefined
  if (credentials === undefined) return undefined
  try {
    const id = (await credentials.resolve(ALIYUN_KEY_ID_REF))?.value?.trim()
    const secret = (await credentials.resolve(ALIYUN_KEY_SECRET_REF))?.value?.trim()
    if (id === undefined || id.length === 0 || secret === undefined || secret.length === 0) return undefined
    return { id, secret }
  } catch {
    return undefined
  }
}

/**
 * Aliyun sometimes folds a single-element array into a bare object. Normalise
 * both shapes so the projection below never has to care.
 * @param value - array, object or undefined.
 * @returns array of records.
 */
function asArray(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) return value as Array<Record<string, unknown>>
  if (value !== null && typeof value === 'object') return [value as Record<string, unknown>]
  return []
}

/**
 * Read one string field, tolerating the numeric form Aliyun occasionally uses
 * (the English docs show `NominalValue: 100` rather than `"100.00"`).
 * @param value - raw field.
 * @returns decimal string, or undefined.
 */
function asDecimal(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2)
  return undefined
}

/**
 * @param values - decimal strings to add.
 * @returns fixed-2 sum, as a string.
 */
function sumDecimals(values: string[]): string {
  return values.reduce((total, value) => total + Number(value), 0).toFixed(2)
}

/**
 * Project the BSS coupon answer into the capsule's vocabulary. Only `Available`
 * vouchers count: an expired or cancelled coupon still has a `Balance` field,
 * and adding it would overstate what the account can actually spend.
 * @param body - `QueryCashCoupons` response body.
 * @returns coupon projection, plus the earliest expiry.
 */
function projectCoupons(body: Record<string, unknown>): {
  coupons: AliyunCoupon[]
  couponBalance: string
  couponNominal: string
  couponExpiry?: string
} {
  const data = (body.Data ?? {}) as Record<string, unknown>
  const raw = asArray(data.CashCoupon)
  const coupons = raw.flatMap((entry): AliyunCoupon[] => {
    if (entry.Status !== 'Available') return []
    const balance = asDecimal(entry.Balance)
    if (balance === undefined) return []
    const nominalValue = asDecimal(entry.NominalValue) ?? balance
    return [{
      balance,
      nominalValue,
      ...(typeof entry.ExpiryTime === 'string' ? { expiryTime: entry.ExpiryTime } : {}),
      ...(typeof entry.ApplicableProducts === 'string' ? { applicableProducts: entry.ApplicableProducts } : {}),
    }]
  })
  const expiries = coupons.flatMap((coupon) => (coupon.expiryTime === undefined ? [] : [coupon.expiryTime]))
    .sort()
  return {
    coupons,
    couponBalance: sumDecimals(coupons.map((coupon) => coupon.balance)),
    couponNominal: sumDecimals(coupons.map((coupon) => coupon.nominalValue)),
    ...(expiries.length > 0 ? { couponExpiry: expiries[0] } : {}),
  }
}

/**
 * One Aliyun read shared by every concurrent caller.
 *
 * The capsule polls from every open tab, and each tab also refreshes on focus
 * and visibility, so N tabs used to mean N simultaneous BSS calls the moment
 * the cache went stale — exactly the pattern that trips a QPS ceiling and
 * surfaces as "query failed" rather than "rate limited". Coalescing fixes it
 * at the source instead of raising the cache window and going stale.
 */
let aliyunInFlight: Promise<AliyunSnapshot> | undefined

/**
 * Read the Aliyun quota snapshot, serving a cached copy inside the cache window
 * and joining an in-flight read when one is already running.
 *
 * A forced refresh joins the in-flight read rather than starting a second one:
 * the read already in progress began after the cache did, so it is by
 * definition fresher than what `force` was trying to escape.
 * @param ctx - this plugin's Host context.
 * @param force - bypass the cache (the panel's refresh button).
 * @returns the projected snapshot.
 */
async function readAliyunBalance(ctx: Context, force = false): Promise<AliyunSnapshot> {
  const cached = aliyunCache
  if (!force && cached !== undefined && Date.now() - cached.at < ALIYUN_CACHE_MS) return cached.value

  const inFlight = aliyunInFlight
  if (inFlight !== undefined) return await inFlight

  const pending = readAliyunBalanceUncached(ctx)
  aliyunInFlight = pending
  try {
    return await pending
  } finally {
    // Only clear our own read; a later caller may already own the slot.
    if (aliyunInFlight === pending) aliyunInFlight = undefined
  }
}

/**
 * The actual read behind {@link readAliyunBalance}; callers go through the
 * wrapper so cache and single-flight discipline cannot be bypassed.
 *
 * Two calls, each independently guarded: a coupon failure must not hide the
 * cash wallet and vice versa. Both failing throws, and the route reports it
 * in-band like the DeepSeek path does.
 * @param ctx - this plugin's Host context.
 * @returns the projected snapshot.
 */
async function readAliyunBalanceUncached(ctx: Context): Promise<AliyunSnapshot> {
  const credentials = await resolveAliyunCredentials(ctx)
  if (credentials === undefined) {
    const unconfigured: AliyunSnapshot = { configured: false, currency: 'CNY', fetchedAt: new Date().toISOString() }
    // Deliberately not cached: the moment the user stores a pair we should see it.
    return unconfigured
  }

  const snapshot: AliyunSnapshot = { configured: true, currency: 'CNY', fetchedAt: new Date().toISOString() }
  const failures: string[] = []

  try {
    const body = await callBss(credentials, 'QueryCashCoupons', {})
    const projected = projectCoupons(body)
    snapshot.coupons = projected.coupons
    snapshot.couponBalance = projected.couponBalance
    snapshot.couponNominal = projected.couponNominal
    snapshot.couponCount = projected.coupons.length
    if (projected.couponExpiry !== undefined) snapshot.couponExpiry = projected.couponExpiry
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    snapshot.couponError = message
    failures.push(`coupons: ${message}`)
  }

  try {
    const body = await callBss(credentials, 'QueryAccountBalance', {})
    const data = (body.Data ?? {}) as Record<string, unknown>
    const available = asDecimal(data.AvailableAmount)
    const cash = asDecimal(data.AvailableCashAmount)
    const credit = asDecimal(data.CreditAmount)
    if (available !== undefined) snapshot.availableAmount = available
    if (cash !== undefined) snapshot.cashAmount = cash
    if (credit !== undefined) snapshot.creditAmount = credit
    if (typeof data.Currency === 'string') snapshot.currency = data.Currency
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`balance: ${message}`)
  }

  if (failures.length === 2) throw new Error(failures.join('; '))
  if (failures.length > 0) snapshot.error = failures.join('; ')

  aliyunCache = { at: Date.now(), value: snapshot }
  return snapshot
}

/**
 * Resolve the DeepSeek key through whichever surface has it.
 *
 * The credential service is read *per request*, never captured at `apply`
 * time: a profile-level context does not necessarily present its services
 * during startup, and a once-captured `undefined` would stay undefined for
 * the process lifetime (observed earlier in the background plugin's storage
 * layer). Resolving late also picks up a key the user rotates in Settings
 * without any restart.
 *
 * @param ctx - this plugin's Host context.
 * @returns the key, or undefined when Settings has not stored one.
 */
async function resolveApiKey(ctx: Context): Promise<string | undefined> {
  const credentials = ctx.get('credentials') as
    { resolve(ref: string): Promise<{ value: string } | undefined> } | undefined
  if (credentials === undefined) return undefined
  try {
    const hit = await credentials.resolve(DEFAULT_KEY_REF)
    const value = hit?.value?.trim()
    return value === undefined || value.length === 0 ? undefined : value
  } catch {
    // A failing credential read must not take the route down; report absence.
    return undefined
  }
}

/**
 * Ask Platform for the account snapshot.
 * @param ctx - this plugin's Host context.
 * @returns the pill-shaped snapshot; `supported: false` when no key exists.
 */
async function readBalance(ctx: Context): Promise<BalanceSnapshot> {
  const apiKey = await resolveApiKey(ctx)
  if (apiKey === undefined) {
    return { supported: false, available: false, provider: '' }
  }
  const response = await fetch(BALANCE_URL, {
    method: 'GET',
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`platform balance query failed with HTTP ${String(response.status)}`)
  }
  // Platform's own vocabulary: `is_available` plus `balance_infos[]` of
  // `{currency, total_balance, granted_balance, topped_up_balance}`.
  const data = await response.json() as {
    is_available?: boolean
    balance_infos?: Array<{
      currency?: string
      total_balance?: string
      granted_balance?: string
      topped_up_balance?: string
    }>
  }
  const wallets = (data.balance_infos ?? []).flatMap((entry) => {
    if (typeof entry.currency !== 'string' || typeof entry.total_balance !== 'string') return []
    return [{
      currency: entry.currency,
      totalBalance: entry.total_balance,
      ...(typeof entry.granted_balance === 'string' ? { grantedBalance: entry.granted_balance } : {}),
      ...(typeof entry.topped_up_balance === 'string' ? { toppedUpBalance: entry.topped_up_balance } : {}),
    }]
  })
  return {
    supported: true,
    available: data.is_available === true,
    provider: 'DeepSeek',
    fetchedAt: new Date().toISOString(),
    ...(wallets.length > 0 ? { balances: wallets } : {}),
  }
}

/**
 * Build the request handler shared by both routes: one read, one envelope.
 *
 * Failures stay HTTP 200 and travel in-band: a non-2xx would leave the capsule
 * with nothing to render, whereas this keeps its existing error affordance
 * ("query failed" plus the reason in the tooltip) working unchanged.
 *
 * The error carries a plugin-prefixed `code` next to the human message: the
 * client renders the message, while the code is what a log search or a future
 * branch on failure kind can rely on. A bare message string is not a contract.
 * @param read - the snapshot reader for one route.
 * @param failureCode - stable, plugin-prefixed code for a failed read.
 * @returns a handler taking the buffered request and answering with JSON.
 */
function makeHandler(
  read: () => Promise<unknown>,
  failureCode: string,
): (request: Request) => Promise<Response> {
  return async () => {
    try {
      return jsonReply({ ok: true, value: await read() })
    } catch (error: unknown) {
      return jsonFailure(failureCode, error instanceof Error ? error.message : String(error))
    }
  }
}

/**
 * Arm both routes once the `connection` service exists.
 *
 * `ctx.inject` replaces the old `service-added` listener plus bounded poll: it
 * runs when the dependency is present, and the effects it owns unregister the
 * routes when the scope goes away, so no dangling route survives an unload.
 * @param ctx - this plugin's Host context.
 */
function start(ctx: Context): void {
  ctx.inject(['connection'], (scope) => {
    const connection = scope.get('connection') as ConnectionHostFace | undefined
    // Shape check, then bind at extraction: the method is handed to `effect`,
    // which invokes it later, so it must not lose its owner along the way.
    const register = typeof connection?.fetch?.register === 'function'
      ? connection.fetch.register.bind(connection.fetch)
      : undefined
    if (register === undefined) {
      console.error('[ui-balance] connection.fetch.register unavailable; capsules stay absent')
      return
    }
    try {
      // Both routes land together, so a capsule can never end up half-wired
      // (one provider live, the other silently dead).
      scope.effect(() => register({
        path: BALANCE_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: makeHandler(() => readBalance(ctx), 'ui-balance/balance-read-failed'),
      }), 'ui-balance: balance route')
      scope.effect(() => register({
        path: ALIYUN_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: makeHandler(() => readAliyunBalance(ctx), 'ui-balance/aliyun-read-failed'),
      }), 'ui-balance: aliyun route')
    } catch (error: unknown) {
      // refuse-quietly: a rejecting registry must not take this plugin, or the
      // capsule beside it, down. The routes simply stay absent.
      console.error('[ui-balance] route registration refused: '
        + (error instanceof Error ? error.message : String(error)))
      return
    }
    console.info(`[ui-balance] balance routes ready at ${BALANCE_ROUTE} and ${ALIYUN_ROUTE}`)
  })
}

/**
 * Host plugin body: proxy the Platform balance query over a same-origin route.
 * Wrapped so an unexpected Host change degrades only this plugin — a throw
 * here would mark the entry failed and refuse to boot the whole profile.
 * @param ctx - this plugin's Host context.
 */
export function apply(ctx: Context): void {
  try {
    start(ctx)
  } catch (error: unknown) {
    console.error('[ui-balance] host half init failed; balance capsule disabled: '
      + (error instanceof Error ? error.message : String(error)))
  }
}
