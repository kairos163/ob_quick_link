import { AppData, Category, FilterState, Link } from '../types';
import { PlatformBadge } from '../components/platformBadge';

interface LinkListCallbacks {
  onSelectLink: (originalIndex: number) => void;
  onEditLink: (originalIndex: number) => void;
}

/** 带有原始索引的链接包装 */
interface IndexedLink extends Link {
  _originalIndex: number;
}

/**
 * 左侧链接列表面板
 * 按分类分组，支持折叠/展开
 */
export class LinkListPanel {
  private container: HTMLElement;
  private callbacks: LinkListCallbacks;
  private collapseState: Map<string, boolean> = new Map();
  /** 当前显示的链接原始索引集合 */
  private currentDisplayedIndices: number[] = [];

  constructor(container: HTMLElement, callbacks: LinkListCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  /**
   * 渲染整个列表面板
   */
  render(data: AppData, filter: FilterState, selectedIndex: number): void {
    this.container.empty();
    this.currentDisplayedIndices = [];

    // 赋予原始索引
    let indexedLinks: IndexedLink[] = data.links.map((link, i) => ({
      ...link,
      _originalIndex: i,
    }));

    // 平台筛选
    if (filter.platform !== 'all') {
      indexedLinks = indexedLinks.filter(l => l.platform === filter.platform);
    }

    // 搜索筛选
    if (filter.searchText) {
      const q = filter.searchText.toLowerCase();
      indexedLinks = indexedLinks.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q))
      );
    }

    // 排序：收藏置顶 + 最近更新
    indexedLinks = this.sortLinks(indexedLinks);

    // 记录显示顺序的原始索引
    this.currentDisplayedIndices = indexedLinks.map(l => l._originalIndex);

    // 按分类分组
    const grouped = this.groupByCategory(indexedLinks, data.categories);

    if (grouped.size === 0) {
      this.renderEmptyState();
      return;
    }

    // 渲染分类组
    for (const [categoryName, links] of grouped) {
      const category = data.categories.find(c => c.name === categoryName);
      this.renderCategoryGroup(
        category || { name: categoryName, icon: '📋' },
        links,
        selectedIndex
      );
    }
  }

  /**
   * 高亮选中项（按原始索引）
   */
  highlightSelected(originalIndex: number): void {
    this.container.querySelectorAll('.ql-link-item').forEach(el => {
      el.classList.remove('ql-link-selected');
    });

    // 找到 data-link-index 匹配的项
    const target = this.container.querySelector(
      `.ql-link-item[data-link-index="${originalIndex}"]`
    );
    if (target) {
      target.classList.add('ql-link-selected');
      // 滚动到可见区域
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // ==========================================
  // 内部方法
  // ==========================================

  private renderEmptyState(): void {
    const empty = this.container.createDiv('ql-empty-state');
    const icon = empty.createSpan({ text: '📭', cls: 'ql-empty-icon' });
    empty.createEl('p', { text: '暂无匹配的链接' });
    empty.createEl('p', { text: '点击顶部 "+ 添加链接" 开始使用', cls: 'ql-empty-hint' });
  }

  private renderCategoryGroup(category: Category, links: IndexedLink[], selectedIndex: number): void {
    const group = this.container.createDiv('ql-category-group');

    // 分类标题头
    const header = group.createDiv('ql-category-header');
    const isCollapsed = this.collapseState.get(category.name) ?? false;

    const arrow = header.createSpan('ql-category-arrow');
    arrow.textContent = isCollapsed ? '▶' : '▼';

    const icon = header.createSpan('ql-category-icon');
    icon.textContent = category.icon;

    const name = header.createSpan('ql-category-name');
    name.textContent = category.name;

    const count = header.createSpan('ql-category-count');
    count.textContent = `(${links.length})`;

    header.addEventListener('click', () => {
      const newState = !this.collapseState.get(category.name);
      this.collapseState.set(category.name, newState);
      arrow.textContent = newState ? '▶' : '▼';

      const itemsContainer = group.querySelector('.ql-link-items');
      if (itemsContainer instanceof HTMLElement) {
        itemsContainer.style.display = newState ? 'none' : '';
      }
    });

    const itemsContainer = group.createDiv('ql-link-items');
    if (isCollapsed) {
      itemsContainer.style.display = 'none';
    }

    for (const link of links) {
      this.renderLinkItem(link, itemsContainer, selectedIndex);
    }
  }

  private renderLinkItem(link: IndexedLink, parent: HTMLElement, selectedIndex: number): HTMLElement {
    const item = parent.createDiv('ql-link-item');

    // 存储原始索引
    item.dataset.linkIndex = String(link._originalIndex);
    item.dataset.linkTitle = link.title;

    // 选中态
    if (link._originalIndex === selectedIndex) {
      item.classList.add('ql-link-selected');
    }

    // 收藏星标
    if (link.favorite) {
      const star = item.createSpan('ql-link-favorite');
      star.textContent = '⭐';
      star.title = '已收藏';
    }

    // 标题
    const title = item.createSpan('ql-link-title');
    title.textContent = link.title;

    // 平台标签
    const badge = new PlatformBadge(link.platform);
    item.appendChild(badge.getElement());

    // 点击选中
    item.addEventListener('click', () => {
      this.callbacks.onSelectLink(link._originalIndex);
    });

    return item;
  }

  private groupByCategory(links: IndexedLink[], categories: Category[]): Map<string, IndexedLink[]> {
    const grouped = new Map<string, IndexedLink[]>();

    // 保持分类顺序
    for (const category of categories) {
      grouped.set(category.name, []);
    }

    for (const link of links) {
      if (!grouped.has(link.category)) {
        grouped.set(link.category, []);
      }
      grouped.get(link.category)!.push(link);
    }

    // 移除空分类
    for (const [key, value] of grouped) {
      if (value.length === 0) {
        grouped.delete(key);
      }
    }

    return grouped;
  }

  private sortLinks(links: IndexedLink[]): IndexedLink[] {
    const sorted = [...links];
    sorted.sort((a, b) => {
      // 收藏置顶
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;

      // 按更新时间倒序
      if (a.updated && b.updated) {
        return b.updated.localeCompare(a.updated);
      }

      return 0;
    });
    return sorted;
  }
}
