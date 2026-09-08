/**
 * Real-time provider API balance plugin, browser half: contributes one
 * `conversation.session.header.utilities` entry — a compact capsule beside the
 * session's other header tools, polling `llm.balance` on a fixed cadence plus
 * visibility/focus changes and pushed invalidations. The host keeps the
 * credential; this package only ever shows the projected snapshot.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import { BalancePill } from './BalancePill.tsx'
import type { BalanceInjected } from './BalancePill.tsx'
import { en, NS, zh, type BalanceKey } from './locales.ts'
// Type-only: pulls the locale plugin's Context merge (ctx.locale), the
// conversation session-header SlotMap merge (ui-conversation), and the
// forwarded-event allowlist (ctx.remote) into this program.
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

/** Required services for locale registration and the header-utility contribution. */
export const inject = ['slots', 'locale', 'connection', 'remote']

/**
 * Client plugin body: register the dictionaries and the session-header
 * balance capsule, and bump an invalidation tick on every pushed event that
 * can change the provider's account state so the capsule refetches without
 * waiting for the next poll tick.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-balance: dictionaries')

  const connection = ctx.get('connection') as ConnectionHandle
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

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'api-balance',
    order: 10,
    inject: (_sessionId) => ({ api: connection.api, t, hooks: { balance: tickStore } }),
  }, BalancePill))
}
