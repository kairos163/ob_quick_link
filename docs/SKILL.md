---
name: obsidian-quick-links
description: >-
  Obsidian Quick Links 工作链接导航插件开发与维护Skill。
  当用户提到 Quick Links 插件、链接导航、Obsidian 插件功能修改、
  Bug修复、弹窗、卡片布局、平台分类管理、齿轮按钮、下拉框样式等关键词时触发。
  覆盖插件架构、TypeScript源码、esbuild构建、YAML数据模型、CSS样式定制等全栈维护能力。
---

# Obsidian Quick Links — 工作链接导航插件

## 概述

Quick Links 是一个 Obsidian 插件，用于管理工作中常用的在线文档链接。
数据存储在 Markdown YAML frontmatter 中，支持分类、平台、标签三种分组模式，
卡片式布局可拖拽和拉伸。

## 项目信息

- **名称**: obsidian-quick-links
- **版本**: 1.0.0
- **作者**: Kairos (kairos163)
- **GitHub**: kairos163/ob_quick_link
- **本地路径**: `E:\02 Kairos-Nut\我的坚果云\Obsidian Sync\Work02\.obsidian\plugins\quick-links\`
- **仓库路径**: `E:\02 Kairos-Nut\03 Tempfile\workbuddy\OB工作台\obsidian-quick-links\`
- **数据文件**: `E:\02 Kairos-Nut\我的坚果云\Obsidian Sync\Work02\工作链接导航.md`

## 架构

```
obsidian-quick-links/
├── manifest.json          # Obsidian 插件元数据
├── package.json           # npm 依赖和构建脚本
├── tsconfig.json          # TypeScript 配置
├── esbuild.config.mjs     # esbuild 构建配置
├── main.js                # 编译产物（运行时文件，从 TypeScript 编译）
├── styles.css             # 样式表
├── data.json              # Obsidian 插件设置（不入库）
├── .gitignore
└── src/
    ├── main.ts            # 插件入口（注册 View、SettingTab）
    ├── settings.ts        # 设置页（dataFilePath、openMethod）
    ├── types.ts           # 类型定义（AppData, LinkRecord, Category, Platform）
    ├── components/
    │   ├── toolbar.ts     # 工具栏（筛选标签、分组模式、搜索、添加/管理按钮）
    │   └── platformBadge.ts # 平台徽章组件
    ├── data/
    │   ├── dataStore.ts   # 数据读写（Markdown YAML frontmatter CRUD）
    │   └── yamlHelper.ts  # YAML 解析/序列化（inline 属性、platforms、tags）
    ├── modals/
    │   ├── linkEditModal.ts       # 链接编辑模态框
    │   └── categoryManageModal.ts # 分类/平台管理模态框
    ├── views/
    │   ├── quickLinksView.ts      # 主 View（QuickLinksView，协调各组件）
    │   ├── linkListPanel.ts       # 链接列表面板（卡片组渲染、拖拽、齿轮弹窗）
    │   └── linkDetailPanel.ts     # 链接详情面板（已废弃，右侧已取消）
    └── utils/
        └── constants.ts           # 默认值（DEFAULT_PLATFORMS）
```

## 数据模型

数据存储在 Markdown 文件 YAML frontmatter 中：

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
    createdAt: "2024-01-15"
categories:
  - name: "产品文档"
    icon: "📋"
platforms:
  - id: "tencent"
    name: "腾讯文档"
    color: "#2B7FF5"
  - id: "feishu"
    name: "飞书文档"
    color: "#3370FF"
  - id: "web"
    name: "其他网页"
    color: "#6B7280"
---
```

## 关键技术细节

### 弹窗机制（重要）

弹窗必须挂到 `document.body` 而非卡片内部，否则会被 `overflow:hidden` 裁剪或被下方行遮挡。

```javascript
// 正确做法：挂到 body，用 fixed 定位
var pop = document.createElement("div");
pop.className = "ql-link-popup";
pop.style.cssText = "position:fixed;z-index:99999;...";
var rect = rowGear.getBoundingClientRect();
pop.style.left = (rect.right - 115) + "px";
pop.style.top = (rect.bottom + 4) + "px";
document.body.appendChild(pop);
```

