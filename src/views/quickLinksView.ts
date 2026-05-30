import { ItemView, WorkspaceLeaf } from 'obsidian';
import { DataStore } from '../data/dataStore';
import { AppData, FilterState, Link } from '../types';
import { Toolbar } from '../components/toolbar';
import { LinkListPanel } from './linkListPanel';
import { LinkDetailPanel } from './linkDetailPanel';
import { LinkEditModal } from '../modals/linkEditModal';
import { CategoryManageModal } from '../modals/categoryManageModal';
import {
  VIEW_TYPE_QUICK_LINKS,
  PLUGIN_DISPLAY_NAME,
  PLUGIN_ICON,
} from '../utils/constants';

/**
 * Quick Links 主视图 - 自定义 ItemView
 * 双栏布局：左列表 + 右详情，顶部工具栏
 */
export class QuickLinksView extends ItemView {
  private dataStore: DataStore;
  private toolbar!: Toolbar;
  private linkListPanel!: LinkListPanel;
  private linkDetailPanel!: LinkDetailPanel;

  private currentData: AppData = { categories: [], links: [] };
  private currentFilter: FilterState = { platform: 'all', searchText: '' };
  private selectedLinkIndex: number = -1;

  constructor(leaf: WorkspaceLeaf, dataStore: DataStore) {
    super(leaf);
    this.dataStore = dataStore;
  }

  getViewType(): string {
    return VIEW_TYPE_QUICK_LINKS;
  }

  getDisplayText(): string {
    return PLUGIN_DISPLAY_NAME;
  }

  getIcon(): string {
    return PLUGIN_ICON;
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.classList.add('ql-view-container');

    // --- 顶部工具栏 ---
    this.toolbar = new Toolbar(container, {
      onFilterChange: (filter) => this.handleFilterChange(filter),
      onAddLink: () => this.openAddLinkModal(),
      onManageCategories: () => this.openCategoryManageModal(),
    });

    // --- 双栏主容器 ---
    const mainContainer = container.createDiv('ql-main-container');

    // 左侧面板
    const leftPanel = mainContainer.createDiv('ql-left-panel');
    this.linkListPanel = new LinkListPanel(leftPanel, {
      onSelectLink: (index) => this.handleSelectLink(index),
      onEditLink: (index) => this.openEditLinkModal(index),
    });

    // 右侧面板
    const rightPanel = mainContainer.createDiv('ql-right-panel');
    this.linkDetailPanel = new LinkDetailPanel(rightPanel, {
      onOpenUrl: (url) => this.handleOpenUrl(url),
      onCopyUrl: (url) => this.handleCopyUrl(url),
      onEditLink: (index) => this.openEditLinkModal(index),
      onDeleteLink: (index) => this.handleDeleteLink(index),
      onToggleFavorite: (index) => this.handleToggleFavorite(index),
    });

    // 加载数据并渲染
    this.currentData = await this.dataStore.readAllData();
    this.render();

    // 监听数据变更
    this.dataStore.onChange(async () => {
      this.currentData = await this.dataStore.readAllData();
      this.render();
    });
  }

  async onClose(): Promise<void> {
    this.dataStore.removeAllListeners();
    // 清理所有子元素
    this.containerEl.children[1].empty();
  }

  // ==========================================
  // 渲染
  // ==========================================

  private render(): void {
    this.linkListPanel.render(this.currentData, this.currentFilter, this.selectedLinkIndex);

    if (this.selectedLinkIndex >= 0 && this.selectedLinkIndex < this.currentData.links.length) {
      this.linkDetailPanel.render(this.currentData.links[this.selectedLinkIndex], this.selectedLinkIndex);
    } else {
      this.linkDetailPanel.render(null, -1);
    }
  }

  // ==========================================
  // 事件处理
  // ==========================================

  private handleFilterChange(filter: FilterState): void {
    this.currentFilter = filter;
    this.linkListPanel.render(this.currentData, this.currentFilter, this.selectedLinkIndex);
  }

  private handleSelectLink(index: number): void {
    this.selectedLinkIndex = index;
    if (index >= 0 && index < this.currentData.links.length) {
      this.linkDetailPanel.render(this.currentData.links[index], index);
    } else {
      this.linkDetailPanel.render(null, -1);
    }
    // 更新列表选中态
    this.linkListPanel.highlightSelected(index);
  }

  private handleOpenUrl(url: string): void {
    window.open(url, '_blank');
  }

  private async handleCopyUrl(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      // 简单的视觉反馈
      const btn = this.containerEl.querySelector('.ql-btn-copy');
      if (btn instanceof HTMLButtonElement) {
        const originalText = btn.textContent;
        btn.textContent = '已复制!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1500);
      }
    } catch (err) {
      console.error('[Quick Links] Failed to copy URL:', err);
    }
  }

  private async handleDeleteLink(index: number): Promise<void> {
    if (index < 0 || index >= this.currentData.links.length) return;

    const link = this.currentData.links[index];
    const confirmed = confirm(`确定要删除链接 "${link.title}" 吗？此操作不可撤销。`);
    if (!confirmed) return;

    await this.dataStore.deleteLink(index);
    if (this.selectedLinkIndex === index) {
      this.selectedLinkIndex = -1;
    }
  }

  private async handleToggleFavorite(index: number): Promise<void> {
    await this.dataStore.toggleFavorite(index);
  }

  // ==========================================
  // 弹窗
  // ==========================================

  private async openAddLinkModal(): Promise<void> {
    const data = await this.dataStore.readAllData();
    new LinkEditModal(this.app, data.categories, null, async (link) => {
      await this.dataStore.addLink(link);
    }).open();
  }

  private async openEditLinkModal(index: number): Promise<void> {
    const data = await this.dataStore.readAllData();
    if (index < 0 || index >= data.links.length) return;

    const link = data.links[index];
    new LinkEditModal(this.app, data.categories, link, async (updatedLink) => {
      await this.dataStore.updateLink(index, updatedLink);
    }).open();
  }

  private async openCategoryManageModal(): Promise<void> {
    const data = await this.dataStore.readAllData();
    new CategoryManageModal(this.app, data.categories, data.links, async (categories) => {
      data.categories = categories;
      await this.dataStore.saveData(data);
    }).open();
  }
}
