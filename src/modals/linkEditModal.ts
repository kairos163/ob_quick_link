import { App, Modal, Setting, Notice } from 'obsidian';
import { Link, Category, Platform } from '../types';
import { PLATFORM_LABELS } from '../utils/constants';

/**
 * 添加/编辑链接弹窗
 */
export class LinkEditModal extends Modal {
  private categories: Category[];
  private existingLink: Link | null;
  private onSubmit: (link: Link) => void;

  private titleInput!: HTMLInputElement;
  private urlInput!: HTMLInputElement;
  private descInput!: HTMLTextAreaElement;
  private categorySelect!: HTMLSelectElement;
  private platformSelect!: HTMLSelectElement;
  private favoriteCheck!: HTMLInputElement;

  constructor(
    app: App,
    categories: Category[],
    existingLink: Link | null,
    onSubmit: (link: Link) => void
  ) {
    super(app);
    this.categories = categories;
    this.existingLink = existingLink;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    const isEdit = this.existingLink !== null;

    contentEl.empty();
    contentEl.addClass('ql-modal');

    // 标题
    contentEl.createEl('h2', {
      text: isEdit ? '编辑链接' : '添加链接',
      cls: 'ql-modal-title',
    });

    // --- 链接标题 ---
    new Setting(contentEl)
      .setName('标题')
      .setDesc('链接显示名称')
      .addText(text => {
        this.titleInput = text.inputEl;
        text.setPlaceholder('输入链接标题');
        if (this.existingLink) {
          text.setValue(this.existingLink.title);
        }
        text.inputEl.addClass('ql-form-input');
      });

    // --- URL ---
    new Setting(contentEl)
      .setName('URL')
      .setDesc('完整的链接地址')
      .addText(text => {
        this.urlInput = text.inputEl;
        text.setPlaceholder('https://docs.qq.com/xxx');
        if (this.existingLink) {
          text.setValue(this.existingLink.url);
        }
        text.inputEl.addClass('ql-form-input');
      });

    // --- 描述 ---
    new Setting(contentEl)
      .setName('描述')
      .setDesc('链接的文字描述（可选）')
      .addTextArea(text => {
        this.descInput = text.inputEl;
        text.setPlaceholder('简要描述此链接的用途');
        if (this.existingLink && this.existingLink.description) {
          text.setValue(this.existingLink.description);
        }
        text.inputEl.addClass('ql-form-textarea');
        text.inputEl.rows = 3;
      });

    // --- 分类 ---
    new Setting(contentEl)
      .setName('分类')
      .setDesc('选择所属分类')
      .addDropdown(dropdown => {
        this.categorySelect = dropdown.selectEl;

        if (this.categories.length === 0) {
          dropdown.addOption('', '-- 暂无分类 --');
        } else {
          for (const cat of this.categories) {
            dropdown.addOption(cat.name, `${cat.icon} ${cat.name}`);
          }
        }

        if (this.existingLink && this.existingLink.category) {
          dropdown.setValue(this.existingLink.category);
        } else if (this.categories.length > 0) {
          dropdown.setValue(this.categories[0].name);
        }

        dropdown.selectEl.addClass('ql-form-select');
      });

    // --- 平台 ---
    new Setting(contentEl)
      .setName('平台')
      .setDesc('链接所属平台')
      .addDropdown(dropdown => {
        this.platformSelect = dropdown.selectEl;

        dropdown.addOption('tencent-docs', '腾讯文档');
        dropdown.addOption('feishu-docs', '飞书文档');
        dropdown.addOption('web', '网页链接');

        if (this.existingLink) {
          dropdown.setValue(this.existingLink.platform);
        } else {
          // 默认尝试从 URL 自动识别
          dropdown.setValue('web');
        }

        dropdown.selectEl.addClass('ql-form-select');
      });

    // --- 收藏标记 ---
    new Setting(contentEl)
      .setName('收藏')
      .setDesc('标记为收藏，将在列表中置顶显示')
      .addToggle(toggle => {
        this.favoriteCheck = toggle.toggleEl as HTMLInputElement;
        toggle.setValue(this.existingLink?.favorite ?? false);
      });

    // --- 操作按钮 ---
    const btnGroup = contentEl.createDiv('ql-modal-buttons');

    // 保存按钮
    const saveBtn = btnGroup.createEl('button', {
      text: '保存',
      cls: 'ql-btn ql-btn-primary',
    });
    saveBtn.addEventListener('click', () => {
      if (this.validateAndSubmit()) {
        this.close();
      }
    });

    // 取消按钮
    const cancelBtn = btnGroup.createEl('button', {
      text: '取消',
      cls: 'ql-btn ql-btn-secondary',
    });
    cancelBtn.addEventListener('click', () => {
      this.close();
    });

    // 删除按钮（仅编辑模式）
    if (isEdit) {
      const deleteBtn = btnGroup.createEl('button', {
        text: '删除此链接',
        cls: 'ql-btn ql-btn-danger',
      });
      deleteBtn.style.marginLeft = 'auto';
      deleteBtn.addEventListener('click', () => {
        const confirmed = confirm(`确定要删除链接 "${this.existingLink!.title}" 吗？`);
        if (confirmed) {
          // 提交一个特殊标记让外部处理删除
          this.close();
        }
      });
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * 表单校验并提交
   */
  private validateAndSubmit(): boolean {
    const title = this.titleInput.value.trim();
    const url = this.urlInput.value.trim();
    const description = this.descInput.value.trim() || undefined;
    const category = this.categorySelect.value;
    const platform = this.platformSelect.value as Platform;
    const favorite = this.favoriteCheck.checked;

    // 校验标题
    if (!title) {
      new Notice('请输入链接标题');
      this.titleInput.focus();
      return false;
    }

    // 校验 URL
    if (!url) {
      new Notice('请输入链接地址');
      this.urlInput.focus();
      return false;
    }

    if (!/^https?:\/\/.+/.test(url)) {
      new Notice('请输入有效的 URL（以 http:// 或 https:// 开头）');
      this.urlInput.focus();
      return false;
    }

    // 校验分类
    if (!category) {
      new Notice('请选择或创建分类');
      return false;
    }

    const link: Link = {
      title,
      url,
      description,
      category,
      platform,
      favorite,
      updated: this.existingLink?.updated || new Date().toISOString().slice(0, 10),
    };

    this.onSubmit(link);
    return true;
  }
}
