import { Platform } from '../types';

/** 插件注册的视图类型标识 */
export const VIEW_TYPE_QUICK_LINKS = 'quick-links-view';

/** 插件显示名称 */
export const PLUGIN_DISPLAY_NAME = 'Quick Links';

/** 插件图标 (Obsidian 内置图标 ID) */
export const PLUGIN_ICON = 'link';

/** 默认数据文件路径（相对于 Vault 根目录） */
export const DEFAULT_DATA_FILE_PATH = '工作链接导航.md';

/** 平台枚举值列表 */
export const PLATFORM_VALUES: ('all' | Platform)[] = ['all', 'tencent-docs', 'feishu-docs', 'web'];

/** 平台显示名称映射 */
export const PLATFORM_LABELS: Record<string, string> = {
  'all': '全部',
  'tencent-docs': '腾讯文档',
  'feishu-docs': '飞书文档',
  'web': '网页链接',
};

/** 平台对应图标 (emoji) */
export const PLATFORM_ICONS: Record<string, string> = {
  'all': '',
  'tencent-docs': '',
  'feishu-docs': '',
  'web': '',
};

/** 平台筛选 CSS 类名 */
export const PLATFORM_CSS_CLASS: Record<string, string> = {
  'all': 'ql-plat-all',
  'tencent-docs': 'ql-plat-tencent',
  'feishu-docs': 'ql-plat-feishu',
  'web': 'ql-plat-web',
};

/** 平台对应的链接域名关键词（用于自动识别） */
export const PLATFORM_DOMAIN_HINTS: Record<string, string[]> = {
  'tencent-docs': ['docs.qq.com'],
  'feishu-docs': ['feishu.cn', 'larkoffice.com', 'bytedance.net'],
};

/** 搜索防抖延迟（毫秒） */
export const SEARCH_DEBOUNCE_MS = 300;

/** 插件设置 Tab 容器 ID */
export const SETTINGS_CONTAINER_ID = 'quick-links-settings';

/** 视图容器 CSS 前缀 */
export const CSS_PREFIX = 'ql-';

/** 响应式断点：窄屏模式阈值（像素） */
export const NARROW_SCREEN_BREAKPOINT = 700;
