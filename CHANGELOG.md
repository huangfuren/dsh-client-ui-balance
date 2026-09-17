# Changelog

All notable changes to this package are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.1.1 — 2026-09-17

### Fixed

- **余额胶囊在 dsh 0.1.5-rc.2 上完全不显示。** 本包此前已把宿主调用从
  `connection.api` 迁移到 `ctx.remote.<namespace>`，但 `inject` 只声明了
  `['slots', 'locale', 'remote']`，漏掉子命名空间 `remote.llm`。dsh 的 Context
  守卫按**精确属性名**校验（`vendor/cordis/src/reflect.ts`），未声明即抛
  `cannot get property "remote.llm" without inject`；该异常发生在槽位渲染期，
  于是整个 `conversation.session.header.utilities` 被标记为
  `slot entry crashed`，胶囊不渲染。现已补上 `'remote.llm'`。

### Changed（兼容性增强）

- `apply()` 开头增加一次性服务探测（`slots` / `locale` / `remote.llm`，含
  `$on`、`bind`、`register`、`balance` 成员），任一不可用即打印一条
  `[ui-balance]` 告警并安静退出。异常不再逃逸到槽位渲染路径——宿主未来若
  改名或移除某项能力，胶囊只是消失，**不会**连带拖垮同槽位的其他会话标题栏工具。
  探测用 try/catch 包裹，以覆盖"已声明但宿主未提供"时守卫抛异常的情形。
- 移除已废弃的 `@deepseek-ai/dsh-client-runtime`（`dsh.client.inject`、
  `peerDependencies`、`devDependencies`）：该包在当前 dsh 发行版中已不存在，
  保留它只会让依赖图指向一个无效目标。
- peer / dev 依赖上限 `>=0.1.1-rc.2 <0.2.0` → `<0.3.0`，避免宿主升到 0.2.0 时
  因声明上限而突然失配。
- `react` peer 放宽为 `^18.2.0 || ^19.0.0`。
- README 的"归档说明"作废：`llm.balance` RPC 与 `LlmBalanceView` 自
  `dsh-api-remotes@0.1.5-rc.2` 起已发布，并补充兼容性降级行为与构建说明。

### Verified

- dsh `0.1.5-rc.2` 实测：胶囊节点数 0 → 4，显示 `¥2.55`，`display:flex /
  visible / opacity:1`，位置 `x=1378, y=24`（视口 1500 宽）且未被遮挡；
  `slot entry crashed in 'conversation.session.header.utilities'` 告警消失；
  新增的服务探测未触发降级（说明所需服务全部可用）。

## 0.1.0-rc.5 — 初始导入

- 首个版本：会话标题栏工具区的余额胶囊 + 明细面板，60 秒轮询、焦点/可见性刷新、
  推送失效事件刷新、15 秒查询超时、主题令牌样式、自有 `balance` 语言命名空间。
