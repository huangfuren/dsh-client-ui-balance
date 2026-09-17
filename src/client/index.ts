/**
 * Real-time provider API balance plugin, browser half: contributes one
 * `conversation.session.header.utilities` entry — a compact capsule beside the
 * session's other header tools, polling the host's `llm.balance` Remote on a
 * fixed cadence plus visibility/focus changes and pushed invalidations. The host
 * keeps the credential; this package only ever shows the projected snapshot.
 */
// dsh 0.1.5 移除了客户端 `connection.api`：宿主能力改由 `ctx.remote.<namespace>`
// 的 Remote 面提供，信封也从 `{ result: { ok, value } }` 收敛为 `{ ok, value }`。
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { LlmBalanceView, RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import { BalancePill } from './BalancePill.tsx'
import type { BalanceInjected } from './BalancePill.tsx'
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

export type { BalancePillProps } from './BalancePill.tsx'

/**
 * Required services for locale registration, the Remote face, and the
 * header-utility contribution.
 *
 * `remote.llm` must be declared explicitly alongside `remote`: dsh's Context
 * guard rejects `ctx.remote.llm` access with `cannot get property "remote.llm"
 * without inject` unless the exact sub-namespace is named in `inject` (same
 * discipline as `ui-settings-models`, which lists `remote.credentials`,
 * `remote.llm`, and `remote.settings` individually).
 */
export const inject = ['slots', 'locale', 'remote', 'remote.llm']

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
  let ready = false
  try {
    const slots = ctx.slots as unknown as { inject?: unknown } | undefined
    const locale = ctx.locale as unknown as { register?: unknown; bind?: unknown } | undefined
    const remote = ctx.remote as unknown as { $on?: unknown; llm?: { balance?: unknown } } | undefined
    ready = typeof slots?.inject === 'function'
      && typeof locale?.register === 'function'
      && typeof locale?.bind === 'function'
      && typeof remote?.$on === 'function'
      && typeof remote?.llm?.balance === 'function'
  } catch {
    ready = false
  }
  if (!ready) {
    console.warn(
      '[ui-balance] required client services unavailable (slots / locale / remote.llm); balance capsule disabled',
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
  // connection resets all refetch immediately.
  ctx.effect(() => {
    const disposers = [
      ctx.remote.$on('credentials/reference-updated', bump),
      ctx.remote.$on('llm/adapters-updated', bump),
      ctx.on('connection/reset', bump),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'ui-balance: pushed invalidations')

  // The Remote face is read once; the entry receives a plain query callback so
  // the component never reaches back into the plugin's Context. An empty
  // provider asks the first registered route whose adapter can answer.
  const remote = ctx.remote
  const query = (signal?: AbortSignal): Promise<RemoteResult<LlmBalanceView>> =>
    remote.llm.balance('', signal)

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'api-balance',
    order: 10,
    inject: (_sessionId) => ({ query, t, hooks: { balance: tickStore } }),
  }, BalancePill))
}
