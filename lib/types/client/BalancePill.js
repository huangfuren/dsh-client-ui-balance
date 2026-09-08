import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Session-header utility entry: a compact balance capsule beside the session's
 * other header tools, refreshed on a fixed poll cadence plus
 * visibility/focus changes and pushed invalidations (credential/topology/
 * connection events). Clicking expands a small panel with the per-currency
 * breakdown, availability, and a manual refresh. Living in the header's flex
 * row keeps it from ever overlapping the neighboring session tools.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import css from './BalancePill.module.css';
/** Poll cadence for the provider account snapshot. */
const POLL_INTERVAL_MS = 60_000;
/** Abort one balance query that has not settled in time. */
const QUERY_TIMEOUT_MS = 15_000;
/**
 * Format one provider decimal with the currency when the code is a valid
 * Intl currency; otherwise fall back to `CODE value` so a bespoke provider
 * currency never throws.
 */
function formatAmount(value, currency) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
        }).format(Number(value));
    }
    catch {
        return `${currency} ${value}`;
    }
}
/**
 * The header-utility entry. Renders a capsule with the primary amount (or a
 * muted unsupported/error word) and a popover with the full picture.
 * @param props - runtime share plus the injected api/copy/tick face.
 */
export function BalancePill({ api, t, useBalance }) {
    const tick = useBalance(snapshot => snapshot);
    const [view, setView] = useState(undefined);
    const [error, setError] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    // Monotonic request sequence: a stale response (superseded by a newer
    // refresh or by unmount) must never overwrite the current state.
    const seq = useRef(0);
    const refresh = useCallback(() => {
        const request = ++seq.current;
        setLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
        void api.llm.balance({}, controller.signal).then((response) => {
            if (request !== seq.current)
                return;
            clearTimeout(timer);
            if (response.result.ok) {
                setView(response.result.value);
                setError(undefined);
            }
            else {
                setView(undefined);
                setError(response.result.error.message);
            }
            setLoading(false);
        }).catch(() => {
            // Aborted by a newer request or by unmount (or a transport failure): the
            // newest request owns the next state, so keep the last snapshot quiet.
            if (request !== seq.current)
                return;
            clearTimeout(timer);
            setLoading(false);
        });
    }, [api]);
    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, POLL_INTERVAL_MS);
        const onVisible = () => {
            if (document.visibilityState === 'visible')
                refresh();
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onVisible);
        return () => {
            // Invalidate any in-flight response before unmount.
            seq.current += 1;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', onVisible);
        };
    }, [refresh, tick]);
    // Click-outside closes the panel; Escape closes it and leaves focus on the pill.
    useEffect(() => {
        if (!open)
            return;
        const closeOutside = (event) => {
            if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('pointerdown', closeOutside);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', closeOutside);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);
    const supported = view?.supported === true;
    const primary = supported ? view?.balances?.[0] : undefined;
    const pillLabel = loading && view === undefined && error === undefined
        ? t('pill.loading')
        : error !== undefined
            ? t('pill.error')
            : supported && primary !== undefined
                ? formatAmount(primary.totalBalance, primary.currency)
                : t('pill.unsupported');
    return (_jsxs("div", { ref: rootRef, className: css.root, children: [_jsxs("button", { type: "button", className: css.pill, "aria-label": t('pill.aria'), "aria-expanded": open, title: error ?? t('pill.aria'), onClick: () => setOpen(current => !current), children: [_jsx("span", { className: css.dot, "data-state": error !== undefined
                            ? 'error'
                            : supported
                                ? (view?.available === true ? 'ok' : 'warn')
                                : 'muted' }), _jsx("span", { className: css.amount, children: pillLabel })] }), open ? (_jsxs("div", { className: css.panel, role: "dialog", "aria-label": t('panel.title'), children: [_jsxs("header", { className: css.panelHeader, children: [_jsx("span", { className: css.panelTitle, children: t('panel.title') }), _jsx("button", { type: "button", className: css.iconButton, "aria-label": t('panel.close'), onClick: () => setOpen(false), children: "\u2715" })] }), loading && view === undefined && error === undefined
                        ? _jsx("p", { className: css.muted, children: t('panel.refreshing') })
                        : null, error !== undefined
                        ? (_jsxs("div", { className: css.errorBlock, children: [_jsx("p", { className: css.errorText, children: t('panel.error') }), _jsx("p", { className: css.errorDetail, children: error })] }))
                        : null, !supported && error === undefined
                        ? (_jsx("p", { className: css.muted, children: view !== undefined && view.provider.length === 0
                                ? t('panel.noProviders')
                                : t('panel.unsupported') }))
                        : null, supported && view !== undefined
                        ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.statusRow, children: [_jsx("span", { className: css.dot, "data-state": view.available === true ? 'ok' : 'warn' }), _jsx("span", { children: view.available === true ? t('panel.available') : t('panel.unavailable') })] }), view.balances !== undefined && view.balances.length > 0
                                    ? (_jsx("ul", { className: css.rows, children: view.balances.map((entry) => (_jsxs("li", { className: css.row, children: [_jsx("span", { className: css.rowCurrency, children: entry.currency }), _jsx("span", { className: css.rowValue, children: formatAmount(entry.totalBalance, entry.currency) }), _jsx("span", { className: css.rowBreakdown, children: [
                                                        entry.grantedBalance === undefined ? undefined : `${t('panel.granted')} ${formatAmount(entry.grantedBalance, entry.currency)}`,
                                                        entry.toppedUpBalance === undefined ? undefined : `${t('panel.toppedUp')} ${formatAmount(entry.toppedUpBalance, entry.currency)}`,
                                                    ].filter((part) => part !== undefined).join(' · ') })] }, entry.currency))) }))
                                    : _jsx("p", { className: css.muted, children: t('panel.unsupported') }), _jsxs("footer", { className: css.panelFooter, children: [_jsxs("span", { className: css.meta, children: [t('panel.provider'), ": ", view.provider] }), _jsx("span", { className: css.meta, children: view.fetchedAt === undefined
                                                ? ''
                                                : t('panel.updatedAt', { time: new Date(view.fetchedAt).toLocaleTimeString() }) }), _jsx("button", { type: "button", className: css.refresh, disabled: loading, onClick: refresh, children: loading ? t('panel.refreshing') : t('panel.refresh') })] }), _jsxs("a", { className: css.usageLink, href: "https://platform.deepseek.com/usage", target: "_blank", rel: "noreferrer noopener", title: "https://platform.deepseek.com/usage", children: [t('panel.usagePage'), " \u2197"] })] }))
                        : null] })) : null] }));
}
//# sourceMappingURL=BalancePill.js.map