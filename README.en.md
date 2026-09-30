# @deepseek-ai/dsh-client-ui-balance

[中文](README.md) | English

> ✅ **Status: working** (verified against dsh `0.1.7-rc.2`)

DeepSeek Platform account balance display: contributes one entry to the conversation session-header utility row (`conversation.session.header.utilities`) — a compact capsule beside the session's other header tools — with an expandable detail panel. Living in the header's flex row keeps it from ever overlapping the neighboring session tools.

## Where the data comes from

The balance is read from DeepSeek's own endpoint `GET https://api.deepseek.com/user/balance`.

The browser **cannot** call it directly, for two independent reasons:

1. **Cross-origin** — the endpoint answers no cross-origin reads, so a page-side `fetch` is blocked before it can read a byte.
2. **The key must never reach the page** — Settings stores it in the host's credential service addressed by reference (`DEEPSEEK_API_KEY`); shipping the value to the browser would carry a machine-local secret into every page load.

So this package is split into a **host half and a client half**:

| Half | Responsibility |
| --- | --- |
| **host** (`lib/index.js`) | registers the same-origin route `/balance-rpc`; resolves the key from the credential service per request; queries Platform; ships only the result back |
| **client** (`lib/client.js`) | polls `fetch('/balance-rpc')`; renders the capsule and the detail panel |

The key stays in the host process; only the projected snapshot crosses the boundary.

### What changed from earlier versions

0.3.0 and earlier relied on the host's `remote.llm.balance()` RPC. That capability **has been removed in dsh `0.1.7-rc.2`** (`dsh-llm` now exposes only `listProviders`, `listConfigurableProviders`, and `discoverModels`). Those versions therefore *fail silently*: the compatibility guard probes for the missing method, logs one `[ui-balance]` warning, and returns, so the capsule is never mounted and no UI error ever surfaces.

0.4.0 drops that RPC entirely and serves the data from its own host half, so future changes to internal host interfaces can no longer take it down.

## Prerequisites

Configure the DeepSeek key in dsh under **Settings → Preferences → Model Providers → Edit → API Key** (stored as the `DEEPSEEK_API_KEY` reference). Without a key the route answers `{ supported: false }` and the capsule renders a muted placeholder rather than an error.

## Refresh policy

- A fixed **60-second** poll cadence
- Immediate refresh on window focus and on visibility restore
- Immediate refresh when a pushed invalidation arrives (`credentials/reference-updated`, `llm/adapters-updated`, `connection/reset`) — so a key change shows up without waiting for the next poll tick
- A **15-second** abort per in-flight query; a superseded or unmounted response never overwrites newer state

`remote` is used only for that event face and is no longer part of the data path: without it the capsule loses instant invalidation but keeps updating on its own cadence.

## Panel contents

Clicking the capsule expands availability state, one row per currency (total, granted, and topped-up portions when Platform discloses them), the last-updated time, a manual refresh, and a link to the DeepSeek platform usage page. Escape or a pointer press outside it closes the panel.

## Degradation

| Situation | Behavior |
| --- | --- |
| Required `slots` / `locale` unavailable | one `[ui-balance]` warning, then exit — the capsule is **not mounted** (other tools in the same slot are unaffected) |
| `remote` event face unavailable | capsule works; only instant invalidation is lost |
| No key configured | capsule shows a muted placeholder |
| Bad key / network down / route unregistered | capsule shows its failure state; the raw error text is the diagnosis |

Every failure is contained: nothing here can take down the rest of the `conversation.session.header.utilities` slot.

## Building

`lib/` holds the build output. `tsdown` is **not** in this package's devDependencies, so a standalone checkout cannot build it by default.

When changing behavior, edit **`src/` and `lib/` together**, then **restart dsh** — the host half registers its route at startup.

## Known Limitations

- **DeepSeek only** — the capsule reads the DeepSeek Platform account; other providers configured in dsh never appear here.
- **Single key reference** — it always reads `DEEPSEEK_API_KEY`; there is no option yet to name a different reference.
- **Amounts are Platform strings** — the capsule formats them with `Intl.NumberFormat`; a currency code `Intl` rejects falls back to `CODE value`.
- **Session-header scoped** — the entry renders inside the conversation session header, so a blank session's hidden chrome also hides the capsule (matching the other header tools).

## Model Experience

None: this package renders account state for a human and touches no prompt, message, schema, stream, or tool result. The model's own view of cost stays with the token meter.

### KV Cache effect

None; the package never assembles or sends model requests.
