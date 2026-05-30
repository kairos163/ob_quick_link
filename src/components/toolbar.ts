import { FilterState, Platform } from '../types';
import {
  PLATFORM_VALUES,
  PLATFORM_LABELS,
  PLATFORM_CSS_CLASS,
  SEARCH_DEBOUNCE_MS,
} from '../utils/constants';

interface ToolbarCallbacks {
  onFilterChange: (filter: FilterState) => void;
  onAddLink: () => void;
  onManageCategories: () => void;
}

/**
 * 顶部工具栏组件
 * 包含平台筛选标签组、搜索框、操作按钮
 */
export class Toolbar {
  private container: HTMLElement;
  private el: HTMLElement;
  private callbacks: ToolbarCallbacks;

  private currentPlatform: 'all' | Platform = 'all';
  private searchText: string = '';
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(container: HTMLElement, callbacks: ToolbarCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.el = this.build();
  }

  private build(): HTMLElement {
    const toolbar = this.container.createDiv('ql-toolbar');

    // --- 平台筛选标签 ---
    const filterGroup = toolbar.createDiv('ql-platform-filters');

    for (const platform of PLATFORM_VALUES) {
      const tag = filterGroup.createDiv(`ql-filter-tag ${PLATFORM_CSS_CLASS[platform]}`);
      tag.textContent = PLATFORM_LABELS[platform];
      tag.dataset.platform = platform;

      // 初始选中"全部"
      if (platform === this.currentPlatform) {
        tag.classList.add('ql-filter-active');
      }

      tag.addEventListener('click', () => {
        // 更新选中态
        filterGroup.querySelectorAll('.ql-filter-tag').forEach(t => t.classList.remove('ql-filter-active'));
        tag.classList.add('ql-filter-active');

        this.currentPlatform = platform;
        this.emitFilterChange();
      });
    }

    // --- 搜索框 ---
    const searchGroup = toolbar.createDiv('ql-search-group');

    const searchIcon = searchGroup.createSpan('ql-search-icon');
    searchIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>`;

    const searchInput = searchGroup.createEl('input', {
      type: 'text',
      placeholder: '搜索链接标题或描述...',
      cls: 'ql-search-input',
    });

    searchInput.addEventListener('input', () => {
      this.searchText = searchInput.value.trim();

      // 防抖
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.emitFilterChange();
      }, SEARCH_DEBOUNCE_MS);
    });

    // --- 操作按钮 ---
    const btnGroup = toolbar.createDiv('ql-toolbar-buttons');

    const addBtn = btnGroup.createEl('button', {
      text: '+ 添加链接',
      cls: 'ql-btn ql-btn-primary',
    });
    addBtn.addEventListener('click', () => {
      this.callbacks.onAddLink();
    });

    const catBtn = btnGroup.createEl('button', {
      text: '管理分类',
      cls: 'ql-btn ql-btn-secondary',
    });
    catBtn.addEventListener('click', () => {
      this.callbacks.onManageCategories();
    });

    return toolbar;
  }

  private emitFilterChange(): void {
    this.callbacks.onFilterChange({
      platform: this.currentPlatform,
      searchText: this.searchText,
    });
  }

  getElement(): HTMLElement {
    return this.el;
  }
}
