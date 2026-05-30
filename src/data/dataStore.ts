import { TFile, Vault, normalizePath } from 'obsidian';
import { AppData, Category, Link, DataChangeListener } from '../types';
import { parseFrontmatter, serializeFrontmatter, ParseResult } from './yamlHelper';

/**
 * 数据存储管理器
 * 负责从 Markdown 文件读写 YAML frontmatter 数据
 */
export class DataStore {
  private vault: Vault;
  private dataFilePath: string;
  private cachedData: AppData | null = null;
  private listeners: DataChangeListener[] = [];
  private isInternalWrite: boolean = false;

  constructor(vault: Vault, dataFilePath: string) {
    this.vault = vault;
    this.dataFilePath = dataFilePath;
  }

  /**
   * 注册数据变更监听器
   */
  onChange(listener: DataChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this.listeners = [];
  }

  /**
   * 处理外部文件修改事件
   */
  async handleFileModify(file: TFile): Promise<void> {
    if (file.path === this.dataFilePath && !this.isInternalWrite) {
      this.cachedData = null; // 清除缓存
      await this.readAllData();
      this.notifyListeners();
    }
  }

  /**
   * 处理文件删除事件
   */
  handleFileDelete(file: TFile): void {
    if (file.path === this.dataFilePath) {
      this.cachedData = null;
      this.notifyListeners();
    }
  }

  /**
   * 处理文件重命名事件
   */
  handleFileRename(file: TFile, oldPath: string): void {
    if (oldPath === this.dataFilePath) {
      this.cachedData = null;
      this.notifyListeners();
    }
  }

  /**
   * 确保数据文件存在，不存在则创建默认文件
   */
  async ensureDataFile(): Promise<void> {
    const normalizedPath = normalizePath(this.dataFilePath);
    const existingFile = this.vault.getAbstractFileByPath(normalizedPath);

    if (!existingFile) {
      const defaultData: AppData = {
        categories: [
          { name: '产品文档', icon: '📋' },
          { name: '项目管理', icon: '📊' },
        ],
        links: [],
      };
      const body = '# 工作链接导航\n\n> 此文件由 Quick Links 插件管理，请勿手动修改 YAML 头部\n';
      const content = serializeFrontmatter(defaultData, body);

      await this.vault.create(normalizedPath, content);
      this.cachedData = defaultData;
    }
  }

  /**
   * 读取全部数据（优先使用缓存）
   */
  async readAllData(): Promise<AppData> {
    if (this.cachedData) {
      return { ...this.cachedData, links: [...this.cachedData.links], categories: [...this.cachedData.categories] };
    }

    const normalizedPath = normalizePath(this.dataFilePath);
    const file = this.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      // 文件不存在，创建默认文件
      await this.ensureDataFile();
      return this.cachedData!;
    }

    const content = await this.vault.read(file as TFile);
    const result: ParseResult = parseFrontmatter(content);

    if (result.error) {
      console.error('[Quick Links] Failed to parse data file:', result.error);
      return { categories: [], links: [] };
    }

