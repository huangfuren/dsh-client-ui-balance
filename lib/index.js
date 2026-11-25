//#region lib/types/index.js
import { createHash, createHmac, randomUUID } from "node:crypto";
/**
* Host half of the balance pill: one same-origin HTTP route that proxies the
* DeepSeek Platform balance query for the browser half.
*
* Why a Host route exists at all. The browser cannot call
* `https://api.deepseek.com/user/balance` itself for two independent reasons:
*
*   1. Cross-origin. The Platform endpoint answers no cross-origin reads, so a
*      fetch from the page fails before it can read a byte. Same-origin is not
*      stylistic here; it is the only way through.
*   2. The key must never reach the page. Settings stores it in the credential
*      service addressed by reference (DEEPSEEK_API_KEY). Shipping the value to
*      the browser half would turn a machine-local secret into part of every
*      page load, so the reference resolves here, in the process that owns it,
*      and only the result crosses back.
*
* Route registration mirrors the discipline learned in the background plugin:
* `webServer` is frequently not available yet when this apply runs, so the
* registration retries on `service-added` and on a bounded poll. Registering
* once and missing silently shows up as a pill that never loads with no error
* anywhere, which is exactly the failure being avoided.
*/
/** Same-origin route the browser half polls. */
const BALANCE_ROUTE = "/balance-rpc";
/**
* Credential reference Settings writes the DeepSeek key under. A plain string is
* used rather than importing `credentialRef`: that helper is brand-only identity
* at runtime, and avoiding the import keeps this half free of a dependency whose
* version may not resolve inside a profile install.
*/
const DEFAULT_KEY_REF = "DEEPSEEK_API_KEY";
/** DeepSeek Platform's own account-balance endpoint. */
const BALANCE_URL = "https://api.deepseek.com/user/balance";
/** Cap one upstream call well below the browser's own request budget. */
const UPSTREAM_TIMEOUT_MS = 15e3;
/**
* Send one JSON response and end it. Kept local so this half depends on no
* shared web helper whose location may move between releases.
* @param res - raw Node response.
* @param status - HTTP status.
* @param body - JSON-serializable payload.
*/
function sendJson(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(payload)
	});
	res.end(payload);
}
/* ------------------------------------------------------------------ *
* Aliyun account quota — a second, independent data source.
*
* It shares nothing with the Platform path above: different host, different
* auth (a RAM AccessKey pair signed per request, never a bearer token), and the
* number that actually matters here is not a wallet at all.
*
* What a student grant really is, per Aliyun's own docs: a *cash coupon*, not a
* currency balance. `QueryCashCoupons` (BSS OpenApi 2017-12-14) answers
* `Data.CashCoupon[]` carrying `Balance` (what is left), `NominalValue` (face
* value), `ExpiryTime` and `Status` (`Available` | `Expired` | `Cancelled`).
* `QueryAccountBalance` answers only the cash wallet (`AvailableCashAmount` /
* `AvailableAmount`), which on a coupon-funded account is normally 0.00 — so
* both are read, and the capsule leads with the coupon figure instead of a
* misleading zero.
*
* Signing: ACS3-HMAC-SHA256 (the current V3 scheme). A V1 (HMAC-SHA1 query
* signature) retry is kept behind it because some older AccessKey pairs are
* still rejected by V3; that retry only fires on a signature-shaped rejection,
* never on a genuine permission error, so a missing `bss:DescribeCoupons`
* grant still surfaces as itself instead of being retried into a second, more
* confusing failure.
*
* Credentials resolve per request exactly like the DeepSeek key, so the secret
* never leaves this process and a rotated pair takes effect without a restart.
* ------------------------------------------------------------------ */
/** Same-origin route the Aliyun capsule polls. */
const ALIYUN_ROUTE = "/aliyun-balance-rpc";
/** Credential references the RAM AccessKey pair is stored under. */
const ALIYUN_KEY_ID_REF = "ALIYUN_ACCESS_KEY_ID";
const ALIYUN_KEY_SECRET_REF = "ALIYUN_ACCESS_KEY_SECRET";
/**
* BSS OpenApi endpoint and the frozen API version every call below uses.
*
* The endpoint is `business.aliyuncs.com` (region cn-hangzhou) — NOT
* `bssopenapi.aliyuncs.com`, which does not resolve at all. Confirmed against
* the official request-structure page and repeated in every SDK's default
* config.
*/
const BSS_HOST = "business.aliyuncs.com";
const BSS_VERSION = "2017-12-14";
/** Cap one BSS call; Aliyun answers far slower than Platform's edge. */
const BSS_TIMEOUT_MS = 12e3;
/**
* Coupon state moves on the hour at best, while the pill polls once a minute.
* Caching here keeps a browser left open all day from turning a 1 r/min poll
* into 1 440 BSS calls the account never needed.
*/
const ALIYUN_CACHE_MS = 6e4;
/** Last successful Aliyun read, so the poll cadence does not become API load. */
let aliyunCache;
/**
* RFC 3986 encoding as Aliyun defines it: `encodeURIComponent` plus the four
* characters it leaves bare that the spec does not.
* @param value - raw text.
* @returns percent-encoded text.
*/
function percentEncode(value) {
	return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}
