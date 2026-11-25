/**
 * Real-time account-quota plugin, browser half: contributes two
 * `conversation.session.header.utilities` entries — a compact DeepSeek capsule
 * and, beside it, an Aliyun coupon/quota capsule. Each polls its own
 * same-origin Host route on a fixed cadence plus visibility/focus changes and
 * pushed invalidations. The Host keeps the credentials; this half only ever
 * shows the projected snapshots.
 *
 * Data path (rewritten for a Host that no longer ships `remote.llm.balance`):
 * the Platform endpoint answers no cross-origin reads and must not see the key,
 * so this half asks its own node half instead. The reply keeps the historical
 * `RemoteResult<LlmBalanceView>` envelope, which is why the capsule component
 * itself needed no change.
 */
// Types are declared locally below rather than imported from a shared remotes
// vocabulary: that package no longer describes any balance view. They are
// erased at runtime and mirror exactly what the node half sends.
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import { BalancePill } from './BalancePill.tsx'
import type { BalanceInjected } from './BalancePill.tsx'
import { AliyunPill } from './AliyunPill.tsx'
import { en, NS, zh, type BalanceKey } from './locales.ts'
// Type-only: pulls the locale plugin's Context merge (ctx.locale), the
// conversation session-header SlotMap merge (ui-conversation), and the Remote
// namespace map (api-remotes) into this program.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Provider balance copy. */
    'balance': BalanceKey
  }
}

/** One currency wallet as Platform reports it. */
interface BalanceWallet {
  currency: string
  totalBalance: string
  grantedBalance?: string
  toppedUpBalance?: string
}

/**
 * Projected account snapshot produced by the node half.
 * Mirrors the view the old Host Remote used to answer with, field for field.
 */
export interface LlmBalanceView {
  /** False when no DeepSeek key is resolvable; the pill renders muted. */
  supported: boolean
  /** Platform's `is_available`: whether the account may spend right now. */
  available: boolean
  /** Footer label; empty reads as "no provider". */
  provider: string
  /** ISO timestamp of the successful read. */
  fetchedAt?: string
  balances?: BalanceWallet[]
}

/**
 * Routes registered by the node half; both declarations are kept identical by
 * construction, because a client plugin may not import host values (the build's
 * purity gate rejects it, and two drifting copies would fail at runtime).
 *
 * They live under `/api/`, the host's authenticated fence, and answer `POST`
 * with a buffered body — the seam's convention for on-demand reads.
 */
const BALANCE_ROUTE = '/api/dsh-client-ui-balance/balance'

/**
 * The Aliyun quota route, also registered by the node half.
 *
 * Separate from `BALANCE_ROUTE` because it is a separate read of a separate
 * service: mixing them would make one provider's outage blank the other.
 */
const ALIYUN_ROUTE = '/api/dsh-client-ui-balance/aliyun'

/**
 * Projected Aliyun quota snapshot produced by the node half.
 *
 * Every figure is optional: a partial read (coupons answered, cash wallet
 * failed) still renders what arrived. `configured: false` means no AccessKey
 * is stored yet — an absence, not an error.
 */
export interface AliyunSnapshot {
  /** False until both halves of the AccessKey pair are stored. */
  configured: boolean
  /** Wallet currency; `CNY` in practice. */
  currency: string
  /** Sum of every usable coupon's remaining balance. */
  couponBalance?: string
  /** Sum of those coupons' face value. */
  couponNominal?: string
  /** How many usable coupons the sum covers. */
  couponCount?: number
  /** Earliest expiry among the usable coupons (ISO 8601). */
  couponExpiry?: string
  /** Cash wallet, usually 0.00 on a coupon-funded account. */
  cashAmount?: string
  /** Aliyun's own "available amount" (cash + coupons + credit). */
  availableAmount?: string
  /** ISO timestamp of this successful read. */
  fetchedAt: string
  /** Detail for a partial failure; the snapshot still renders. */
  error?: string
  /** Detail when the coupon call specifically failed. */
  couponError?: string
}

/** Result envelope, shaped like the old Remote answers. */
export type RemoteResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { message: string } }

export type { BalancePillProps } from './BalancePill.tsx'

/**
 * Required services for locale registration and the header-utility
 * contribution.
 *
 * `remote` is declared only for its *event* face (credential and provider
 * changes refetch immediately). It is no longer part of the data path, and its
 * absence no longer disables the capsule — see the guard inside `apply`.
 */
export const inject = ['slots', 'locale', 'remote']

/**
 * Call one on-demand route and always resolve — never reject.
 *
 * Three layers, and skipping any of them has a known failure mode:
 *   1. transport — a non-2xx (401 from the fence, 404 from an unarmed route)
 *      must become a readable reason instead of a JSON parse error;
 *   2. envelope — `ok` decides whether `value` may be read at all;
 *   3. payload — the capsules type-check every field they render, so a
 *      half-shaped reply degrades to "no figure" rather than a blank panel.
 * @param route - absolute path of the registered route.
 * @param signal - aborts a superseded read.
 * @returns the envelope, with a failure synthesized on any throw.
 */
