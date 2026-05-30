import { Plugin, MarkdownView } from 'obsidian';
import { QuickLinksSettingTab } from './settings';
import { QuickLinksView } from './views/quickLinksView';
import { DataStore } from './data/dataStore';
import { VIEW_TYPE_QUICK_LINKS, PLUGIN_DISPLAY_NAME, PLUGIN_ICON, DEFAULT_DATA_FILE_PATH } from './utils/constants';

export default class QuickLinksPlugin extends Plugin {
  dataStore!: DataStore;

  async onload() {
    console.log('[Quick Links] Loading plugin...');

    // 初始化数据存储
    this.dataStore = new DataStore(this.app.vault, DEFAULT_DATA_FILE_PATH);
    await this.dataStore.ensureDataFile();

    // 注册自定义视图
    this.registerView(
      VIEW_TYPE_QUICK_LINKS,
      (leaf) => new QuickLinksView(leaf, this.dataStore)
    );

    // 注册 Ribbon 图标
    this.addRibbonIcon(PLUGIN_ICON, `打开 ${PLUGIN_DISPLAY_NAME}`, () => {
      this.activateView();
    });

    // 注册命令
    this.addCommand({
      id: 'open-quick-links',
      name: `打开 ${PLUGIN_DISPLAY_NAME}`,
      callback: () => {
        this.activateView();
      },
    });

    // 注册设置 Tab
    this.addSettingTab(new QuickLinksSettingTab(this.app, this));

    // 监听文件变更（外部修改时自动刷新）
    this.registerEvent(
      this.app.vault.on('modify', async (file) => {
        if (file.path === DEFAULT_DATA_FILE_PATH) {
          await this.dataStore.handleFileModify(file);
        }
      })
    );

    this.registerEvent(
      this.app.vault.on('delete', (file) => {
        this.dataStore.handleFileDelete(file);
      })
    );

    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        this.dataStore.handleFileRename(file, oldPath);
      })
    );

    console.log('[Quick Links] Plugin loaded successfully.');
  }

  onunload() {
    console.log('[Quick Links] Plugin unloaded.');
    this.dataStore.removeAllListeners();
  }

  /**
   * 激活或创建 Quick Links 视图
   */
  async activateView() {
    const { workspace } = this.app;

    // 检查是否已存在视图
    const existingLeaf = workspace.getLeavesOfType(VIEW_TYPE_QUICK_LINKS);

    if (existingLeaf.length > 0) {
      // 聚焦已有视图
      workspace.revealLeaf(existingLeaf[0]);
      return;
    }

    // 在右侧分栏新建视图
    const leaf = workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({
        type: VIEW_TYPE_QUICK_LINKS,
        active: true,
      });
      workspace.revealLeaf(leaf);
    }
  }
}
