//#region lib/types/index.js
/**
* Host half of the balance pill: one same-origin HTTP route that proxies the
* DeepSeek Platform balance query for the browser half.
*
* Why a Host route exists at all. The browser cannot call
* `https://api.deepseek.com/user/balance` itself for two independent reasons:
*
*   1. Cross-origin. The Platform endpoint answers no cross-origin reads, so a
*      fetch from the page fails before it can read a byte. Same-origin is not
*      stylistic here; it is the only way through.
*   2. The key must never reach the page. Settings stores it in the credential
*      service addressed by reference (DEEPSEEK_API_KEY). Shipping the value to
*      the browser half would turn a machine-local secret into part of every
*      page load, so the reference resolves here, in the process that owns it,
*      and only the result crosses back.
*
* Route registration mirrors the discipline learned in the background plugin:
* `webServer` is frequently not available yet when this apply runs, so the
* registration retries on `service-added` and on a bounded poll. Registering
* once and missing silently shows up as a pill that never loads with no error
* anywhere, which is exactly the failure being avoided.
*/
/** Same-origin route the browser half polls. */
const BALANCE_ROUTE = "/balance-rpc";
/**
* Credential reference Settings writes the DeepSeek key under. A plain string is
* used rather than importing `credentialRef`: that helper is brand-only identity
* at runtime, and avoiding the import keeps this half free of a dependency whose
* version may not resolve inside a profile install.
*/
const DEFAULT_KEY_REF = "DEEPSEEK_API_KEY";
/** DeepSeek Platform's own account-balance endpoint. */
const BALANCE_URL = "https://api.deepseek.com/user/balance";
/** Cap one upstream call well below the browser's own request budget. */
const UPSTREAM_TIMEOUT_MS = 15e3;
/**
* Send one JSON response and end it. Kept local so this half depends on no
* shared web helper whose location may move between releases.
* @param res - raw Node response.
* @param status - HTTP status.
* @param body - JSON-serializable payload.
*/
function sendJson(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(payload)
	});
	res.end(payload);
}
/**
* Resolve the DeepSeek key through whichever surface has it.
*
* The credential service is read per request, never captured at apply time: a
* profile-level context does not necessarily present its services during
* startup, and a once-captured undefined stays undefined for the process
* lifetime (observed earlier in the background plugin's storage layer).
* Resolving late also picks up a key the user rotates in Settings without any
* restart.
*
* @param ctx - this plugin's Host context.
* @returns the key, or undefined when Settings has not stored one.
*/
async function resolveApiKey(ctx) {
	const credentials = ctx.get("credentials");
	if (credentials === undefined) return undefined;
	try {
		const hit = await credentials.resolve(DEFAULT_KEY_REF);
		const value = hit?.value?.trim();
		return value === undefined || value.length === 0 ? undefined : value;
	} catch {
		// A failing credential read must not take the route down; report absence.
		return undefined;
	}
}
/**
* Ask Platform for the account snapshot.
* @param ctx - this plugin's Host context.
* @returns the pill-shaped snapshot; supported:false when no key exists.
*/
async function readBalance(ctx) {
	const apiKey = await resolveApiKey(ctx);
	if (apiKey === undefined) return {
		supported: false,
		available: false,
		provider: ""
	};
	const response = await fetch(BALANCE_URL, {
		method: "GET",
		headers: {
			accept: "application/json",
			authorization: `Bearer ${apiKey}`
		},
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`platform balance query failed with HTTP ${String(response.status)}`);
	// Platform's own vocabulary: `is_available` plus `balance_infos[]` of
	// `{currency, total_balance, granted_balance, topped_up_balance}`.
	const data = await response.json();
	const wallets = (data.balance_infos ?? []).flatMap((entry) => {
		if (typeof entry.currency !== "string" || typeof entry.total_balance !== "string") return [];
		return [{
			currency: entry.currency,
			totalBalance: entry.total_balance,
			...(typeof entry.granted_balance === "string" ? { grantedBalance: entry.granted_balance } : {}),
			...(typeof entry.topped_up_balance === "string" ? { toppedUpBalance: entry.topped_up_balance } : {})
		}];
	});
	return {
		supported: true,
		available: data.is_available === true,
		provider: "DeepSeek",
		fetchedAt: new Date().toISOString(),
		...(wallets.length > 0 ? { balances: wallets } : {})
	};
}
/**
* Register the balance route, retrying until the web server exists.
* @param ctx - this plugin's Host context.
*/
function start(ctx) {
	const disposers = [];
	let disposed = false;
	let registered = false;
	ctx.effect(() => () => {
		disposed = true;
		for (const dispose of disposers) dispose();
	}, "ui-balance: host route lifetime");
	const register = () => {
		if (registered || disposed) return;
		const webServer = ctx.get("webServer");
		if (webServer === undefined) return;
		registered = true;
		disposers.push(webServer.register({
			kind: "exact",
			path: BALANCE_ROUTE,
			handler: (req, res) => {
				void (async () => {
					try {
						if (req.method !== "GET" && req.method !== "HEAD") {
							sendJson(res, 405, {
								ok: false,
								error: { message: "method not allowed" }
							});
							return;
						}
						const snapshot = await readBalance(ctx);
						sendJson(res, 200, {
							ok: true,
							value: snapshot
						});
					} catch (error) {
						// Report failures in-band: a non-2xx would leave the pill with
						// nothing to render, while this keeps its existing error
						// affordance ("query failed" plus the reason in the tooltip).
						sendJson(res, 200, {
							ok: false,
							error: { message: error instanceof Error ? error.message : String(error) }
						});
					}
				})();
			}
		}));
		console.info(`[ui-balance] balance route ready at ${BALANCE_ROUTE}`);
	};
	register();
	if (registered || disposed) return;
	ctx.on("service-added", (name) => {
		if (name === "webServer") register();
	});
	let tries = 0;
	const attempt = () => {
		if (disposed || registered) return;
		register();
		tries += 1;
		if (!registered && tries < 40) setTimeout(attempt, 500);
		else if (!registered) console.error("[ui-balance] webServer never became available; balance route not registered");
	};
	setTimeout(attempt, 500);
}
/**
* Host plugin body: proxy the Platform balance query over a same-origin route.
* Wrapped so an unexpected Host change degrades only this plugin — a throw here
* would mark the entry failed and refuse to boot the whole profile.
* @param ctx - this plugin's Host context.
*/
function apply(ctx) {
	try {
		start(ctx);
	} catch (error) {
		console.error(`[ui-balance] host half init failed; balance capsule disabled: ${error instanceof Error ? error.message : String(error)}`);
	}
}
//#endregion
export { apply };