    this.cachedData = result.data;
    return { ...result.data, links: [...result.data.links], categories: [...result.data.categories] };
  }

  /**
   * 保存数据到文件
   */
  async saveData(data: AppData): Promise<void> {
    const normalizedPath = normalizePath(this.dataFilePath);
    const file = this.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      await this.ensureDataFile();
    }

    const normalizedPath2 = normalizePath(this.dataFilePath);
    const targetFile = this.vault.getAbstractFileByPath(normalizedPath2) as TFile;

    // 重新读取文件以获取最新 body 内容（保留用户手动添加的正文）
    const currentContent = await this.vault.read(targetFile);
    const currentResult = parseFrontmatter(currentContent);
    const body = currentResult.body;

    const newContent = serializeFrontmatter(data, body);

    this.isInternalWrite = true;
    await this.vault.modify(targetFile, newContent);
    this.isInternalWrite = false;

    this.cachedData = data;
    this.notifyListeners();
  }

  /**
   * 获取当前数据文件的 TFile 对象
   */
  getFile(): TFile | null {
    const normalizedPath = normalizePath(this.dataFilePath);
    const file = this.vault.getAbstractFileByPath(normalizedPath);
    return file instanceof TFile ? file : null;
  }

  // ==========================================
  // 链接操作方法
  // ==========================================

  /**
   * 添加新链接
   */
  async addLink(link: Link): Promise<void> {
    const data = await this.readAllData();

    // 设置默认值
    if (!link.updated) {
      link.updated = formatDate(new Date());
    }
    if (!link.platform) {
      link.platform = 'web';
    }
    if (link.favorite === undefined) {
      link.favorite = false;
    }

    data.links.push(link);
    await this.saveData(data);
  }

  /**
   * 更新指定索引的链接
   */
  async updateLink(index: number, link: Link): Promise<void> {
    const data = await this.readAllData();

    if (index < 0 || index >= data.links.length) {
      throw new Error(`Link index out of bounds: ${index}`);
    }

    // 自动更新更新时间
    link.updated = formatDate(new Date());

    data.links[index] = link;
    await this.saveData(data);
  }

  /**
   * 删除指定索引的链接
   */
  async deleteLink(index: number): Promise<void> {
    const data = await this.readAllData();

    if (index < 0 || index >= data.links.length) {
      throw new Error(`Link index out of bounds: ${index}`);
    }

    data.links.splice(index, 1);
    await this.saveData(data);
  }

  /**
   * 切换链接的收藏状态
   */
  async toggleFavorite(index: number): Promise<void> {
    const data = await this.readAllData();

    if (index < 0 || index >= data.links.length) {
      throw new Error(`Link index out of bounds: ${index}`);
    }

    data.links[index].favorite = !data.links[index].favorite;
    await this.saveData(data);
  }

  // ==========================================
  // 分类操作方法
  // ==========================================

  /**
   * 添加新分类
   */
  async addCategory(category: Category): Promise<void> {
    const data = await this.readAllData();

    // 检查重名
    if (data.categories.some(c => c.name === category.name)) {
      throw new Error(`分类 "${category.name}" 已存在`);
    }

    data.categories.push(category);
    await this.saveData(data);
  }

  /**
   * 更新分类名称
   */
  async updateCategory(oldName: string, newCategory: Category): Promise<void> {
    const data = await this.readAllData();

    const idx = data.categories.findIndex(c => c.name === oldName);
    if (idx === -1) {
      throw new Error(`分类 "${oldName}" 不存在`);
    }

    // 如果改名，同步更新所有关联链接的 category 字段
    if (oldName !== newCategory.name) {
      for (const link of data.links) {
        if (link.category === oldName) {
          link.category = newCategory.name;
        }
      }
    }

    data.categories[idx] = newCategory;
    await this.saveData(data);
  }

  /**
   * 删除分类
   */
  async deleteCategory(name: string, migrateTo?: string): Promise<void> {
    const data = await this.readAllData();

    const idx = data.categories.findIndex(c => c.name === name);
    if (idx === -1) {
      throw new Error(`分类 "${name}" 不存在`);
    }

    // 处理关联链接
    const affectedLinks = data.links.filter(l => l.category === name);

    if (migrateTo) {
      // 迁移到指定分类
      for (const link of affectedLinks) {
        link.category = migrateTo;
      }
    }

    // 删除分类
    data.categories.splice(idx, 1);
    await this.saveData(data);
  }

  /**
   * 获取分类下的链接数量
   */
  async getCategoryLinkCount(categoryName: string): Promise<number> {
    const data = await this.readAllData();
    return data.links.filter(l => l.category === categoryName).length;
  }
}

// ==========================================
// 工具函数
// ==========================================

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
