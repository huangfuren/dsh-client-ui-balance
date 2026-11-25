window.__ModuleLoader__.load({
	id: "dsh-client-ui-balance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:D:\deepseek\deepseek-harness-master\packages\client\ui-balance\src\client\BalancePill.module.css.mjs
		const css = ".npqr1q_root{font-size:12px;line-height:18px;display:inline-flex;position:relative}.npqr1q_pill{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-floating-fill);max-width:220px;min-height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;text-overflow:ellipsis;border-radius:6px;align-items:center;gap:6px;padding:3px 8px;display:inline-flex;overflow:hidden}.npqr1q_pill:hover,.npqr1q_pill:focus-visible{background:var(--dsw-alias-button-floating-hover);border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}.npqr1q_amount{text-overflow:ellipsis;font-variant-numeric:tabular-nums;font-weight:500;overflow:hidden}.npqr1q_dot{background:var(--dsw-alias-state-success-primary);border-radius:50%;flex:none;width:8px;height:8px}.npqr1q_dot[data-state=warn]{background:var(--dsw-alias-state-warn-primary)}.npqr1q_dot[data-state=error]{background:var(--dsw-alias-state-error-primary)}.npqr1q_dot[data-state=muted]{background:var(--dsw-alias-label-caption)}.npqr1q_panel{z-index:30;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);width:280px;max-width:calc(100vw - 24px);color:var(--dsw-alias-label-primary);border-radius:10px;padding:10px 12px;position:absolute;top:calc(100% + 6px);right:0;box-shadow:0 6px 20px #00000024}.npqr1q_panelHeader{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.npqr1q_panelTitle{font-weight:600}.npqr1q_iconButton{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:2px 6px;line-height:1}.npqr1q_iconButton:hover,.npqr1q_iconButton:focus-visible{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.npqr1q_statusRow{align-items:center;gap:6px;margin-bottom:8px;display:flex}.npqr1q_rows{margin:0;padding:0;list-style:none}.npqr1q_row{border-top:1px solid var(--dsw-alias-border-l1);grid-template-columns:auto 1fr;align-items:baseline;gap:2px 8px;padding:6px 0;display:grid}.npqr1q_rowCurrency{color:var(--dsw-alias-label-tertiary)}.npqr1q_rowValue{text-align:right;font-variant-numeric:tabular-nums}.npqr1q_rowBreakdown{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;grid-column:1/-1;overflow:hidden}.npqr1q_panelFooter{border-top:1px solid var(--dsw-alias-border-l1);align-items:center;gap:10px;margin-top:8px;padding-top:8px;display:flex}.npqr1q_meta{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.npqr1q_meta:first-child{flex:1}.npqr1q_muted{color:var(--dsw-alias-label-tertiary);margin:4px 0}.npqr1q_errorBlock{margin:4px 0}.npqr1q_errorText{color:var(--dsw-alias-state-error-primary);margin:0 0 2px}.npqr1q_errorDetail{color:var(--dsw-alias-label-tertiary);word-break:break-word;margin:0}.npqr1q_refresh{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-floating-fill);color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;flex:none;padding:2px 8px}.npqr1q_refresh:hover,.npqr1q_refresh:focus-visible{background:var(--dsw-alias-button-floating-hover);color:var(--dsw-alias-label-primary)}.npqr1q_refresh:disabled{opacity:.6;cursor:default}.npqr1q_usageLink{color:var(--dsw-alias-label-secondary);align-items:center;gap:4px;margin-top:8px;font-size:12px;line-height:18px;text-decoration:none;display:inline-flex}.npqr1q_usageLink:hover,.npqr1q_usageLink:focus-visible{color:var(--dsw-alias-label-primary);text-decoration:underline}";
		const tagId = "dsh-client-ui-balance/BalancePill.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-ui-balance";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var BalancePill_module_css_default = {
			"amount": "npqr1q_amount",
			"dot": "npqr1q_dot",
			"errorBlock": "npqr1q_errorBlock",
			"errorDetail": "npqr1q_errorDetail",
			"errorText": "npqr1q_errorText",
			"iconButton": "npqr1q_iconButton",
			"meta": "npqr1q_meta",
			"muted": "npqr1q_muted",
			"panel": "npqr1q_panel",
			"panelFooter": "npqr1q_panelFooter",
			"panelHeader": "npqr1q_panelHeader",
			"panelTitle": "npqr1q_panelTitle",
			"pill": "npqr1q_pill",
			"refresh": "npqr1q_refresh",
			"root": "npqr1q_root",
			"row": "npqr1q_row",
			"rowBreakdown": "npqr1q_rowBreakdown",
			"rowCurrency": "npqr1q_rowCurrency",
			"rowValue": "npqr1q_rowValue",
			"rows": "npqr1q_rows",
			"statusRow": "npqr1q_statusRow",
			"usageLink": "npqr1q_usageLink"
		};
		//#endregion
		//#region lib/types/client/BalancePill.js
		/**
		* Session-header utility entry: a compact balance capsule beside the session's
		* other header tools, refreshed on a fixed poll cadence plus
		* visibility/focus changes and pushed invalidations (credential/topology/
		* connection events). Clicking expands a small panel with the per-currency
		* breakdown, availability, and a manual refresh. Living in the header's flex
		* row keeps it from ever overlapping the neighboring session tools.
		*/
		/** Poll cadence for the provider account snapshot. */
		const POLL_INTERVAL_MS = 6e4;
		/** Abort one balance query that has not settled in time. */
		const QUERY_TIMEOUT_MS = 15e3;
		/**
		* Format one provider decimal with the currency when the code is a valid
		* Intl currency; otherwise fall back to `CODE value` so a bespoke provider
		* currency never throws.
		*/
		function formatAmount(value, currency) {
			try {
				return new Intl.NumberFormat(void 0, {
					style: "currency",
					currency,
					currencyDisplay: "narrowSymbol"
				}).format(Number(value));
			} catch {
				return `${currency} ${value}`;
			}
		}
		/**
		* The header-utility entry. Renders a capsule with the primary amount (or a
		* muted unsupported/error word) and a popover with the full picture.
		* @param props - runtime share plus the injected query/copy/tick face.
		*/
		function BalancePill({ query, t, useBalance }) {
			const tick = useBalance((snapshot) => snapshot);
			const [view, setView] = (0, react.useState)(void 0);
			const [error, setError] = (0, react.useState)(void 0);
			const [loading, setLoading] = (0, react.useState)(true);
			const [open, setOpen] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			const seq = (0, react.useRef)(0);
			const refresh = (0, react.useCallback)(() => {
				const request = ++seq.current;
				setLoading(true);
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
				query(controller.signal).then((response) => {
					if (request !== seq.current) return;
					clearTimeout(timer);
					if (response.ok) {
						setView(response.value);
						setError(void 0);
					} else {
						setView(void 0);
						setError(response.error.message);
					}
					setLoading(false);
				}).catch(() => {
					if (request !== seq.current) return;
					clearTimeout(timer);
					setLoading(false);
				});
			}, [query]);
			(0, react.useEffect)(() => {
				refresh();
				const interval = setInterval(refresh, POLL_INTERVAL_MS);
				const onVisible = () => {
					if (document.visibilityState === "visible") refresh();
				};
				document.addEventListener("visibilitychange", onVisible);
				window.addEventListener("focus", onVisible);
				return () => {
					seq.current += 1;
					clearInterval(interval);
					document.removeEventListener("visibilitychange", onVisible);
					window.removeEventListener("focus", onVisible);
				};
			}, [refresh, tick]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", closeOutside);
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("pointerdown", closeOutside);
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [open]);
			const supported = view?.supported === true;
			const primary = supported ? view?.balances?.[0] : void 0;
			const pillLabel = loading && view === void 0 && error === void 0 ? t("pill.loading") : error !== void 0 ? t("pill.error") : supported && primary !== void 0 ? formatAmount(primary.totalBalance, primary.currency) : t("pill.unsupported");
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: BalancePill_module_css_default.root,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: BalancePill_module_css_default.pill,
					"aria-label": t("pill.aria"),
					"aria-expanded": open,
					title: error ?? t("pill.aria"),
					onClick: () => setOpen((current) => !current),
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: BalancePill_module_css_default.dot,
						"data-state": error !== void 0 ? "error" : supported ? view?.available === true ? "ok" : "warn" : "muted"
					}), (0, react_jsx_runtime.jsx)("span", {
						className: BalancePill_module_css_default.amount,
						children: pillLabel
					})]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: BalancePill_module_css_default.panel,
					role: "dialog",
					"aria-label": t("panel.title"),
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: BalancePill_module_css_default.panelHeader,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: BalancePill_module_css_default.panelTitle,
								children: t("panel.title")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: BalancePill_module_css_default.iconButton,
								"aria-label": t("panel.close"),
								onClick: () => setOpen(false),
								children: "✕"
							})]
						}),
						loading && view === void 0 && error === void 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: BalancePill_module_css_default.muted,
							children: t("panel.refreshing")
						}) : null,
						error !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
							className: BalancePill_module_css_default.errorBlock,
							children: [(0, react_jsx_runtime.jsx)("p", {
								className: BalancePill_module_css_default.errorText,
								children: t("panel.error")
							}), (0, react_jsx_runtime.jsx)("p", {
								className: BalancePill_module_css_default.errorDetail,
								children: error
							})]
						}) : null,
						!supported && error === void 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: BalancePill_module_css_default.muted,
							children: view !== void 0 && view.provider.length === 0 ? t("panel.noProviders") : t("panel.unsupported")
						}) : null,
						supported && view !== void 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: BalancePill_module_css_default.statusRow,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: BalancePill_module_css_default.dot,
									"data-state": view.available === true ? "ok" : "warn"
								}), (0, react_jsx_runtime.jsx)("span", { children: view.available === true ? t("panel.available") : t("panel.unavailable") })]
							}),
							view.balances !== void 0 && view.balances.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
								className: BalancePill_module_css_default.rows,
								children: view.balances.map((entry) => (0, react_jsx_runtime.jsxs)("li", {
									className: BalancePill_module_css_default.row,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: BalancePill_module_css_default.rowCurrency,
											children: entry.currency
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: BalancePill_module_css_default.rowValue,
											children: formatAmount(entry.totalBalance, entry.currency)
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: BalancePill_module_css_default.rowBreakdown,
											children: [entry.grantedBalance === void 0 ? void 0 : `${t("panel.granted")} ${formatAmount(entry.grantedBalance, entry.currency)}`, entry.toppedUpBalance === void 0 ? void 0 : `${t("panel.toppedUp")} ${formatAmount(entry.toppedUpBalance, entry.currency)}`].filter((part) => part !== void 0).join(" · ")
										})
									]
								}, entry.currency))
							}) : (0, react_jsx_runtime.jsx)("p", {
								className: BalancePill_module_css_default.muted,
								children: t("panel.unsupported")
							}),
							(0, react_jsx_runtime.jsxs)("footer", {
								className: BalancePill_module_css_default.panelFooter,
								children: [
									(0, react_jsx_runtime.jsxs)("span", {
										className: BalancePill_module_css_default.meta,
										children: [
											t("panel.provider"),
											": ",
											view.provider
										]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: BalancePill_module_css_default.meta,
										children: view.fetchedAt === void 0 ? "" : t("panel.updatedAt", { time: new Date(view.fetchedAt).toLocaleTimeString() })
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: BalancePill_module_css_default.refresh,
										disabled: loading,
										onClick: refresh,
										children: loading ? t("panel.refreshing") : t("panel.refresh")
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("a", {
								className: BalancePill_module_css_default.usageLink,
								href: "https://platform.deepseek.com/usage",
								target: "_blank",
								rel: "noreferrer noopener",
								title: "https://platform.deepseek.com/usage",
								children: [t("panel.usagePage"), " ↗"]
							})
						] }) : null
					]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/AliyunPill.js
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
		/**
		* Coupon state moves on the hour at best, and every tick costs two signed BSS
		* calls; the Host already caches for a minute, so two minutes here is still
		* comfortably fresher than reality.
		*/
		const ALIYUN_POLL_INTERVAL_MS = 12e4;
		/** Abort one quota query that has not settled in time. */
		const ALIYUN_QUERY_TIMEOUT_MS = 15e3;
		/**
		* Render an ISO timestamp as a local calendar date, leaving anything
		* unparseable untouched rather than showing `Invalid Date`.
		*/
		function formatDate(iso) {
			const date = new Date(iso);
			return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString();
		}
		/**
		* Whole days from now until an ISO timestamp, floored at zero.
		*/
		function daysUntil(iso) {
			const date = new Date(iso);
			if (Number.isNaN(date.getTime())) return void 0;
			return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 864e5));
		}
		/**
		* The Aliyun header-utility entry.
		* @param props - runtime share plus the injected query/copy/tick face.
		*/
		function AliyunPill({ query, t, useAliyun }) {
			const tick = useAliyun((snapshot) => snapshot);
			const [view, setView] = (0, react.useState)(void 0);
			const [error, setError] = (0, react.useState)(void 0);
			const [loading, setLoading] = (0, react.useState)(true);
			const [open, setOpen] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			const seq = (0, react.useRef)(0);
			const refresh = (0, react.useCallback)(() => {
				const request = ++seq.current;
				setLoading(true);
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), ALIYUN_QUERY_TIMEOUT_MS);
				query(controller.signal).then((response) => {
					if (request !== seq.current) return;
					clearTimeout(timer);
					if (response.ok) {
						setView(response.value);
						setError(void 0);
					} else {
						setView(void 0);
						setError(response.error.message);
					}
					setLoading(false);
				}).catch(() => {
					if (request !== seq.current) return;
					clearTimeout(timer);
					setLoading(false);
				});
			}, [query]);
			(0, react.useEffect)(() => {
				refresh();
				const interval = setInterval(refresh, ALIYUN_POLL_INTERVAL_MS);
				const onVisible = () => {
					if (document.visibilityState === "visible") refresh();
				};
				document.addEventListener("visibilitychange", onVisible);
				window.addEventListener("focus", onVisible);
				return () => {
					seq.current += 1;
					clearInterval(interval);
					document.removeEventListener("visibilitychange", onVisible);
					window.removeEventListener("focus", onVisible);
				};
			}, [refresh, tick]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", closeOutside);
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("pointerdown", closeOutside);
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [open]);
			const configured = view?.configured === true;
			const currency = view?.currency ?? "CNY";
			const couponBalance = view?.couponBalance;
			const pillLabel = loading && view === void 0 && error === void 0 ? t("pill.loading") : error !== void 0 ? t("pill.error") : !configured ? t("aliyun.pill.unconfigured") : couponBalance !== void 0 ? `☁ ${formatAmount(couponBalance, currency)}` : t("aliyun.pill.noCoupon");
			// Precomputed so the JSX below stays a tree instead of a trio of nested
			// ternaries — the same expression, just readable.
			const couponMeta = view === void 0 ? "" : [view.couponNominal !== void 0 ? t("aliyun.panel.couponMeta", {
				nominal: formatAmount(view.couponNominal, currency),
				count: String(view.couponCount ?? 0)
			}) : void 0, view.couponExpiry === void 0 ? void 0 : daysUntil(view.couponExpiry) === void 0 ? t("aliyun.panel.expiryDate", { date: formatDate(view.couponExpiry) }) : t("aliyun.panel.expiry", {
				date: formatDate(view.couponExpiry),
				days: String(daysUntil(view.couponExpiry))
			})].filter((part) => part !== void 0).join(" · ");
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: BalancePill_module_css_default.root,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: BalancePill_module_css_default.pill,
					"aria-label": t("aliyun.pill.aria"),
					"aria-expanded": open,
					title: error ?? (configured ? t("aliyun.pill.aria") : t("aliyun.panel.hint")),
					onClick: () => setOpen((current) => !current),
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: BalancePill_module_css_default.dot,
						"data-state": error !== void 0 ? "error" : configured ? "ok" : "muted"
					}), (0, react_jsx_runtime.jsx)("span", {
						className: BalancePill_module_css_default.amount,
						children: pillLabel
					})]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: BalancePill_module_css_default.panel,
					role: "dialog",
					"aria-label": t("aliyun.panel.title"),
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: BalancePill_module_css_default.panelHeader,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: BalancePill_module_css_default.panelTitle,
								children: t("aliyun.panel.title")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: BalancePill_module_css_default.iconButton,
								"aria-label": t("aliyun.panel.close"),
								onClick: () => setOpen(false),
								children: "✕"
							})]
						}),
						loading && view === void 0 && error === void 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: BalancePill_module_css_default.muted,
							children: t("panel.refreshing")
						}) : null,
						error !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
							className: BalancePill_module_css_default.errorBlock,
							children: [(0, react_jsx_runtime.jsx)("p", {
								className: BalancePill_module_css_default.errorText,
								children: t("panel.error")
							}), (0, react_jsx_runtime.jsx)("p", {
								className: BalancePill_module_css_default.errorDetail,
								children: error
							})]
						}) : null,
						error === void 0 && view !== void 0 && !configured ? (0, react_jsx_runtime.jsx)("p", {
							className: BalancePill_module_css_default.muted,
							children: t("aliyun.panel.hint")
						}) : null,
						configured && view !== void 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsxs)("ul", {
								className: BalancePill_module_css_default.rows,
								children: [
									couponBalance !== void 0 ? (0, react_jsx_runtime.jsxs)("li", {
										className: BalancePill_module_css_default.row,
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowCurrency,
												children: t("aliyun.panel.coupon")
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowValue,
												children: formatAmount(couponBalance, currency)
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowBreakdown,
												children: couponMeta
											})
										]
									}) : null,
									view.cashAmount !== void 0 ? (0, react_jsx_runtime.jsxs)("li", {
										className: BalancePill_module_css_default.row,
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowCurrency,
												children: t("aliyun.panel.cash")
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowValue,
												children: formatAmount(view.cashAmount, currency)
											})
										]
									}) : null,
									view.availableAmount !== void 0 && Number(view.availableAmount) > 0 ? (0, react_jsx_runtime.jsxs)("li", {
										className: BalancePill_module_css_default.row,
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowCurrency,
												children: t("aliyun.panel.available")
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: BalancePill_module_css_default.rowValue,
												children: formatAmount(view.availableAmount, currency)
											})
										]
									}) : null
								]
							}),
							couponBalance === void 0 && view.couponError === void 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: BalancePill_module_css_default.muted,
								children: t("aliyun.pill.noCoupon")
							}) : null,
							view.couponError !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
								className: BalancePill_module_css_default.errorBlock,
								children: (0, react_jsx_runtime.jsx)("p", {
									className: BalancePill_module_css_default.errorDetail,
									children: t("aliyun.panel.couponError", { message: view.couponError })
								})
							}) : null,
							(0, react_jsx_runtime.jsxs)("footer", {
								className: BalancePill_module_css_default.panelFooter,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: BalancePill_module_css_default.meta,
									children: t("panel.updatedAt", { time: new Date(view.fetchedAt).toLocaleTimeString() })
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: BalancePill_module_css_default.refresh,
									disabled: loading,
									onClick: refresh,
									children: loading ? t("panel.refreshing") : t("panel.refresh")
								})]
							}),
							(0, react_jsx_runtime.jsxs)("a", {
								className: BalancePill_module_css_default.usageLink,
								href: "https://usercenter2.aliyun.com/finance/coupon",
								target: "_blank",
								rel: "noreferrer noopener",
								title: "https://usercenter2.aliyun.com/finance/coupon",
								children: [t("aliyun.panel.console"), " ↗"]
							})
						] }) : null
					]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `balance` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "balance";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"pill.aria": "API 余额",
			"pill.loading": "查询中…",
			"pill.unsupported": "余额查询不可用",
			"pill.error": "查询失败",
			"panel.title": "API 余额",
			"panel.available": "可用",
			"panel.unavailable": "不可用",
			"panel.total": "总额",
			"panel.granted": "赠送",
			"panel.toppedUp": "充值",
			"panel.provider": "提供方",
			"panel.updatedAt": "更新于 {time}",
			"panel.refresh": "刷新",
			"panel.refreshing": "刷新中…",
			"panel.noProviders": "未配置模型提供方",
			"panel.unsupported": "当前模型提供方不支持余额查询",
			"panel.error": "余额查询失败，请检查 API Key 与网络后重试",
			"panel.close": "关闭余额面板",
			"panel.usagePage": "DeepSeek 官网用量",
			"aliyun.pill.aria": "阿里云额度",
			"aliyun.pill.unconfigured": "未配置 AK",
			"aliyun.pill.noCoupon": "无可用代金券",
			"aliyun.panel.title": "阿里云额度",
			"aliyun.panel.coupon": "代金券",
			"aliyun.panel.couponMeta": "面额 {nominal} · {count} 张",
			"aliyun.panel.expiry": "到期 {date}（还剩 {days} 天）",
			"aliyun.panel.expiryDate": "到期 {date}",
			"aliyun.panel.cash": "现金余额",
			"aliyun.panel.available": "可用额度",
			"aliyun.panel.couponError": "代金券查询失败：{message}",
			"aliyun.panel.hint": "未配置阿里云 AccessKey。在凭据里填入 ALIYUN_ACCESS_KEY_ID 与 ALIYUN_ACCESS_KEY_SECRET（RAM 只读子账号，授权 AliyunBSSReadOnlyAccess）后点刷新。",
			"aliyun.panel.console": "阿里云费用中心",
			"aliyun.panel.close": "关闭阿里云面板"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"pill.aria": "API balance",
			"pill.loading": "Loading…",
			"pill.unsupported": "Balance unavailable",
			"pill.error": "Query failed",
			"panel.title": "API balance",
			"panel.available": "Available",
			"panel.unavailable": "Unavailable",
			"panel.total": "Total",
			"panel.granted": "Granted",
			"panel.toppedUp": "Topped up",
			"panel.provider": "Provider",
			"panel.updatedAt": "Updated at {time}",
			"panel.refresh": "Refresh",
			"panel.refreshing": "Refreshing…",
			"panel.noProviders": "No model provider is configured",
			"panel.unsupported": "The current provider does not support balance queries",
			"panel.error": "Balance query failed — check the API key and network, then retry",
			"panel.close": "Close balance panel",
			"panel.usagePage": "DeepSeek usage page",
			"aliyun.pill.aria": "Aliyun quota",
			"aliyun.pill.unconfigured": "No AccessKey",
			"aliyun.pill.noCoupon": "No usable coupon",
			"aliyun.panel.title": "Aliyun quota",
			"aliyun.panel.coupon": "Coupons",
			"aliyun.panel.couponMeta": "face value {nominal} · {count} coupon(s)",
			"aliyun.panel.expiry": "expires {date} ({days} days left)",
			"aliyun.panel.expiryDate": "expires {date}",
			"aliyun.panel.cash": "Cash balance",
			"aliyun.panel.available": "Available amount",
			"aliyun.panel.couponError": "Coupon query failed: {message}",
			"aliyun.panel.hint": "No Aliyun AccessKey yet. Store ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET as credentials (a read-only RAM user with AliyunBSSReadOnlyAccess), then refresh.",
			"aliyun.panel.console": "Aliyun billing center",
			"aliyun.panel.close": "Close Aliyun panel"
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Same-origin route registered by this package's node half. Platform's own
		* endpoint answers no cross-origin reads and must never see the API key, so the
		* Host proxies it here.
		*/
		/**
		* Routes registered by the node half; both declarations are kept identical by
		* construction, because a client plugin may not import host values (the build's
		* purity gate rejects it, and two drifting copies would fail at runtime).
		*
		* They live under `/api/`, the host's authenticated fence, and answer `POST`
		* with a buffered body -- the seam's convention for on-demand reads.
		*/
		const BALANCE_ROUTE = "/api/dsh-client-ui-balance/balance";
		/**
		* The Aliyun quota route, also registered by the node half.
		*
		* Separate from `BALANCE_ROUTE` because it is a separate read of a separate
		* service: mixing them would make one provider's outage blank the other.
		*/
		const ALIYUN_ROUTE = "/api/dsh-client-ui-balance/aliyun";
		/** Required services for locale registration and the header-utility contribution. */
		const inject = [
			"slots",
			"locale",
			"remote"
		];
		/**
		* Client plugin body: register the dictionaries and the session-header
		* balance capsule, and bump an invalidation tick on every pushed event that
		* can change the provider's account state so the capsule refetches without
		* waiting for the next poll tick.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			// Compatibility guard: probe every face up front and degrade to
			// "no capsule" with one warning. A throw inside the slot render path
			// would take down the whole
			// 'conversation.session.header.utilities' slot (dsh reports
			// `slot entry crashed`), hiding the other session header tools too.
			// Deliberately probes NO remote.llm.balance: the balance snapshot now comes
			// from this package's own same-origin Host route, which needs nothing from
			// ctx.remote. `remote` is used below only for its event face, so a profile
			// without it still shows the pill, minus instant invalidation.
			let ready = false;
			try {
				const slots = ctx.slots;
				const locale = ctx.locale;
				ready = typeof slots?.inject === "function" && typeof locale?.register === "function" && typeof locale?.bind === "function";
			} catch {
				ready = false;
			}
			if (!ready) {
				console.warn("[ui-balance] required client services unavailable (slots / locale); balance capsule disabled");
				return;
			}
			// Compatibility guard #2: the faces probed above can still throw when called
			// (a renamed method signature, a service that changed shape between probe and
			// use). Wrap the whole activation so any such failure degrades to "no capsule"
			// instead of failing the client module load.
			try {
				ctx.effect(() => ctx.locale.register(NS, {
					zh,
					en
				}), "ui-balance: dictionaries");
				let tick = 0;
				const listeners = /* @__PURE__ */ new Set();
				const tickStore = {
					getSnapshot: () => tick,
					subscribe: (listener) => {
						listeners.add(listener);
						return () => {
							listeners.delete(listener);
						};
					}
				};
				const bump = () => {
					tick += 1;
					for (const listener of [...listeners]) try {
						listener();
					} catch {}
				};
				const t = ctx.locale.bind(NS);
				// Optional: without `remote` the capsule still refreshes on its own
				// cadence and on focus/visibility, so a missing event face must not
				// cost the whole entry (nor throw inside the slot render path).
				try {
					const remote = ctx.remote;
					if (typeof remote?.$on === "function") ctx.effect(() => {
						const disposers = [
							remote.$on("credentials/reference-updated", bump),
							remote.$on("llm/adapters-updated", bump),
							ctx.on("connection/reset", bump)
						];
						return () => {
							for (const dispose of disposers) dispose();
						};
					}, "ui-balance: pushed invalidations");
				} catch {}
				// Now answered by this package's own Host route: Platform allows no
				// cross-origin reads, and the API key must not reach the page. The reply
				// keeps the historical RemoteResult envelope, so BalancePill is unchanged.
				/**
				* Call one on-demand route and always resolve -- never reject.
				*
				* Three layers, and skipping any of them has a known failure mode:
				*   1. transport -- a non-2xx (401 from the fence, 404 from an unarmed
				*      route) must become a readable reason instead of a JSON parse error;
				*   2. envelope -- `ok` decides whether `value` may be read at all;
				*   3. payload -- the capsules type-check every field they render, so a
				*      half-shaped reply degrades to "no figure" rather than a blank panel.
				*/
				const callRoute = async (route, signal) => {
					try {
						const response = await fetch(route, {
							method: "POST",
							...(signal === void 0 ? {} : { signal }),
							headers: { "content-type": "application/json" },
							body: "{}"
						});
						if (!response.ok) return {
							ok: false,
							error: { message: `${route} answered HTTP ${String(response.status)}` }
						};
						return await response.json();
					} catch (error) {
						return {
							ok: false,
							error: { message: error instanceof Error ? error.message : String(error) }
						};
					}
				};
				const query = (signal) => callRoute(BALANCE_ROUTE, signal);
				// Same envelope, same route discipline -- a different upstream and a
				// different signer live entirely in the node half.
				const aliyunQuery = (signal) => callRoute(ALIYUN_ROUTE, signal);
				ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
					name: "conversation.session.header.utilities",
					id: "api-balance",
					order: 10,
					inject: (_sessionId) => ({
						query,
						t,
						hooks: { balance: tickStore }
					})
				}, BalancePill));
				// Second, independent entry. Registered through its own `inject` call
				// rather than a second `register` inside the one above, so a failure to
				// place this capsule cannot take the DeepSeek capsule with it (and vice
				// versa): dsh reports a crashed slot entry per entry, not per plugin.
				ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
					name: "conversation.session.header.utilities",
					id: "aliyun-quota",
					order: 11,
					inject: (_sessionId) => ({
						query: aliyunQuery,
						t,
						hooks: { aliyun: tickStore }
					})
				}, AliyunPill));
			} catch (err) {
				console.warn("[ui-balance] activation failed; balance capsule disabled: " + (err && err.message ? err.message : err));
			}
			}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map