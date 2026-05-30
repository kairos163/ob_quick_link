// ===========================
// 平台枚举
// ===========================
export type Platform = 'tencent-docs' | 'feishu-docs' | 'web';

// ===========================
// 链接项数据模型
// ===========================
export interface Link {
  /** 链接标题 */
  title: string;
  /** 链接 URL */
  url: string;
  /** 链接描述 */
  description?: string;
  /** 所属分类名称 */
  category: string;
  /** 平台类型 */
  platform: Platform;
  /** 是否收藏 */
  favorite?: boolean;
  /** 最后更新时间 (YYYY-MM-DD) */
  updated?: string;
}

// ===========================
// 分类数据模型
// ===========================
export interface Category {
  /** 分类名称 */
  name: string;
  /** 分类图标 (emoji) */
  icon: string;
}

// ===========================
// YAML 存储的完整数据结构
// ===========================
export interface AppData {
  /** 分类列表 */
  categories: Category[];
  /** 链接列表 */
  links: Link[];
}

// ===========================
// 筛选状态
// ===========================
export interface FilterState {
  /** 当前平台筛选（"all" 表示全部） */
  platform: 'all' | Platform;
  /** 搜索关键词 */
  searchText: string;
}

// ===========================
// 数据变更监听器
// ===========================
export type DataChangeListener = () => void;