async function callRoute<T>(route: string, signal?: AbortSignal): Promise<RemoteResult<T>> {
  try {
    const response = await fetch(route, {
      method: 'POST',
      ...(signal === undefined ? {} : { signal }),
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    if (!response.ok) {
      return { ok: false, error: { message: `${route} answered HTTP ${String(response.status)}` } }
    }
    return await response.json() as RemoteResult<T>
  } catch (error: unknown) {
    return { ok: false, error: { message: error instanceof Error ? error.message : String(error) } }
  }
}

/**
 * Client plugin body: register the dictionaries and the session-header
 * balance capsule, and bump an invalidation tick on every pushed event that
 * can change the provider's account state so the capsule refetches without
 * waiting for the next poll tick.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // Compatibility guard. Three failure modes have to be absorbed here rather
  // than at render time:
  //   1. dsh's Context guard rejects an *undeclared* property read, so a renamed
  //      Remote namespace surfaces as `cannot get property "remote.llm" without
  //      inject` the moment the query callback runs — inside the slot.
  //   2. A declared-but-absent face throws from the same guard instead of
  //      resolving to `undefined`, hence the try/catch around the probe.
  //   3. A host release may downgrade a face to something without the method we
  //      need, hence the per-member `typeof` checks.
  // Any of these escaping into `slots.register`'s render path takes down the
  // whole `conversation.session.header.utilities` slot (dsh reports
  // `slot entry crashed`), which would hide the other session header tools too.
  // So probe every face up front and degrade to "no capsule" with one warning.
  // Note the deliberate absence of any `remote.llm.balance` probe: the Host's
  // membership denominator used to be the platform; it is now the same-origin
  // Host route registered by this plugin's node half, which needs nothing from
  // `ctx.remote` to answer. `remote` is used below only for its *event* face, so
  // a profile without it still gets the pill — just without instant invalidation.
  let ready = false
  try {
    const slots = ctx.slots as unknown as { inject?: unknown } | undefined
    const locale = ctx.locale as unknown as { register?: unknown; bind?: unknown } | undefined
    ready = typeof slots?.inject === 'function'
      && typeof locale?.register === 'function'
      && typeof locale?.bind === 'function'
  } catch {
    ready = false
  }
  if (!ready) {
    console.warn(
      '[ui-balance] required client services unavailable (slots / locale); balance capsule disabled',
    )
    return
  }

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-balance: dictionaries')

  // One observable tick source: the component re-fetches when the tick moves.
  // A plain counter is enough — only the fact of a change matters, not its
  // content (the host is the single source of truth for the snapshot).
  let tick = 0
  const listeners = new Set<() => void>()
  const tickStore: HostObservable<number> = {
    getSnapshot: () => tick,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  const bump = (): void => {
    tick += 1
    for (const listener of [...listeners]) {
      // A throwing subscriber must not break the emitter (same containment
      // discipline as the seam's own listener fan-outs).
      try {
        listener()
      } catch {
        /* contained */
      }
    }
  }

  // Registration-time copy: freshness rides the locale revision like the
  // settings surfaces' inject faces.
  const t = ctx.locale.bind(NS) as BalanceInjected['t']

  // Pushed invalidations converge every open surface without polling faster
  // than the cadence: credential writes, provider topology changes, and
  // connection resets all refetch immediately. Optional — without `remote` the
  // capsule still refreshes on its own cadence and on focus/visibility.
  try {
    const remote = ctx.remote as unknown as { $on?: (event: string, cb: () => void) => () => void } | undefined
    if (typeof remote?.$on === 'function') {
      ctx.effect(() => {
        const disposers = [
          remote.$on!('credentials/reference-updated', bump),
          remote.$on!('llm/adapters-updated', bump),
          ctx.on('connection/reset', bump),
        ]
        return () => { for (const dispose of disposers) dispose() }
      }, 'ui-balance: pushed invalidations')
    }
  } catch {
    /* contained: invalidation is an optimization, not a requirement */
  }

  // The balance snapshot arrives over this plugin's own same-origin Host route
  // rather than a Host Remote: the Platform endpoint answers no cross-origin
  // reads, and the API key must stay in the Host process. The reply keeps the
  // historical `RemoteResult` envelope, so the capsules need no change.
  const query = (signal?: AbortSignal): Promise<RemoteResult<LlmBalanceView>> =>
    callRoute<LlmBalanceView>(BALANCE_ROUTE, signal)

  // Same envelope, same route discipline — a different upstream and a
  // different signer live entirely in the node half.
  const aliyunQuery = (signal?: AbortSignal): Promise<RemoteResult<AliyunSnapshot>> =>
    callRoute<AliyunSnapshot>(ALIYUN_ROUTE, signal)

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'api-balance',
    order: 10,
    inject: (_sessionId) => ({ query, t, hooks: { balance: tickStore } }),
  }, BalancePill))

  // Second, independent entry. Registered through its own `inject` call rather
  // than a second `register` inside the one above, so a failure to place this
  // capsule cannot take the DeepSeek capsule with it (and vice versa): dsh
  // reports a crashed slot entry per entry, not per plugin.
  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'aliyun-quota',
    order: 11,
    inject: (_sessionId) => ({ query: aliyunQuery, t, hooks: { aliyun: tickStore } }),
  }, AliyunPill))
}
