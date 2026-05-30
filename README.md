# Obsidian Quick Links

工作常用在线文档链接导航 Obsidian 插件。

## 功能

| 功能 | 说明 |
|---|---|
| 一键打开 | 支持外部浏览器或 Obsidian 内置打开 |
| 三种分组 | 按分类 / 按平台 / 按标签切换视图 |
| 卡片布局 | 拖拽排序 + 右下角拉伸调整 |
| 自定义类型 | 平台类型和分类均可自定义增删 |
| 数据存储 | Markdown YAML frontmatter，可直接编辑 |
| 搜索 | 标题、描述全文搜索（防抖 300ms） |
| 收藏 | 星标置顶常用链接 |
| 复制链接 | 一键复制 URL 到剪贴板 |

## 安装

1. 下载 `main.js`、`styles.css`、`manifest.json` 三个文件
2. 放入 Obsidian vault 的 `.obsidian/plugins/quick-links/` 目录
3. 重启 Obsidian，设置 → 社区插件 → 启用 Quick Links

## 使用

启用插件后，左侧 Ribbon 出现链接图标，点击打开导航面板。

- **分组模式**：顶部下拉切换 分类/平台/标签
- **添加链接**：点击 "+ 添加" 按钮
- **管理**：点击 "管理" 编辑分类和平台
- **齿轮菜单**：每个链接右侧齿轮包含 编辑/收藏/复制/删除
- **拖拽**：拖动卡片头部排序
- **拉伸**：拖拽卡片右下角调整大小

## 数据格式

数据存储在 vault 根目录的 Markdown 文件中（默认 `工作链接导航.md`）：

```yaml
---
links:
  - title: "产品需求文档"
    url: "https://docs.qq.com/xxx"
    category: "产品文档"
    platform: "tencent"
    tags: ["IoT", "需求"]
    description: "2025年Q4产品需求"
    favorite: false

categories:
  - name: "产品文档"
    icon: "📋"

platforms:
  - id: "tencent"
    name: "腾讯文档"
    color: "#2B7FF5"
---
```

## 开发

```bash
npm install
npm run build    # tsc + esbuild → main.js
```

将 `main.js` 复制到插件目录覆盖。

## 版本管理

本仓库同时管理代码和 Skill 文档，任何变更都通过 Git 追踪：

- `src/` — TypeScript 源码
- `main.js` / `styles.css` — 编译产物
- `docs/SKILL.md` — 插件开发与维护 Skill（架构、数据模型、关键机制）

Skill 位于 `OB工作台\.workbuddy\skills\obsidian-quick-links\SKILL.md`，修改后同步到 `docs/SKILL.md` 一并推送。

## 项目结构

```
├── main.js              # 编译产物（运行时）
├── styles.css           # 样式表
├── manifest.json        # Obsidian 插件元数据
├── src/                 # TypeScript 源码
│   ├── main.ts          # 插件入口
│   ├── settings.ts      # 设置页
│   ├── types.ts         # 类型定义
│   ├── components/      # UI 组件
│   ├── data/            # 数据层
│   ├── modals/          # 模态框
│   ├── views/           # 视图
│   └── utils/           # 工具函数
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

## License

MIT
