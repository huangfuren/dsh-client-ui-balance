import type { IApiClient } from '@deepseek-ai/dsh-api-remotes/client';
import type { HostObservable, InjectFace, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
/** Inject face delivered by the plugin: the wire client, copy, and the invalidation tick source. */
export interface BalanceInjected {
    api: IApiClient;
    t: TranslateNS<typeof NS>;
    hooks: {
        balance: HostObservable<number>;
    };
}
/** Full props for the balance header-utility entry. */
export type BalancePillProps = PropsRuntime<'conversation.session.header.utilities'> & InjectFace<BalanceInjected>;
/**
 * The header-utility entry. Renders a capsule with the primary amount (or a
 * muted unsupported/error word) and a popover with the full picture.
 * @param props - runtime share plus the injected api/copy/tick face.
 */
export declare function BalancePill({ api, t, useBalance }: BalancePillProps): import("react").JSX.Element;
//# sourceMappingURL=BalancePill.d.ts.map