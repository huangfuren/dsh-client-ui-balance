window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-balance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:D:\deepseek\deepseek-harness-master\packages\client\ui-balance\src\client\BalancePill.module.css.mjs
		const css = ".npqr1q_root{font-size:12px;line-height:18px;display:inline-flex;position:relative}.npqr1q_pill{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-floating-fill);max-width:220px;min-height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;text-overflow:ellipsis;border-radius:6px;align-items:center;gap:6px;padding:3px 8px;display:inline-flex;overflow:hidden}.npqr1q_pill:hover,.npqr1q_pill:focus-visible{background:var(--dsw-alias-button-floating-hover);border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}.npqr1q_amount{text-overflow:ellipsis;font-variant-numeric:tabular-nums;font-weight:500;overflow:hidden}.npqr1q_dot{background:var(--dsw-alias-state-success-primary);border-radius:50%;flex:none;width:8px;height:8px}.npqr1q_dot[data-state=warn]{background:var(--dsw-alias-state-warn-primary)}.npqr1q_dot[data-state=error]{background:var(--dsw-alias-state-error-primary)}.npqr1q_dot[data-state=muted]{background:var(--dsw-alias-label-caption)}.npqr1q_panel{z-index:30;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);width:280px;max-width:calc(100vw - 24px);color:var(--dsw-alias-label-primary);border-radius:10px;padding:10px 12px;position:absolute;top:calc(100% + 6px);right:0;box-shadow:0 6px 20px #00000024}.npqr1q_panelHeader{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.npqr1q_panelTitle{font-weight:600}.npqr1q_iconButton{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:2px 6px;line-height:1}.npqr1q_iconButton:hover,.npqr1q_iconButton:focus-visible{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.npqr1q_statusRow{align-items:center;gap:6px;margin-bottom:8px;display:flex}.npqr1q_rows{margin:0;padding:0;list-style:none}.npqr1q_row{border-top:1px solid var(--dsw-alias-border-l1);grid-template-columns:auto 1fr;align-items:baseline;gap:2px 8px;padding:6px 0;display:grid}.npqr1q_rowCurrency{color:var(--dsw-alias-label-tertiary)}.npqr1q_rowValue{text-align:right;font-variant-numeric:tabular-nums}.npqr1q_rowBreakdown{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;grid-column:1/-1;overflow:hidden}.npqr1q_panelFooter{border-top:1px solid var(--dsw-alias-border-l1);align-items:center;gap:10px;margin-top:8px;padding-top:8px;display:flex}.npqr1q_meta{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.npqr1q_meta:first-child{flex:1}.npqr1q_muted{color:var(--dsw-alias-label-tertiary);margin:4px 0}.npqr1q_errorBlock{margin:4px 0}.npqr1q_errorText{color:var(--dsw-alias-state-error-primary);margin:0 0 2px}.npqr1q_errorDetail{color:var(--dsw-alias-label-tertiary);word-break:break-word;margin:0}.npqr1q_refresh{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-floating-fill);color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;flex:none;padding:2px 8px}.npqr1q_refresh:hover,.npqr1q_refresh:focus-visible{background:var(--dsw-alias-button-floating-hover);color:var(--dsw-alias-label-primary)}.npqr1q_refresh:disabled{opacity:.6;cursor:default}.npqr1q_usageLink{color:var(--dsw-alias-label-secondary);align-items:center;gap:4px;margin-top:8px;font-size:12px;line-height:18px;text-decoration:none;display:inline-flex}.npqr1q_usageLink:hover,.npqr1q_usageLink:focus-visible{color:var(--dsw-alias-label-primary);text-decoration:underline}";
		const tagId = "@deepseek-ai/dsh-client-ui-balance/BalancePill.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-balance";
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
		* @param props - runtime share plus the injected api/copy/tick face.
		*/
		function BalancePill({ api, t, useBalance }) {
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
				api.llm.balance({}, controller.signal).then((response) => {
					if (request !== seq.current) return;
					clearTimeout(timer);
					if (response.result.ok) {
						setView(response.result.value);
						setError(void 0);
					} else {
						setView(void 0);
						setError(response.result.error.message);
					}
					setLoading(false);
				}).catch(() => {
					if (request !== seq.current) return;
					clearTimeout(timer);
					setLoading(false);
				});
			}, [api]);
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
			"panel.usagePage": "DeepSeek 官网用量"
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
			"panel.usagePage": "DeepSeek usage page"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services for locale registration and the header-utility contribution. */
		const inject = [
			"slots",
			"locale",
			"connection",
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
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-balance: dictionaries");
			const connection = ctx.get("connection");
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
			ctx.effect(() => {
				const disposers = [
					ctx.remote.$on("credentials/reference-updated", bump),
					ctx.remote.$on("llm/adapters-updated", bump),
					ctx.on("connection/reset", bump)
				];
				return () => {
					for (const dispose of disposers) dispose();
				};
			}, "ui-balance: pushed invalidations");
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "api-balance",
				order: 10,
				inject: (_sessionId) => ({
					api: connection.api,
					t,
					hooks: { balance: tickStore }
				})
			}, BalancePill));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map