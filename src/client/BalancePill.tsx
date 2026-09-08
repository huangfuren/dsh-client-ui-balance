/**
 * Session-header utility entry: a compact balance capsule beside the session's
 * other header tools, refreshed on a fixed poll cadence plus
 * visibility/focus changes and pushed invalidations (credential/topology/
 * connection events). Clicking expands a small panel with the per-currency
 * breakdown, availability, and a manual refresh. Living in the header's flex
 * row keeps it from ever overlapping the neighboring session tools.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { IApiClient, LlmBalanceView } from '@deepseek-ai/dsh-api-remotes/client'
import type { HostObservable, InjectFace, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'
import css from './BalancePill.module.css'

/** Poll cadence for the provider account snapshot. */
const POLL_INTERVAL_MS = 60_000
/** Abort one balance query that has not settled in time. */
const QUERY_TIMEOUT_MS = 15_000

/** Inject face delivered by the plugin: the wire client, copy, and the invalidation tick source. */
export interface BalanceInjected {
  api: IApiClient
  t: TranslateNS<typeof NS>
  hooks: { balance: HostObservable<number> }
}

/** Full props for the balance header-utility entry. */
export type BalancePillProps = PropsRuntime<'conversation.session.header.utilities'> & InjectFace<BalanceInjected>

/**
 * Format one provider decimal with the currency when the code is a valid
 * Intl currency; otherwise fall back to `CODE value` so a bespoke provider
 * currency never throws.
 */
function formatAmount(value: string, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).format(Number(value))
  } catch {
    return `${currency} ${value}`
  }
}

/**
 * The header-utility entry. Renders a capsule with the primary amount (or a
 * muted unsupported/error word) and a popover with the full picture.
 * @param props - runtime share plus the injected api/copy/tick face.
 */
export function BalancePill({ api, t, useBalance }: BalancePillProps) {
  const tick = useBalance(snapshot => snapshot)
  const [view, setView] = useState<LlmBalanceView | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  // Monotonic request sequence: a stale response (superseded by a newer
  // refresh or by unmount) must never overwrite the current state.
  const seq = useRef(0)

  const refresh = useCallback(() => {
    const request = ++seq.current
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS)
    void api.llm.balance({}, controller.signal).then((response) => {
      if (request !== seq.current) return
      clearTimeout(timer)
      if (response.result.ok) {
        setView(response.result.value)
        setError(undefined)
      } else {
        setView(undefined)
        setError(response.result.error.message)
      }
      setLoading(false)
    }).catch(() => {
      // Aborted by a newer request or by unmount (or a transport failure): the
      // newest request owns the next state, so keep the last snapshot quiet.
      if (request !== seq.current) return
      clearTimeout(timer)
      setLoading(false)
    })
  }, [api])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      // Invalidate any in-flight response before unmount.
      seq.current += 1
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [refresh, tick])

  // Click-outside closes the panel; Escape closes it and leaves focus on the pill.
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const supported = view?.supported === true
  const primary = supported ? view?.balances?.[0] : undefined
  const pillLabel = loading && view === undefined && error === undefined
    ? t('pill.loading')
    : error !== undefined
      ? t('pill.error')
      : supported && primary !== undefined
        ? formatAmount(primary.totalBalance, primary.currency)
        : t('pill.unsupported')

  return (
    <div ref={rootRef} className={css.root}>
      <button
        type="button"
        className={css.pill}
        aria-label={t('pill.aria')}
        aria-expanded={open}
        title={error ?? t('pill.aria')}
        onClick={() => setOpen(current => !current)}
      >
        <span
          className={css.dot}
          data-state={error !== undefined
            ? 'error'
            : supported
              ? (view?.available === true ? 'ok' : 'warn')
              : 'muted'}
        />
        <span className={css.amount}>{pillLabel}</span>
      </button>
      {open ? (
        <div className={css.panel} role="dialog" aria-label={t('panel.title')}>
          <header className={css.panelHeader}>
            <span className={css.panelTitle}>{t('panel.title')}</span>
            <button
              type="button"
              className={css.iconButton}
              aria-label={t('panel.close')}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </header>

          {loading && view === undefined && error === undefined
            ? <p className={css.muted}>{t('panel.refreshing')}</p>
            : null}

          {error !== undefined
            ? (
              <div className={css.errorBlock}>
                <p className={css.errorText}>{t('panel.error')}</p>
                <p className={css.errorDetail}>{error}</p>
              </div>
            )
            : null}

          {!supported && error === undefined
            ? (
              <p className={css.muted}>
                {view !== undefined && view.provider.length === 0
                  ? t('panel.noProviders')
                  : t('panel.unsupported')}
              </p>
            )
            : null}

          {supported && view !== undefined
            ? (
              <>
                <div className={css.statusRow}>
                  <span
                    className={css.dot}
                    data-state={view.available === true ? 'ok' : 'warn'}
                  />
                  <span>
                    {view.available === true ? t('panel.available') : t('panel.unavailable')}
                  </span>
                </div>
                {view.balances !== undefined && view.balances.length > 0
                  ? (
                    <ul className={css.rows}>
                      {view.balances.map((entry) => (
                        <li key={entry.currency} className={css.row}>
                          <span className={css.rowCurrency}>{entry.currency}</span>
                          <span className={css.rowValue}>{formatAmount(entry.totalBalance, entry.currency)}</span>
                          <span className={css.rowBreakdown}>
                            {[
                              entry.grantedBalance === undefined ? undefined : `${t('panel.granted')} ${formatAmount(entry.grantedBalance, entry.currency)}`,
                              entry.toppedUpBalance === undefined ? undefined : `${t('panel.toppedUp')} ${formatAmount(entry.toppedUpBalance, entry.currency)}`,
                            ].filter((part): part is string => part !== undefined).join(' · ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                  : <p className={css.muted}>{t('panel.unsupported')}</p>}
                <footer className={css.panelFooter}>
                  <span className={css.meta}>{t('panel.provider')}: {view.provider}</span>
                  <span className={css.meta}>
                    {view.fetchedAt === undefined
                      ? ''
                      : t('panel.updatedAt', { time: new Date(view.fetchedAt).toLocaleTimeString() })}
                  </span>
                  <button
                    type="button"
                    className={css.refresh}
                    disabled={loading}
                    onClick={refresh}
                  >
                    {loading ? t('panel.refreshing') : t('panel.refresh')}
                  </button>
                </footer>
                <a
                  className={css.usageLink}
                  href="https://platform.deepseek.com/usage"
                  target="_blank"
                  rel="noreferrer noopener"
                  title="https://platform.deepseek.com/usage"
                >
                  {t('panel.usagePage')} ↗
                </a>
              </>
            )
            : null}
        </div>
      ) : null}
    </div>
  )
}
