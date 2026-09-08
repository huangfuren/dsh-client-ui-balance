/** `balance` namespace dictionaries. */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "balance";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly 'pill.aria': "API 余额";
    readonly 'pill.loading': "查询中…";
    readonly 'pill.unsupported': "余额查询不可用";
    readonly 'pill.error': "查询失败";
    readonly 'panel.title': "API 余额";
    readonly 'panel.available': "可用";
    readonly 'panel.unavailable': "不可用";
    readonly 'panel.total': "总额";
    readonly 'panel.granted': "赠送";
    readonly 'panel.toppedUp': "充值";
    readonly 'panel.provider': "提供方";
    readonly 'panel.updatedAt': "更新于 {time}";
    readonly 'panel.refresh': "刷新";
    readonly 'panel.refreshing': "刷新中…";
    readonly 'panel.noProviders': "未配置模型提供方";
    readonly 'panel.unsupported': "当前模型提供方不支持余额查询";
    readonly 'panel.error': "余额查询失败，请检查 API Key 与网络后重试";
    readonly 'panel.close': "关闭余额面板";
    readonly 'panel.usagePage': "DeepSeek 官网用量";
};
/** English dictionary, key-identical to the Chinese source of truth. */
export declare const en: Record<BalanceKey, string>;
/** Key domain of the `balance` namespace (zh is the source of truth). */
export type BalanceKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map