/**
* @param text - raw text.
* @returns lowercase hex SHA-256.
*/
function hexSha256(text) {
	return createHash("sha256").update(text, "utf8").digest("hex");
}
/**
* @param key - secret key.
* @param text - message.
* @returns lowercase hex HMAC-SHA256.
*/
function hexHmac256(key, text) {
	return createHmac("sha256", key).update(text, "utf8").digest("hex");
}
/**
* Build the canonical query string: keys sorted byte-wise, both sides encoded,
* joined by `&`. An empty parameter map yields an empty string, which is what
* the canonical request expects when no business parameters are passed.
* @param params - flat parameter map.
* @returns canonical query string.
*/
function canonicalQuery(params) {
	return Object.keys(params).sort().map((key) => `${percentEncode(key)}=${percentEncode(params[key] ?? "")}`).join("&");
}
/** Error carrying the BSS error code, so the V1 fallback can tell failures apart. */
class BssError extends Error {
	constructor(code, status, message) {
		super(message);
		this.name = "BssError";
		this.code = code;
		this.status = status;
	}
}
/**
* True when a rejection is about *how* the request was signed rather than
* about what the caller is allowed to do. Only these are worth a V1 retry.
* @param error - thrown value.
* @returns whether the V1 fallback should run.
*/
function isSignatureRejection(error) {
	if (!(error instanceof BssError)) return false;
	return /signature|signatureversion|incompletesignature|invalidaccesskeyid/i.test(error.code);
}
/**
* Read a JSON body from a BSS answer, translating a non-2xx into a typed error.
* @param response - fetch response.
* @returns parsed body.
*/
async function readBssBody(response) {
	let body = {};
	try {
		body = await response.json();
	} catch {
		// Non-JSON error pages happen on gateway failures; keep the status alone.
		body = {};
	}
	if (!response.ok) {
		const code = typeof body.Code === "string" ? body.Code : `HTTP${String(response.status)}`;
		const message = typeof body.Message === "string" ? body.Message : response.statusText;
		throw new BssError(code, response.status, `Aliyun BSS ${code}: ${message}`);
	}
	if (body.Success === false) {
		const code = typeof body.Code === "string" ? body.Code : "UnknownError";
		const message = typeof body.Message === "string" ? body.Message : "request rejected";
		throw new BssError(code, response.status, `Aliyun BSS ${code}: ${message}`);
	}
	return body;
}
/**
* One signed BSS call using ACS3-HMAC-SHA256.
* @param credentials - resolved AccessKey pair.
* @param action - BSS action name.
* @param params - business parameters.
* @returns the parsed response body.
*/
async function callBssV3(credentials, action, params) {
	const query = canonicalQuery(params);
	const nonce = randomUUID().replace(/-/g, "");
	// BSS wants `yyyy-MM-ddTHH:mm:ssZ`; toISOString's milliseconds must go.
	const date = (new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
	const payloadHash = hexSha256("");
	const signedHeaders = "host;x-acs-action;x-acs-content-sha256;x-acs-date;x-acs-signature-nonce;x-acs-version";
	const canonicalHeaders = [
		`host:${BSS_HOST}`,
		`x-acs-action:${action}`,
		`x-acs-content-sha256:${payloadHash}`,
		`x-acs-date:${date}`,
		`x-acs-signature-nonce:${nonce}`,
		`x-acs-version:${BSS_VERSION}`
	].join("\n") + "\n";
	// Six lines, in the exact order the canonical request defines.
	const canonicalRequest = [
		"GET",
		"/",
		query,
		canonicalHeaders,
		signedHeaders,
		payloadHash
	].join("\n");
	const signature = hexHmac256(credentials.secret, `ACS3-HMAC-SHA256\n${hexSha256(canonicalRequest)}`);
	const authorization = `ACS3-HMAC-SHA256 Credential=${credentials.id},SignedHeaders=${signedHeaders},Signature=${signature}`;
	const response = await fetch(`https://${BSS_HOST}/${query.length > 0 ? `?${query}` : ""}`, {
		method: "GET",
		headers: {
			accept: "application/json",
			"x-acs-action": action,
			"x-acs-version": BSS_VERSION,
			"x-acs-date": date,
			"x-acs-signature-nonce": nonce,
			"x-acs-content-sha256": payloadHash,
			authorization
		},
		signal: AbortSignal.timeout(BSS_TIMEOUT_MS)
	});
	return await readBssBody(response);
}
/**
* One signed BSS call using the legacy V1 (HMAC-SHA1 query) scheme. Kept as a
* fallback only; see `isSignatureRejection`.
* @param credentials - resolved AccessKey pair.
* @param action - BSS action name.
* @param params - business parameters.
* @returns the parsed response body.
*/
async function callBssV1(credentials, action, params) {
	const all = {
		...params,
		Action: action,
		Format: "JSON",
		Version: BSS_VERSION,
		AccessKeyId: credentials.id,
		SignatureMethod: "HMAC-SHA1",
		SignatureVersion: "1.0",
		SignatureNonce: randomUUID().replace(/-/g, ""),
		Timestamp: (new Date()).toISOString().replace(/\.\d{3}Z$/, "Z")
	};
	const canonicalized = canonicalQuery(all);
	const signature = createHmac("sha1", `${credentials.secret}&`).update(`GET&%2F&${percentEncode(canonicalized)}`, "utf8").digest("base64");
	const response = await fetch(`https://${BSS_HOST}/?${canonicalized}&Signature=${percentEncode(signature)}`, {
		method: "GET",
		headers: { accept: "application/json" },
		signal: AbortSignal.timeout(BSS_TIMEOUT_MS)
	});
	return await readBssBody(response);
}
/**
* Call BSS, preferring V3 and retrying once with V1 only on a signature-shaped
* rejection.
* @param credentials - resolved AccessKey pair.
* @param action - BSS action name.
* @param params - business parameters.
* @returns the parsed response body.
*/
async function callBss(credentials, action, params) {
	try {
		return await callBssV3(credentials, action, params);
	} catch (error) {
		if (!isSignatureRejection(error)) throw error;
		console.warn(`[ui-balance] BSS ${action} rejected V3 signing; retrying with V1`);
		return await callBssV1(credentials, action, params);
	}
}
/**
* Resolve the RAM AccessKey pair from the credential service.
* @param ctx - this plugin's Host context.
* @returns the pair, or undefined when either half is missing.
*/
async function resolveAliyunCredentials(ctx) {
	const credentials = ctx.get("credentials");
	if (credentials === undefined) return undefined;
	try {
		const id = (await credentials.resolve(ALIYUN_KEY_ID_REF))?.value?.trim();
		const secret = (await credentials.resolve(ALIYUN_KEY_SECRET_REF))?.value?.trim();
		if (id === undefined || id.length === 0 || secret === undefined || secret.length === 0) return undefined;
		return {
			id,
			secret
		};
	} catch {
		return undefined;
	}
}
/**
* Aliyun sometimes folds a single-element array into a bare object. Normalise
* both shapes so the projection below never has to care.
* @param value - array, object or undefined.
* @returns array of records.
*/
function asArray(value) {
	if (Array.isArray(value)) return value;
	if (value !== null && typeof value === "object") return [value];
	return [];
}
/**
* Read one string field, tolerating the numeric form Aliyun occasionally uses
* (the English docs show `NominalValue: 100` rather than `"100.00"`).
* @param value - raw field.
* @returns decimal string, or undefined.
*/
function asDecimal(value) {
	if (typeof value === "string" && value.trim().length > 0) return value.trim();
	if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(2);
	return undefined;
}
/**
* @param values - decimal strings to add.
* @returns fixed-2 sum, as a string.
*/
function sumDecimals(values) {
	return values.reduce((total, value) => total + Number(value), 0).toFixed(2);
}
/**
* Project the BSS coupon answer into the capsule's vocabulary. Only `Available`
* vouchers count: an expired or cancelled coupon still has a `Balance` field,
* and adding it would overstate what the account can actually spend.
* @param body - `QueryCashCoupons` response body.
* @returns coupon projection, plus the earliest expiry.
*/
function projectCoupons(body) {
	const data = body.Data ?? {};
	const raw = asArray(data.CashCoupon);
	const coupons = raw.flatMap((entry) => {
		if (entry.Status !== "Available") return [];
		const balance = asDecimal(entry.Balance);
		if (balance === undefined) return [];
		const nominalValue = asDecimal(entry.NominalValue) ?? balance;
		return [{
			balance,
			nominalValue,
			...(typeof entry.ExpiryTime === "string" ? { expiryTime: entry.ExpiryTime } : {}),
			...(typeof entry.ApplicableProducts === "string" ? { applicableProducts: entry.ApplicableProducts } : {})
		}];
	});
	const expiries = coupons.flatMap((coupon) => coupon.expiryTime === undefined ? [] : [coupon.expiryTime]).sort();
	return {
		coupons,
		couponBalance: sumDecimals(coupons.map((coupon) => coupon.balance)),
		couponNominal: sumDecimals(coupons.map((coupon) => coupon.nominalValue)),
		...(expiries.length > 0 ? { couponExpiry: expiries[0] } : {})
	};
}
/**
* Read the Aliyun quota snapshot, serving a cached copy inside the cache window.
*
* Two calls, each independently guarded: a coupon failure must not hide the cash
* wallet and vice versa. Both failing throws, and the route reports it in-band
* like the DeepSeek path does.
* @param ctx - this plugin's Host context.
* @param force - bypass the cache (the panel's refresh button).
* @returns the projected snapshot.
*/
async function readAliyunBalance(ctx, force = false) {
	const cached = aliyunCache;
	if (!force && cached !== undefined && Date.now() - cached.at < ALIYUN_CACHE_MS) return cached.value;
	const credentials = await resolveAliyunCredentials(ctx);
	if (credentials === undefined) {
		// Deliberately not cached: the moment the user stores a pair we should see it.
		return {
			configured: false,
			currency: "CNY",
			fetchedAt: (new Date()).toISOString()
		};
	}
	const snapshot = {
		configured: true,
		currency: "CNY",
		fetchedAt: (new Date()).toISOString()
	};
	const failures = [];
	try {
		const body = await callBss(credentials, "QueryCashCoupons", {});
		const projected = projectCoupons(body);
		snapshot.coupons = projected.coupons;
		snapshot.couponBalance = projected.couponBalance;
		snapshot.couponNominal = projected.couponNominal;
		snapshot.couponCount = projected.coupons.length;
		if (projected.couponExpiry !== undefined) snapshot.couponExpiry = projected.couponExpiry;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		snapshot.couponError = message;
		failures.push(`coupons: ${message}`);
	}
	try {
		const body = await callBss(credentials, "QueryAccountBalance", {});
		const data = body.Data ?? {};
		const available = asDecimal(data.AvailableAmount);
		const cash = asDecimal(data.AvailableCashAmount);
		const credit = asDecimal(data.CreditAmount);
		if (available !== undefined) snapshot.availableAmount = available;
		if (cash !== undefined) snapshot.cashAmount = cash;
		if (credit !== undefined) snapshot.creditAmount = credit;
		if (typeof data.Currency === "string") snapshot.currency = data.Currency;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		failures.push(`balance: ${message}`);
	}
	if (failures.length === 2) throw new Error(failures.join("; "));
	if (failures.length > 0) snapshot.error = failures.join("; ");
	aliyunCache = {
		at: Date.now(),
		value: snapshot
	};
	return snapshot;
}
/**
* Resolve the DeepSeek key through whichever surface has it.
*
* The credential service is read per request, never captured at apply time: a
* profile-level context does not necessarily present its services during
* startup, and a once-captured undefined stays undefined for the process
* lifetime (observed earlier in the background plugin's storage layer).
* Resolving late also picks up a key the user rotates in Settings without any
* restart.
*
* @param ctx - this plugin's Host context.
* @returns the key, or undefined when Settings has not stored one.
*/
async function resolveApiKey(ctx) {
	const credentials = ctx.get("credentials");
	if (credentials === undefined) return undefined;
	try {
		const hit = await credentials.resolve(DEFAULT_KEY_REF);
		const value = hit?.value?.trim();
		return value === undefined || value.length === 0 ? undefined : value;
	} catch {
		// A failing credential read must not take the route down; report absence.
		return undefined;
	}
}
/**
* Ask Platform for the account snapshot.
* @param ctx - this plugin's Host context.
* @returns the pill-shaped snapshot; supported:false when no key exists.
*/
async function readBalance(ctx) {
	const apiKey = await resolveApiKey(ctx);
	if (apiKey === undefined) return {
		supported: false,
		available: false,
		provider: ""
	};
	const response = await fetch(BALANCE_URL, {
		method: "GET",
		headers: {
			accept: "application/json",
			authorization: `Bearer ${apiKey}`
		},
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`platform balance query failed with HTTP ${String(response.status)}`);
	// Platform's own vocabulary: `is_available` plus `balance_infos[]` of
	// `{currency, total_balance, granted_balance, topped_up_balance}`.
	const data = await response.json();
	const wallets = (data.balance_infos ?? []).flatMap((entry) => {
		if (typeof entry.currency !== "string" || typeof entry.total_balance !== "string") return [];
		return [{
			currency: entry.currency,
			totalBalance: entry.total_balance,
			...(typeof entry.granted_balance === "string" ? { grantedBalance: entry.granted_balance } : {}),
			...(typeof entry.topped_up_balance === "string" ? { toppedUpBalance: entry.topped_up_balance } : {})
		}];
	});
	return {
		supported: true,
		available: data.is_available === true,
		provider: "DeepSeek",
		fetchedAt: new Date().toISOString(),
		...(wallets.length > 0 ? { balances: wallets } : {})
	};
}
/**
* Build the request handler shared by both routes: method gate, one read, and
* an always-200 JSON envelope. Failures are reported *in-band* — a non-2xx
* would leave the capsule with nothing to render, while this keeps its existing
* error affordance ("query failed" plus the reason in the tooltip) working
* unchanged, for both providers.
* @param read - the snapshot reader for one route.
* @returns an HTTP handler.
*/
function makeHandler(read) {
	return (req, res) => {
		void (async () => {
			try {
				if (req.method !== "GET" && req.method !== "HEAD") {
					sendJson(res, 405, {
						ok: false,
						error: { message: "method not allowed" }
					});
					return;
				}
				const snapshot = await read();
				sendJson(res, 200, {
					ok: true,
					value: snapshot
				});
			} catch (error) {
				sendJson(res, 200, {
					ok: false,
					error: { message: error instanceof Error ? error.message : String(error) }
				});
			}
		})();
	};
}
/**
* Register the balance route, retrying until the web server exists.
* @param ctx - this plugin's Host context.
*/
function start(ctx) {
	const disposers = [];
	let disposed = false;
	let registered = false;
	ctx.effect(() => () => {
		disposed = true;
		for (const dispose of disposers) dispose();
	}, "ui-balance: host route lifetime");
	const register = () => {
		if (registered || disposed) return;
		const webServer = ctx.get("webServer");
		if (webServer === undefined) return;
		registered = true;
		// Both routes land together: one shared retry/lifetime, so a capsule can
		// never end up half-wired (one provider live, the other silently dead).
		disposers.push(webServer.register({
			kind: "exact",
			path: BALANCE_ROUTE,
			handler: makeHandler(() => readBalance(ctx))
		}));
		disposers.push(webServer.register({
			kind: "exact",
			path: ALIYUN_ROUTE,
			handler: makeHandler(() => readAliyunBalance(ctx))
		}));
		console.info(`[ui-balance] balance routes ready at ${BALANCE_ROUTE} and ${ALIYUN_ROUTE}`);
	};
	register();
	if (registered || disposed) return;
	ctx.on("service-added", (name) => {
		if (name === "webServer") register();
	});
	let tries = 0;
	const attempt = () => {
		if (disposed || registered) return;
		register();
		tries += 1;
		if (!registered && tries < 40) setTimeout(attempt, 500);
		else if (!registered) console.error("[ui-balance] webServer never became available; balance route not registered");
	};
	setTimeout(attempt, 500);
}
/**
* Host plugin body: proxy the Platform balance query over a same-origin route.
* Wrapped so an unexpected Host change degrades only this plugin — a throw here
* would mark the entry failed and refuse to boot the whole profile.
* @param ctx - this plugin's Host context.
*/
function apply(ctx) {
	try {
		start(ctx);
	} catch (error) {
		console.error(`[ui-balance] host half init failed; balance capsule disabled: ${error instanceof Error ? error.message : String(error)}`);
	}
}
//#endregion
export { apply };
