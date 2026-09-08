# @deepseek-ai/dsh-client-ui-balance

[中文](README.md) | English

> ⚠️ **Archive notice**
>
> This package depends on the `llm.balance` RPC and the `LlmBalanceView` type.
> As of `@deepseek-ai/dsh-api-remotes@0.1.3-alpha.2` that API is **not yet
> published** — it currently exists only in a local DeepSeek Harness branch.
> Therefore:
>
> - This repository is an **archive / share** snapshot: a standalone checkout
>   cannot typecheck or build it
> - Development happens inside the harness monorepo at
>   `packages/client/ui-balance/`
> - It becomes independently buildable once upstream ships a
>   `dsh-api-remotes` release with the balance capability

Web provider API-balance feature owner: contributes one entry to the conversation session-header utility row (`conversation.session.header.utilities`) — a compact capsule beside the session's other header tools showing the active model provider's account balance, with an expandable detail panel. Living in the header's flex row keeps it from ever overlapping the neighboring session tools. The data arrives through the `llm.balance` RPC, so this package holds no provider state of its own: the host resolves the provider's connection facts and credential, calls the provider's account endpoint, and ships a projected snapshot (never the key) back over the wire.

The capsule refetches on a fixed 60-second cadence, on window focus and visibility restore, and immediately when a pushed invalidation arrives (`credentials/updated`, `llm/adapters-updated`, or a `connection/reset`) — so a key change or provider swap is reflected without waiting for the next poll tick. Each in-flight query carries a 15-second abort so a hung provider never leaves the capsule stale forever; a superseded or unmounted response never overwrites newer state.

The capsule shows the primary balance (first per-currency row) when the provider supports balance queries, a muted word when it does not, and the query failure when the provider refused one — the host's own error text is the diagnosis (bad key, endpoint down). Clicking expands a panel with the availability state, one row per currency (total, granted, and topped-up portions when the provider discloses them), the answering provider route, the last-updated time, a manual refresh, and a link to the DeepSeek platform usage page. The panel closes on Escape or a pointer press outside it. Styling uses theme tokens only; copy goes through the package's own `balance` locale namespace.

## Model Experience

None, as this package renders host-computed provider account state for a human and touches no prompt, message, schema, stream, or tool result. The model's own view of provider costs stays with the token meter.

#### KV Cache effect

None; the package never assembles or sends provider requests.

## Known Limitations and Deferred Work

- **DeepSeek-only account endpoint** — the balance capability is implemented by `llm-deepseek`'s adapter (`GET {baseURL}/user/balance`); providers whose adapters do not implement `queryBalance` answer `supported: false` and the capsule shows a muted state rather than failing.
- **Amounts are provider strings** — the host forwards the provider's decimal strings verbatim and the capsule formats them with `Intl.NumberFormat`; a currency code `Intl` rejects falls back to `CODE value`.
- **The capsule queries the first registered provider that can answer** when no route is named — a deployment with several providers shows one account. A future provider-picker surface could name the route explicitly.
- **Session-header scoped** — the entry renders inside the conversation session header, so a blank session's hidden chrome also hides the balance capsule (matching the other header tools).
