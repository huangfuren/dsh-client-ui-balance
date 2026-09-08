/**
 * Real-time provider API balance plugin, browser half: contributes one
 * `conversation.session.header.utilities` entry — a compact capsule beside the
 * session's other header tools, polling `llm.balance` on a fixed cadence plus
 * visibility/focus changes and pushed invalidations. The host keeps the
 * credential; this package only ever shows the projected snapshot.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type BalanceKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Provider balance copy. */
        'balance': BalanceKey;
    }
}
export type { BalancePillProps } from './BalancePill.tsx';
/** Required services for locale registration and the header-utility contribution. */
export declare const inject: string[];
/**
 * Client plugin body: register the dictionaries and the session-header
 * balance capsule, and bump an invalidation tick on every pushed event that
 * can change the provider's account state so the capsule refetches without
 * waiting for the next poll tick.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map