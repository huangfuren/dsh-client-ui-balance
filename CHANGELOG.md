# Changelog

All notable changes to this package are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.4.0 — 2026-09-30

### Fixed

- **余额胶囊在 dsh 0.1.7-rc.2 上再次完全不显示。** 宿主 `packages/llm/llm` 的 Remote 面
  已不再提供 `balance`（现仅暴露 `listProviders` / `listConfigurableProviders` /
  `discoverModels`），且 `@deepseek-ai/dsh-api-remotes` 中已无 `LlmBalanceView` 类型。
  0.3.0 的兼容守卫按设计探测到该缺失，打印
  `[ui-balance] required client services unavailable` 后安静退出 —— 胶囊不挂载、**界面无任何报错**，
  表现为"完全没反应"。

### Changed

- **架构改为 host + client 双半。** 数据不再经由宿主的 `llm.balance` RPC，改由本包自带的
  host 半提供：注册同源路由 `/balance-rpc`，请求时从凭据服务解析 `DEEPSEEK_API_KEY`，
  向 `GET https://api.deepseek.com/user/balance` 查询后回传结果。
  - 这样做的原因是浏览器无法直连该接口：既因为接口不允许跨域读取，也因为 Key 不能下发到页面。
    采用同源中转后，Key 始终留在宿主进程，跨边界的只有投影后的快照。
  - 由此本包不再依赖宿主的任何易变内部接口。
- host 半沿用 `dsh-bg` 的路由注册范式：含 `webServer` 延迟就绪的 `service-added`
  监听与有界轮询兜底。直接在 `apply` 时注册一次会因服务尚未就绪而静默丢失路由
  —— 症状同样是"胶囊永远不显示且无任何报错"。
- 凭据服务按**每次请求**惰性获取（`ctx.get('credentials')`），不在 `apply` 时捕获：
  profile 层上下文在启动期可能尚未提供该服务，一旦捕获到 `undefined` 即永久失效；
  惰性读取也让用户在设置中更换 Key 后无需重启。
- client 半：`inject` 移除 `'remote.llm'`；守卫不再探测 `remote.llm.balance`；
  `remote` 降级为**可选**（仅用于 `credentials/reference-updated`、`llm/adapters-updated`、
  `connection/reset` 三个推送失效事件），缺失时仅丢掉即时刷新，胶囊照常按周期更新。
- 返回信封刻意沿用旧的 `RemoteResult<LlmBalanceView>` 形状
  （`available` / `totalBalance` / `grantedBalance` / `toppedUpBalance`），
  因此 **`BalancePill` 组件未作任何改动**。
- 类型改为本地定义，不再从 `@deepseek-ai/dsh-api-remotes/client` 导入
  `LlmBalanceView`、`RemoteResult`（该包已无这些导出）。
- README（中文默认 + 英文）重写：旧版仍声称依赖 `llm.balance` RPC，英文版甚至停留在
  早期的"归档说明"，均已更新为现行架构。

### Verified

- dsh `0.1.7-rc.2` 实测：界面右上角会话标题栏工具区正常显示余额胶囊。
- 离线：两产物语法通过；模拟 Key + 模拟 Platform 响应，路由注册成功且字段映射正确
  （`is_available` → `available`，`total_balance` / `granted_balance` / `topped_up_balance`
  分别映射为 `totalBalance` / `grantedBalance` / `toppedUpBalance`）。
- 路由基线：改造前 `GET /balance-rpc` 返回 `404`，改造后返回余额 JSON。

## 0.3.0 — 2026-09-17

> 本版本为此后迭代的基线版本。

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
