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
}

/** Key domain of the `balance` namespace (zh is the source of truth). */
export type BalanceKey = keyof typeof zh
