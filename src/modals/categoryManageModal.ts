import { App, Modal, Setting, Notice } from 'obsidian';
import { Category, Link } from '../types';

/**
 * 分类管理弹窗
 * 支持分类的增删改操作
 */
export class CategoryManageModal extends Modal {
  private categories: Category[];
  private links: Link[];
  private onSubmit: (categories: Category[]) => void;

  constructor(
    app: App,
    categories: Category[],
    links: Link[],
    onSubmit: (categories: Category[]) => void
  ) {
    super(app);
    this.categories = [...categories]; // 深拷贝用于编辑
    this.links = links;
    this.onSubmit = onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('ql-modal');

    // 标题
    contentEl.createEl('h2', {
      text: '管理分类',
      cls: 'ql-modal-title',
    });

    // 分类列表
    const listContainer = contentEl.createDiv('ql-category-list-modal');

    if (this.categories.length === 0) {
      listContainer.createEl('p', {
        text: '暂无分类，请添加',
        cls: 'ql-empty-hint',
      });
    }

    for (let i = 0; i < this.categories.length; i++) {
      const cat = this.categories[i];
      this.renderCategoryItem(listContainer, cat, i);
    }

    // 分隔线
    contentEl.createEl('hr', { cls: 'ql-modal-divider' });

    // 添加分类表单
    this.renderAddForm(contentEl);

    // 底部按钮
    const btnGroup = contentEl.createDiv('ql-modal-buttons');

    const saveBtn = btnGroup.createEl('button', {
      text: '完成',
      cls: 'ql-btn ql-btn-primary',
    });
    saveBtn.addEventListener('click', () => {
      this.onSubmit([...this.categories]);
      this.close();
    });

    const cancelBtn = btnGroup.createEl('button', {
      text: '取消',
      cls: 'ql-btn ql-btn-secondary',
    });
    cancelBtn.addEventListener('click', () => {
      this.close();
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  // ==========================================
  // 内部方法
  // ==========================================

  private renderCategoryItem(container: HTMLElement, category: Category, index: number): void {
    const item = container.createDiv('ql-category-list-item');
    item.dataset.categoryIndex = String(index);

    // 图标
    const icon = item.createSpan('ql-category-item-icon');
    icon.textContent = category.icon;

    // 名称
    const name = item.createSpan('ql-category-item-name');
    name.textContent = category.name;

    // 关联链接数量
    const count = this.links.filter(l => l.category === category.name).length;
    const countEl = item.createSpan('ql-category-item-count');
    countEl.textContent = `${count} 个链接`;

    // 编辑按钮
    const editBtn = item.createEl('button', {
      text: '编辑',
      cls: 'ql-btn ql-btn-small ql-btn-secondary',
    });
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editCategory(index, item);
    });

    // 删除按钮
    const deleteBtn = item.createEl('button', {
      text: '删除',
      cls: 'ql-btn ql-btn-small ql-btn-danger',
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCategory(index);
    });
  }

  private editCategory(index: number, itemEl: HTMLElement): void {
    const category = this.categories[index];
    const name = category.name;

    // 替换为编辑表单
    itemEl.empty();

    const iconInput = itemEl.createEl('input', {
      type: 'text',
      value: category.icon,
      cls: 'ql-form-input ql-category-edit-icon',
      attr: { maxlength: '2', style: 'width: 40px' },
    });

    const nameInput = itemEl.createEl('input', {
      type: 'text',
      value: name,
      cls: 'ql-form-input ql-category-edit-name',
      attr: { style: 'flex: 1' },
    });

    // 保存按钮
    const saveBtn = itemEl.createEl('button', {
      text: '保存',
      cls: 'ql-btn ql-btn-small ql-btn-primary',
    });
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newName = nameInput.value.trim();
      const newIcon = iconInput.value.trim() || '📋';

      if (!newName) {
        new Notice('分类名称不能为空');
        return;
      }

      // 检查重名（排除自身）
      if (newName !== name && this.categories.some(c => c.name === newName)) {
        new Notice(`分类 "${newName}" 已存在`);
        return;
      }

      // 如果改名，更新关联链接的分类字段
      if (newName !== name) {
        for (const link of this.links) {
          if (link.category === name) {
            link.category = newName;
          }
        }
      }

      this.categories[index] = { name: newName, icon: newIcon };

      // 重新渲染整个列表
      this.refreshList();
    });

    // 取消按钮
    const cancelBtn = itemEl.createEl('button', {
      text: '取消',
      cls: 'ql-btn ql-btn-small ql-btn-secondary',
    });
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.refreshList();
    });

    // 自动聚焦到名称输入框
    nameInput.focus();
  }

  private deleteCategory(index: number): void {
    const category = this.categories[index];
    const linkCount = this.links.filter(l => l.category === category.name).length;

    let confirmed = false;

    if (linkCount > 0) {
      confirmed = confirm(
        `分类 "${category.name}" 下有 ${linkCount} 个链接。\n` +
        `删除分类后，这些链接的分类将变为空白。\n\n确定要删除吗？`
      );
    } else {
      confirmed = confirm(`确定要删除分类 "${category.name}" 吗？`);
    }

    if (!confirmed) return;

    this.categories.splice(index, 1);
    this.refreshList();
  }

  private refreshList(): void {
    const listContainer = this.contentEl.querySelector('.ql-category-list-modal');
    if (listContainer instanceof HTMLElement) {
      listContainer.empty();

      if (this.categories.length === 0) {
        listContainer.createEl('p', {
          text: '暂无分类，请添加',
          cls: 'ql-empty-hint',
        });
      }

      for (let i = 0; i < this.categories.length; i++) {
        this.renderCategoryItem(listContainer, this.categories[i], i);
      }
    }
  }

  private renderAddForm(container: HTMLElement): void {
    const formGroup = container.createDiv('ql-add-category-form');

    formGroup.createEl('label', {
      text: '添加新分类',
      cls: 'ql-form-label',
    });

    const inputsRow = formGroup.createDiv('ql-add-category-inputs');

    const iconInput = inputsRow.createEl('input', {
      type: 'text',
      placeholder: '图标',
      value: '📋',
      cls: 'ql-form-input',
      attr: { maxlength: '2', style: 'width: 50px' },
    });

    const nameInput = inputsRow.createEl('input', {
      type: 'text',
      placeholder: '分类名称',
      cls: 'ql-form-input',
      attr: { style: 'flex: 1' },
    });

    const addBtn = inputsRow.createEl('button', {
      text: '添加',
      cls: 'ql-btn ql-btn-primary',
    });

    addBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const icon = iconInput.value.trim() || '📋';

      if (!name) {
        new Notice('请输入分类名称');
        nameInput.focus();
        return;
      }

      if (this.categories.some(c => c.name === name)) {
        new Notice(`分类 "${name}" 已存在`);
        return;
      }

      this.categories.push({ name, icon });
      nameInput.value = '';
      iconInput.value = '📋';
      this.refreshList();
    });

    // 回车键提交
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addBtn.click();
      }
    });
  }
}
