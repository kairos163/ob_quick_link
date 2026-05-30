import { App, PluginSettingTab, Setting } from 'obsidian';
import QuickLinksPlugin from './main';

export class QuickLinksSettingTab extends PluginSettingTab {
  plugin: QuickLinksPlugin;

  constructor(app: App, plugin: QuickLinksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Quick Links 设置' });

    // 数据文件路径（只读展示）
    new Setting(containerEl)
      .setName('数据文件')
      .setDesc('链接数据存储在 Vault 根目录下的 Markdown 文件中')
      .addText(text => text
        .setValue('工作链接导航.md')
        .setDisabled(true)
      );

    // 使用说明
    containerEl.createEl('h3', { text: '使用说明' });

    const descList = containerEl.createEl('ul');
    const tips = [
      '点击左侧 Ribbon 图标或使用命令面板打开导航面板',
      '顶部分类标签可按平台筛选链接',
      '搜索框支持按标题和描述模糊搜索',
      '点击链接可查看详情，支持一键打开或复制',
      '通过"管理分类"可增删改分类',
    ];

    for (const tip of tips) {
      descList.createEl('li', { text: tip });
    }

    // 版本信息
    containerEl.createEl('p', {
      text: 'Quick Links v1.0.0 - 工作常用在线文档链接导航',
      cls: 'ql-settings-footer',
    });
  }
}
