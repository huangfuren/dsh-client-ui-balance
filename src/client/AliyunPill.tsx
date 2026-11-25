/**
 * Session-header utility entry for the Aliyun account: a second capsule beside
 * the DeepSeek one, on its own same-origin route.
 *
 * Why a separate entry instead of a field on the existing pill. The two
 * providers share nothing — not the endpoint, not the auth, not even the unit
 * (a currency wallet on one side, a set of expiring vouchers on the other).
 * Folding them into one capsule would force the DeepSeek view to grow a shape
 * it never has, so they stay independent: either one may fail, be absent, or
 * be reconfigured without the other noticing.
 *
 * The headline number is the coupon remainder, because that is the number a
 * student grant is actually made of. The cash wallet is shown underneath and
 * is normally 0.00 — reading it first would show a permanent, misleading zero.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AliyunSnapshot, RemoteResult } from './index.ts'
import { formatAmount } from './BalancePill.tsx'
import type { HostObservable, InjectFace, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'
import css from './BalancePill.module.css'

/**
 * Coupon state moves on the hour at best, and every tick costs two signed BSS
 * calls; the Host already caches for a minute, so two minutes here is still
 * comfortably fresher than reality.
 */
const POLL_INTERVAL_MS = 120_000
/** Abort one quota query that has not settled in time. */
const QUERY_TIMEOUT_MS = 15_000

/** Inject face delivered by the plugin: the quota query, copy, and the invalidation tick. */
export interface AliyunInjected {
  /** One Aliyun quota query. */
  query: (signal?: AbortSignal) => Promise<RemoteResult<AliyunSnapshot>>
  t: TranslateNS<typeof NS>
  hooks: { aliyun: HostObservable<number> }
}

/** Full props for the Aliyun header-utility entry. */
export type AliyunPillProps = PropsRuntime<'conversation.session.header.utilities'> & InjectFace<AliyunInjected>

/**
 * Render an ISO timestamp as a local calendar date, leaving anything
 * unparseable untouched rather than showing `Invalid Date`.
 * @param iso - ISO 8601 timestamp.
 * @returns local date string.
 */
function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString()
}

/**
 * Whole days from now until an ISO timestamp, floored at zero.
 * @param iso - ISO 8601 timestamp.
 * @returns remaining days, or undefined when the timestamp is unusable.
 */
function daysUntil(iso: string): number | undefined {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return undefined
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000))
}

/**
 * The Aliyun header-utility entry.
 * @param props - runtime share plus the injected query/copy/tick face.
 */
export function AliyunPill({ query, t, useAliyun }: AliyunPillProps) {
  const tick = useAliyun(snapshot => snapshot)
  const [view, setView] = useState<AliyunSnapshot | undefined>(undefined)
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
    void query(controller.signal).then((response) => {
      if (request !== seq.current) return
      clearTimeout(timer)
      if (response.ok) {
        setView(response.value)
        setError(undefined)
      } else {
        setView(undefined)
        setError(response.error.message)
      }
      setLoading(false)
    }).catch(() => {
      if (request !== seq.current) return
      clearTimeout(timer)
      setLoading(false)
    })
  }, [query])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
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

  const configured = view?.configured === true
  const currency = view?.currency ?? 'CNY'
  const couponBalance = view?.couponBalance
  const pillLabel = loading && view === undefined && error === undefined
    ? t('pill.loading')
    : error !== undefined
      ? t('pill.error')
      : !configured
        ? t('aliyun.pill.unconfigured')
        : couponBalance !== undefined
          ? `☁ ${formatAmount(couponBalance, currency)}`
          : t('aliyun.pill.noCoupon')

  return (
    <div ref={rootRef} className={css.root}>
      <button
        type="button"
        className={css.pill}
        aria-label={t('aliyun.pill.aria')}
        aria-expanded={open}
        title={error ?? (configured ? t('aliyun.pill.aria') : t('aliyun.panel.hint'))}
        onClick={() => setOpen(current => !current)}
      >
        <span
          className={css.dot}
          data-state={error !== undefined ? 'error' : configured ? 'ok' : 'muted'}
        />
        <span className={css.amount}>{pillLabel}</span>
      </button>
      {open ? (
        <div className={css.panel} role="dialog" aria-label={t('aliyun.panel.title')}>
          <header className={css.panelHeader}>
            <span className={css.panelTitle}>{t('aliyun.panel.title')}</span>
            <button
              type="button"
              className={css.iconButton}
              aria-label={t('aliyun.panel.close')}
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

          {error === undefined && view !== undefined && !configured
            ? <p className={css.muted}>{t('aliyun.panel.hint')}</p>
            : null}

          {configured && view !== undefined
            ? (
              <>
                <ul className={css.rows}>
                  {couponBalance !== undefined
                    ? (
                      <li className={css.row}>
                        <span className={css.rowCurrency}>{t('aliyun.panel.coupon')}</span>
                        <span className={css.rowValue}>{formatAmount(couponBalance, currency)}</span>
                        <span className={css.rowBreakdown}>
                          {[
                            view.couponNominal === undefined
                              ? undefined
                              : t('aliyun.panel.couponMeta', {
                                nominal: formatAmount(view.couponNominal, currency),
                                count: String(view.couponCount ?? 0),
                              }),
                            view.couponExpiry === undefined
                              ? undefined
                              : daysUntil(view.couponExpiry) === undefined
                                ? t('aliyun.panel.expiryDate', { date: formatDate(view.couponExpiry) })
                                : t('aliyun.panel.expiry', {
                                  date: formatDate(view.couponExpiry),
                                  days: String(daysUntil(view.couponExpiry)),
                                }),
                          ].filter((part): part is string => part !== undefined).join(' · ')}
                        </span>
                      </li>
                    )
                    : null}
                  {view.cashAmount !== undefined
                    ? (
                      <li className={css.row}>
                        <span className={css.rowCurrency}>{t('aliyun.panel.cash')}</span>
                        <span className={css.rowValue}>{formatAmount(view.cashAmount, currency)}</span>
                      </li>
                    )
                    : null}
                  {/*
                    Only when it is non-zero. Aliyun's `AvailableAmount` does NOT
                    include coupons (a coupon-funded account answers 0.00 while
                    the coupon holds real money), so rendering that zero next to
                    the coupon figure reads as "you cannot spend anything".
                  */}
                  {view.availableAmount !== undefined && Number(view.availableAmount) > 0
                    ? (
                      <li className={css.row}>
                        <span className={css.rowCurrency}>{t('aliyun.panel.available')}</span>
                        <span className={css.rowValue}>{formatAmount(view.availableAmount, currency)}</span>
                      </li>
                    )
                    : null}
                </ul>
                {couponBalance === undefined && view.couponError === undefined
                  ? <p className={css.muted}>{t('aliyun.pill.noCoupon')}</p>
                  : null}
                {view.couponError !== undefined
                  ? (
                    <div className={css.errorBlock}>
                      <p className={css.errorDetail}>
                        {t('aliyun.panel.couponError', { message: view.couponError })}
                      </p>
                    </div>
                  )
                  : null}
                <footer className={css.panelFooter}>
                  <span className={css.meta}>
                    {t('panel.updatedAt', { time: new Date(view.fetchedAt).toLocaleTimeString() })}
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
                  href="https://usercenter2.aliyun.com/finance/coupon"
                  target="_blank"
                  rel="noreferrer noopener"
                  title="https://usercenter2.aliyun.com/finance/coupon"
                >
                  {t('aliyun.panel.console')} ↗
                </a>
              </>
            )
            : null}
        </div>
      ) : null}
    </div>
  )
}