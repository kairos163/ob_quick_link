import { Link } from '../types';
import { PLATFORM_LABELS, PLATFORM_CSS_CLASS } from '../utils/constants';

interface DetailCallbacks {
  onOpenUrl: (url: string) => void;
  onCopyUrl: (url: string) => void;
  onEditLink: (originalIndex: number) => void;
  onDeleteLink: (originalIndex: number) => void;
  onToggleFavorite: (originalIndex: number) => void;
}

/**
 * 右侧链接详情面板
 * 展示选中链接的详细信息
 */
export class LinkDetailPanel {
  private container: HTMLElement;
  private callbacks: DetailCallbacks;

  constructor(container: HTMLElement, callbacks: DetailCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  /**
   * 渲染详情（link 为 null 时显示空状态）
   */
  render(link: Link | null, originalIndex: number): void {
    this.container.empty();

    if (!link) {
      this.renderEmptyState();
      return;
    }

    this.renderDetailCard(link, originalIndex);
  }

  // ==========================================
  // 内部方法
  // ==========================================

  private renderEmptyState(): void {
    const empty = this.container.createDiv('ql-detail-empty');
    const icon = empty.createSpan({ text: '📎', cls: 'ql-detail-empty-icon' });
    empty.createEl('h3', { text: 'Quick Links' });
    empty.createEl('p', { text: '选择一个链接查看详情' });
    empty.createEl('p', { text: '点击左侧链接项即可查看', cls: 'ql-empty-hint' });
  }

  private renderDetailCard(link: Link, originalIndex: number): void {
    const card = this.container.createDiv('ql-detail-card');

    // --- 标题区域 ---
    const header = card.createDiv('ql-detail-header');

    // 收藏按钮
    if (link.favorite) {
      const favIcon = header.createSpan('ql-detail-fav');
      favIcon.textContent = '⭐';
      favIcon.title = '已收藏';
    }

    const title = header.createEl('h2', {
      text: link.title,
      cls: 'ql-detail-title',
    });

    // --- 元信息 ---
    const meta = card.createDiv('ql-detail-meta');

    // 平台
    const platformItem = meta.createDiv('ql-meta-item');
    platformItem.createSpan({ text: '平台：', cls: 'ql-meta-label' });
    platformItem.createSpan({
      text: PLATFORM_LABELS[link.platform] || link.platform,
      cls: `ql-platform-badge ${PLATFORM_CSS_CLASS[link.platform] || ''}`,
    });

    // 分类
    const categoryItem = meta.createDiv('ql-meta-item');
    categoryItem.createSpan({ text: '分类：', cls: 'ql-meta-label' });
    categoryItem.createSpan({ text: link.category, cls: 'ql-meta-value' });

    // 更新时间
    if (link.updated) {
      const updatedItem = meta.createDiv('ql-meta-item');
      updatedItem.createSpan({ text: '更新：', cls: 'ql-meta-label' });
      updatedItem.createSpan({ text: link.updated, cls: 'ql-meta-value' });
    }

    // --- 描述 ---
    if (link.description) {
      const desc = card.createDiv('ql-detail-description');
      desc.createDiv('ql-detail-section-title', { text: '描述' });
      desc.createEl('p', { text: link.description, cls: 'ql-detail-desc-text' });
    }

    // --- URL ---
    const urlSection = card.createDiv('ql-detail-url-section');
    urlSection.createDiv('ql-detail-section-title', { text: '链接地址' });
    const urlInput = urlSection.createEl('input', {
      type: 'text',
      value: link.url,
      cls: 'ql-detail-url-input',
    });
    urlInput.setAttribute('readonly', 'true');

    // --- 操作按钮组 ---
    const actions = card.createDiv('ql-detail-actions');

    const openBtn = actions.createEl('button', {
      text: '在浏览器中打开',
      cls: 'ql-btn ql-btn-primary',
    });
    openBtn.addEventListener('click', () => {
      this.callbacks.onOpenUrl(link.url);
    });

    const copyBtn = actions.createEl('button', {
      text: '复制链接',
      cls: 'ql-btn ql-btn-secondary ql-btn-copy',
    });
    copyBtn.addEventListener('click', () => {
      this.callbacks.onCopyUrl(link.url);
    });

    const favBtn = actions.createEl('button', {
      text: link.favorite ? '取消收藏' : '收藏',
      cls: 'ql-btn ql-btn-secondary',
    });
    favBtn.addEventListener('click', () => {
      this.callbacks.onToggleFavorite(originalIndex);
      // 简单视觉反馈
      favBtn.textContent = link.favorite ? '收藏' : '取消收藏';
      setTimeout(() => {
        favBtn.textContent = link.favorite ? '取消收藏' : '收藏';
      }, 500);
    });

    const editBtn = actions.createEl('button', {
      text: '编辑',
      cls: 'ql-btn ql-btn-secondary',
    });
    editBtn.addEventListener('click', () => {
      this.callbacks.onEditLink(originalIndex);
    });

    const deleteBtn = actions.createEl('button', {
      text: '删除',
      cls: 'ql-btn ql-btn-danger',
    });
    deleteBtn.addEventListener('click', () => {
      const confirmed = confirm(`确定要删除链接 "${link.title}" 吗？此操作不可撤销。`);
      if (confirmed) {
        this.callbacks.onDeleteLink(originalIndex);
      }
    });
  }
}
