/** `balance` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'balance'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'pill.aria': 'API 余额',
  'pill.loading': '查询中…',
  'pill.unsupported': '余额查询不可用',
  'pill.error': '查询失败',
  'panel.title': 'API 余额',
  'panel.available': '可用',
  'panel.unavailable': '不可用',
  'panel.total': '总额',
  'panel.granted': '赠送',
  'panel.toppedUp': '充值',
  'panel.provider': '提供方',
  'panel.updatedAt': '更新于 {time}',
  'panel.refresh': '刷新',
  'panel.refreshing': '刷新中…',
  'panel.noProviders': '未配置模型提供方',
  'panel.unsupported': '当前模型提供方不支持余额查询',
  'panel.error': '余额查询失败，请检查 API Key 与网络后重试',
  'panel.close': '关闭余额面板',
  'panel.usagePage': 'DeepSeek 官网用量',
  // Aliyun capsule. The headline figure is the coupon remainder — a student
  // grant is issued as a cash coupon, so a wallet-first wording would be wrong.
  'aliyun.pill.aria': '阿里云额度',
  'aliyun.pill.unconfigured': '未配置 AK',
  'aliyun.pill.noCoupon': '无可用代金券',
  'aliyun.panel.title': '阿里云额度',
  'aliyun.panel.coupon': '代金券',
  'aliyun.panel.couponMeta': '面额 {nominal} · {count} 张',
  'aliyun.panel.expiry': '到期 {date}（还剩 {days} 天）',
  'aliyun.panel.expiryDate': '到期 {date}',
  'aliyun.panel.cash': '现金余额',
  'aliyun.panel.available': '可用额度',
  'aliyun.panel.couponError': '代金券查询失败：{message}',
  'aliyun.panel.hint': '未配置阿里云 AccessKey。在凭据里填入 ALIYUN_ACCESS_KEY_ID 与 ALIYUN_ACCESS_KEY_SECRET（RAM 只读子账号，授权 AliyunBSSReadOnlyAccess）后点刷新。',
  'aliyun.panel.console': '阿里云费用中心',
  'aliyun.panel.close': '关闭阿里云面板',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<BalanceKey, string> = {
  'pill.aria': 'API balance',
  'pill.loading': 'Loading…',
  'pill.unsupported': 'Balance unavailable',
  'pill.error': 'Query failed',
  'panel.title': 'API balance',
  'panel.available': 'Available',
  'panel.unavailable': 'Unavailable',
  'panel.total': 'Total',
  'panel.granted': 'Granted',
  'panel.toppedUp': 'Topped up',
  'panel.provider': 'Provider',
  'panel.updatedAt': 'Updated at {time}',
  'panel.refresh': 'Refresh',
  'panel.refreshing': 'Refreshing…',
  'panel.noProviders': 'No model provider is configured',
  'panel.unsupported': 'The current provider does not support balance queries',
  'panel.error': 'Balance query failed — check the API key and network, then retry',
  'panel.close': 'Close balance panel',
  'panel.usagePage': 'DeepSeek usage page',
  'aliyun.pill.aria': 'Aliyun quota',
  'aliyun.pill.unconfigured': 'No AccessKey',
  'aliyun.pill.noCoupon': 'No usable coupon',
  'aliyun.panel.title': 'Aliyun quota',
  'aliyun.panel.coupon': 'Coupons',
  'aliyun.panel.couponMeta': 'face value {nominal} · {count} coupon(s)',
  'aliyun.panel.expiry': 'expires {date} ({days} days left)',
  'aliyun.panel.expiryDate': 'expires {date}',
  'aliyun.panel.cash': 'Cash balance',
  'aliyun.panel.available': 'Available amount',
  'aliyun.panel.couponError': 'Coupon query failed: {message}',
  'aliyun.panel.hint': 'No Aliyun AccessKey yet. Store ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET as credentials (a read-only RAM user with AliyunBSSReadOnlyAccess), then refresh.',
  'aliyun.panel.console': 'Aliyun billing center',
  'aliyun.panel.close': 'Close Aliyun panel',
}

/** Key domain of the `balance` namespace (zh is the source of truth). */
export type BalanceKey = keyof typeof zh