### 齿轮按钮点击（重要）

Obsidian Electron 环境下 `stopPropagation()` 不完全可靠，需配合标志位：

```javascript
var gearActive = false;
rowGear.addEventListener("click", function(e) {
  e.stopPropagation(); e.preventDefault();
  gearActive = true;
  setTimeout(function() { gearActive = false; }, 300);
  // ... 弹窗逻辑 ...
});
row.addEventListener("click", function() {
  if (gearActive) return;  // 齿轮刚被点击，跳过行跳转
  window.open(link.url, "_blank");
});
```

### 全局弹窗关闭

在 `QuickLinksView.onOpen()` 中注册单一全局 capture 阶段处理器：

```javascript
this._docClickHandler = function(e) {
  if (e.target.closest(".ql-link-row button")) return;  // 跳过齿轮按钮
  var popups = document.querySelectorAll(".ql-link-popup");
  for (var i = 0; i < popups.length; i++) {
    if (!popups[i].contains(e.target)) { popups[i].remove(); }
  }
};
document.addEventListener("click", this._docClickHandler, true);
```

在 `onClose()` 中清理：

```javascript
if (this._docClickHandler) {
  document.removeEventListener("click", this._docClickHandler, true);
  this._docClickHandler = null;
}
```

### 下拉框样式（重要）

Windows 原生 `<select>` 显示默认上下箭头，需去除：

```css
.ql-form-select, select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,...");  /* 自定义三角 */
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;  /* 为三角留空 */
}
```

### 源码 vs 运行时

- TypeScript 源文件在 `src/` 目录，由 esbuild 编译为 `main.js`
- Obsidian 沙箱保护 `.obsidian/plugins/` 下的源码文件，**修改只能在 main.js 运行时文件进行**
- 仓库中同时保留源码和编译产物，源码供开发参考，main.js 是实际生效的运行文件

### 面板位置

```javascript
// 主编辑区（非侧边栏）
this.app.workspace.getLeaf(false).setViewState({...})
// 不要用 getRightLeaf()，那是侧边栏
```

## 开发流程

### 修改插件

```bash
cd "E:\02 Kairos-Nut\我的坚果云\Obsidian Sync\Work02\.obsidian\plugins\quick-links"
# 直接编辑 main.js（运行时文件）
# 重新加载 Obsidian 或 Ctrl+Shift+I → 插件 → 重新加载
```

### 源码开发

```bash
cd "E:\02 Kairos-Nut\03 Tempfile\workbuddy\OB工作台\obsidian-quick-links"
npm install
npm run build  # tsc + esbuild
# 复制 main.js 到插件目录覆盖
```

### 推送变更

```bash
cd "E:\02 Kairos-Nut\03 Tempfile\workbuddy\OB工作台\obsidian-quick-links"
git add -A
git commit -m "fix: ..."
git push origin main
```

## 已知限制

1. **源码不能直接写入插件目录**：Obsidian vault 沙箱保护 `.obsidian/plugins/` 下的写操作
2. **GitHub MCP 不能创建仓库**：需手动在 github.com 创建空仓库
3. **data.json 不入库**：包含用户个人设置，在 .gitignore 中排除
4. **esbuild 依赖需单独安装**：npm install 后才能构建

## 执行铁律

1. 每一步操作之前都需要验证确认
2. 每一次交付都需要交付 SKILL
3. 每一次排版对齐确认之后才算完成
4. 任何更改都需要我明确确认

## 关键路径速查

| 组件 | 文件 | 行号参考 |
|---|---|---|
| 主 View | main.js → QuickLinksView | ~1195 |
| 卡片渲染 | main.js → LinkListPanel.render | ~242 |
| 齿轮弹窗 | main.js → renderLinkRow | ~417 |
| 工具栏 | main.js → Toolbar | ~144 |
| 全局弹窗关闭 | main.js → onOpen | ~1218 |
| 下拉框样式 | styles.css → .ql-form-select | ~555 |
| 平台默认值 | main.js → DEFAULT_PLATFORMS | |
| YAML 解析 | main.js → parseYamlContent | ~1050 |
