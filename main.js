"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => QuickLinksPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var QuickLinksSettingTab = class extends import_obsidian.PluginSettingTab {
  plugin;
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Quick Links \u8BBE\u7F6E" });
    new import_obsidian.Setting(containerEl).setName("\u6570\u636E\u6587\u4EF6").setDesc("\u94FE\u63A5\u6570\u636E\u5B58\u50A8\u5728 Vault \u4E2D\u7684 Markdown \u6587\u4EF6\u8DEF\u5F84\uFF0C\u4FEE\u6539\u540E\u9700\u91CD\u542F Obsidian \u751F\u6548").addText(
      (text) => {
        text.setValue(this.plugin.settings.dataFilePath);
        text.onChange(async (value) => {
          this.plugin.settings.dataFilePath = value.trim() || "\u5DE5\u4F5C\u94FE\u63A5\u5BFC\u822A.md";
          await this.plugin.saveData(this.plugin.settings);
        });
      }
    );
    new import_obsidian.Setting(containerEl).setName("\u9ED8\u8BA4\u6253\u5F00\u65B9\u5F0F").setDesc("\u70B9\u51FB\u94FE\u63A5\u65F6\u7684\u6253\u5F00\u65B9\u5F0F").addDropdown(
      (dropdown) => {
        dropdown.addOption("external", "\u5916\u90E8\u6D4F\u89C8\u5668");
        dropdown.addOption("obsidian", "Obsidian \u5185\u7F6E\u6D4F\u89C8\u5668");
        dropdown.setValue(this.plugin.settings.openMethod || "external");
        dropdown.onChange(async (value) => {
          this.plugin.settings.openMethod = value;
          await this.plugin.saveData(this.plugin.settings);
        });
      }
    );
    containerEl.createEl("h3", { text: "\u4F7F\u7528\u8BF4\u660E" });
    const descList = containerEl.createEl("ul");
    const tips = [
      "\u70B9\u51FB\u5DE6\u4FA7 Ribbon \u56FE\u6807\u6216\u4F7F\u7528\u547D\u4EE4\u9762\u677F\u6253\u5F00\u5BFC\u822A\u9762\u677F",
      "\u9876\u90E8\u5206\u7C7B\u6807\u7B7E\u53EF\u6309\u5E73\u53F0\u7B5B\u9009\u94FE\u63A5",
      "\u641C\u7D22\u6846\u652F\u6301\u6309\u6807\u9898\u548C\u63CF\u8FF0\u6A21\u7CCA\u641C\u7D22",
      "\u70B9\u51FB\u94FE\u63A5\u53EF\u67E5\u770B\u8BE6\u60C5\uFF0C\u652F\u6301\u4E00\u952E\u6253\u5F00\u6216\u590D\u5236",
      '\u901A\u8FC7"\u7BA1\u7406\u5206\u7C7B"\u53EF\u589E\u5220\u6539\u5206\u7C7B'
    ];
    for (const tip of tips) {
      descList.createEl("li", { text: tip });
    }
    containerEl.createEl("p", {
      text: "Quick Links v1.0.0 - \u5DE5\u4F5C\u5E38\u7528\u5728\u7EBF\u6587\u6863\u94FE\u63A5\u5BFC\u822A",
      cls: "ql-settings-footer"
    });
  }
};

// src/views/quickLinksView.ts
var import_obsidian4 = require("obsidian");

// src/utils/constants.ts
var VIEW_TYPE_QUICK_LINKS = "quick-links-view";
var PLUGIN_DISPLAY_NAME = "Quick Links";
var PLUGIN_ICON = "link";
var DEFAULT_DATA_FILE_PATH = "\u5DE5\u4F5C\u94FE\u63A5\u5BFC\u822A.md";
var DEFAULT_PLATFORMS = [
  { id: "tencent-docs", name: "\u817E\u8BAF\u6587\u6863", color: "#2B7FF5" },
  { id: "feishu-docs", name: "\u98DE\u4E66\u6587\u6863", color: "#3370FF" },
  { id: "web", name: "\u7F51\u9875\u94FE\u63A5", color: "#6B7280" }
];
var SEARCH_DEBOUNCE_MS = 300;

// src/components/toolbar.ts
var Toolbar = class {
  container;
  el;
  callbacks;
  currentPlatform = "all";
  searchText = "";
  debounceTimer = null;
  filterGroup;
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.el = this.build();
  }
  setPlatforms(platforms) {
    if (!this.filterGroup) return;
    this.filterGroup.empty();
    var self = this;
    var allTag = this.filterGroup.createDiv("ql-filter-tag ql-filter-active");
    allTag.textContent = "\u5168\u90E8";
    allTag.dataset.platform = "all";
    allTag.style.cssText = "padding:2px 8px;font-size:11px;border-radius:12px;cursor:pointer;white-space:nowrap;background:var(--interactive-accent);color:#fff;";
    allTag.addEventListener("click", () => {
      self.filterGroup.querySelectorAll(".ql-filter-tag").forEach(t => {
        t.classList.remove("ql-filter-active");
        t.style.cssText = "";
      });
      allTag.classList.add("ql-filter-active");
      allTag.style.cssText = "padding:2px 8px;font-size:11px;border-radius:12px;cursor:pointer;white-space:nowrap;background:var(--interactive-accent);color:#fff;";
      self.currentPlatform = "all";
      self.emitFilterChange();
    });
    for (const plat of platforms) {
      const tag = self.filterGroup.createDiv("ql-filter-tag");
      tag.textContent = plat.name;
      tag.dataset.platform = plat.id;
      tag.style.cssText = "padding:2px 8px;font-size:11px;border-radius:12px;cursor:pointer;white-space:nowrap;";
      tag.addEventListener("click", () => {
        self.filterGroup.querySelectorAll(".ql-filter-tag").forEach(t => {
          t.classList.remove("ql-filter-active");
          t.style.cssText = "";
        });
        tag.classList.add("ql-filter-active");
        tag.style.cssText = "padding:2px 8px;font-size:11px;border-radius:12px;cursor:pointer;white-space:nowrap;background:" + plat.color + ";color:#fff;";
        self.currentPlatform = plat.id;
        self.emitFilterChange();
      });
    }
  }
  build() {
    var self = this;
    var toolbar = this.container.createDiv("ql-toolbar");
    toolbar.style.cssText = "display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:0.5px solid var(--background-modifier-border);background:var(--background-secondary);flex-wrap:wrap;";
    // Platform filter tags (populated by setPlatforms)
    this.filterGroup = toolbar.createDiv("ql-platform-filters");
    this.filterGroup.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;";
    // Group mode selector
    var groupModeSel = document.createElement("select");
    groupModeSel.style.cssText = "padding:3px 20px 3px 6px;font-size:11px;border-radius:4px;border:0.5px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-normal);appearance:none;-webkit-appearance:none;-moz-appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 4px center;";
    var modes = [{ v: "category", t: "\u5206\u7C7B" }, { v: "platform", t: "\u5E73\u53F0" }, { v: "tags", t: "\u6807\u7B7E" }];
    for (var mi = 0; mi < modes.length; mi++) {
      var opt = document.createElement("option");
      opt.value = modes[mi].v;
      opt.textContent = modes[mi].t;
      if (modes[mi].v === "category") opt.selected = true;
      groupModeSel.appendChild(opt);
    }
    groupModeSel.addEventListener("change", function() { self.callbacks.onGroupModeChange(groupModeSel.value); });
    toolbar.appendChild(groupModeSel);
    // Add link button
    var addBtn = document.createElement("button");
    addBtn.textContent = "+ \u6DFB\u52A0";
    addBtn.style.cssText = "padding:3px 10px;font-size:11px;border-radius:4px;border:0.5px solid var(--interactive-accent);background:var(--interactive-accent);color:#fff;cursor:pointer;white-space:nowrap;";
    addBtn.addEventListener("click", function() { self.callbacks.onAddLink(); });
    toolbar.appendChild(addBtn);
    // Manage button
    var catBtn = document.createElement("button");
    catBtn.textContent = "\u7BA1\u7406";
    catBtn.style.cssText = "padding:3px 10px;font-size:11px;border-radius:4px;border:0.5px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-normal);cursor:pointer;white-space:nowrap;";
    catBtn.addEventListener("click", function() { self.callbacks.onManageCategories(); });
    toolbar.appendChild(catBtn);
    // Search (flex-grow, right-aligned)
    var searchGroup = toolbar.createDiv("");
    searchGroup.style.cssText = "display:flex;align-items:center;gap:4px;flex:1;min-width:100px;margin-left:auto;";
    var searchIcon = searchGroup.createSpan("");
    searchIcon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchIcon.style.cssText = "flex-shrink:0;opacity:0.4;";
    var searchInput = searchGroup.createEl("input", { type: "text", placeholder: "\u641C\u7D22...", cls: "ql-search-input" });
    searchInput.style.cssText = "flex:1;padding:3px 8px;font-size:11px;border-radius:4px;border:0.5px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-normal);min-width:60px;";
    searchInput.addEventListener("input", function() {
      self.searchText = searchInput.value.trim();
      if (self.debounceTimer) clearTimeout(self.debounceTimer);
      self.debounceTimer = setTimeout(function() { self.emitFilterChange(); }, SEARCH_DEBOUNCE_MS);
    });
    return toolbar;
  }
  emitFilterChange() {
    this.callbacks.onFilterChange({
      platform: this.currentPlatform,
      searchText: this.searchText
    });
  }
  getElement() {
    return this.el;
  }
};

// src/components/platformBadge.ts
var PlatformBadge = class {
  el;
  constructor(platformId, name, color) {
    this.el = document.createElement("span");
    this.el.className = "ql-platform-badge";
    this.el.textContent = name || platformId;
    this.el.style.backgroundColor = (color || "#6B7280") + "20";
    this.el.style.color = color || "#6B7280";
    this.el.style.borderColor = (color || "#6B7280") + "40";
    this.el.dataset.platformId = platformId;
  }
  getElement() {
    return this.el;
  }
  static createSvgIcon(platform) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.classList.add("ql-platform-icon");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    return svg;
  }
};

// src/views/linkListPanel.ts
var LinkListPanel = class {
  container;
  callbacks;
  collapseState = /* @__PURE__ */ new Map();
  currentDisplayedIndices = [];
  platforms = [];
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }
  render(data, filter, selectedIndex, groupMode) {
    this.container.empty();
    this.container.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;align-content:flex-start;padding:4px;";
    this.platforms = data.platforms || [];
    this.currentDisplayedIndices = [];
    var mode = groupMode || "category";
    let indexedLinks = data.links.map((link, i) => ({
      ...link,
      _originalIndex: i
    }));
    if (filter.platform !== "all") {
      indexedLinks = indexedLinks.filter((l) => l.platform === filter.platform);
    }
    if (filter.searchText) {
      const q = filter.searchText.toLowerCase();
      indexedLinks = indexedLinks.filter(
        (l) => l.title.toLowerCase().includes(q) || l.description && l.description.toLowerCase().includes(q)
      );
    }
    indexedLinks = this.sortLinks(indexedLinks);
    this.currentDisplayedIndices = indexedLinks.map((l) => l._originalIndex);
    if (indexedLinks.length === 0) {
      this.renderEmptyState();
      return;
    }
    // 按模式分组
    var groups = this.groupByMode(indexedLinks, data, mode);
    for (var gi = 0; gi < groups.length; gi++) {
      var g = groups[gi];
      this.renderCardGroup(g.label, g.icon || "", g.links, selectedIndex);
    }
  }
  groupByMode(links, data, mode) {
    var groups = [];
    if (mode === "platform") {
      var platMap = new Map();
      for (var i = 0; i < links.length; i++) {
        var pid = links[i].platform || "web";
        if (!platMap.has(pid)) platMap.set(pid, []);
        platMap.get(pid).push(links[i]);
      }
      platMap.forEach(function(ls, pid) {
        var def = (data.platforms || []).find(function(p) { return p.id === pid; });
        groups.push({ label: def ? def.name : pid, icon: "", links: ls });
      });
    } else if (mode === "tags") {
      var tagMap = new Map();
      for (var i = 0; i < links.length; i++) {
        var tgs = links[i].tags;
        if (!tgs || tgs.length === 0) {
          if (!tagMap.has("\u65E0\u6807\u7B7E")) tagMap.set("\u65E0\u6807\u7B7E", []);
          tagMap.get("\u65E0\u6807\u7B7E").push(links[i]);
        } else {
          for (var j = 0; j < tgs.length; j++) {
            if (!tagMap.has(tgs[j])) tagMap.set(tgs[j], []);
            tagMap.get(tgs[j]).push(links[i]);
          }
        }
      }
      tagMap.forEach(function(ls, tag) { groups.push({ label: tag, icon: "", links: ls }); });
    } else {
      // by category (default)
      var catMap = new Map();
      for (var i = 0; i < (data.categories || []).length; i++) { catMap.set(data.categories[i].name, []); }
      for (var i = 0; i < links.length; i++) {
        var cn = links[i].category || "";
        if (!catMap.has(cn)) catMap.set(cn, []);
        catMap.get(cn).push(links[i]);
      }
      catMap.forEach(function(ls, cn) {
        if (ls.length === 0) return;
        var cat = (data.categories || []).find(function(c) { return c.name === cn; });
        groups.push({ label: cn, icon: cat ? cat.icon : "", links: ls });
      });
    }
    return groups;
  }
  renderCardGroup(label, icon, links, selectedIndex) {
    var self = this;
    var card = this.container.createDiv("ql-group-card");
    card.style.cssText = "background:var(--background-primary);border:0.5px solid var(--background-modifier-border);border-radius:10px;overflow:hidden;flex:1 1 280px;min-width:260px;max-width:100%;position:relative;user-select:none;";

    // Card header (drag handle area)
    var cardHead = card.createDiv("ql-card-head");
    cardHead.style.cssText = "display:flex;align-items:center;gap:6px;padding:8px 10px;cursor:grab;background:var(--background-secondary);border-bottom:0.5px solid var(--background-modifier-border);user-select:none;";
    if (icon) { var ic2 = cardHead.createSpan(""); ic2.textContent = icon; ic2.style.fontSize = "14px"; }
    var hdr = cardHead.createSpan(""); hdr.textContent = label;
    hdr.style.cssText = "font-size:13px;font-weight:500;flex:1;";
    var cnt = cardHead.createSpan(""); cnt.textContent = links.length; cnt.style.cssText = "font-size:11px;color:var(--text-faint);background:var(--background-modifier-hover);padding:1px 6px;border-radius:8px;";
    // Drag on header - use CSS transform
    var isDragging2 = false, dx2 = 0, dy2 = 0, tx2 = 0, ty2 = 0, hasMoved2 = false;
    cardHead.addEventListener("mousedown", function(e) {
      e.preventDefault();
      isDragging2 = true; hasMoved2 = false;
      dx2 = e.clientX; dy2 = e.clientY;
      card.style.zIndex = "100";
      card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      cardHead.style.cursor = "grabbing";
    });
    document.addEventListener("mousemove", function(e) {
      if (!isDragging2) return;
      var mx = e.clientX - dx2, my = e.clientY - dy2;
      if (Math.abs(mx) > 3 || Math.abs(my) > 3) hasMoved2 = true;
      card.style.transform = "translate(" + mx + "px," + my + "px)";
    });
    document.addEventListener("mouseup", function() {
      if (!isDragging2) return;
      isDragging2 = false;
      card.style.zIndex = "1";
      card.style.boxShadow = "";
      card.style.transform = "";
      cardHead.style.cursor = "grab";
    });

    // Link rows
    var cardBody = card.createDiv("ql-card-body");
    cardBody.style.cssText = "";
    for (var i = 0; i < links.length; i++) {
      this.renderLinkRow(links[i], cardBody, selectedIndex);
    }

    // Resize handle
    var rsHandle = card.createDiv("ql-resize-handle");
    rsHandle.textContent = "\u25E2";
    rsHandle.style.cssText = "position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize;font-size:10px;color:var(--text-faint);line-height:12px;text-align:center;opacity:0;transition:opacity 0.15s;";
    card.addEventListener("mouseenter", function() { rsHandle.style.opacity = "1"; });
    card.addEventListener("mouseleave", function() { if (!resizingCard) rsHandle.style.opacity = "0"; });
    var resizingCard = false, rsx = 0, rsy = 0, rsw = 0, rsh = 0;
    rsHandle.addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      resizingCard = true;
      rsx = e.clientX; rsy = e.clientY;
      rsw = card.offsetWidth; rsh = card.offsetHeight;
      document.body.style.cursor = "nwse-resize";
      document.body.style.userSelect = "none";
    });
    document.addEventListener("mousemove", function(e) {
      if (!resizingCard) return;
      card.style.width = Math.max(200, rsw + (e.clientX - rsx)) + "px";
      card.style.maxWidth = "none";
      card.style.flex = "none";
    });
    document.addEventListener("mouseup", function() {
      if (!resizingCard) return;
      resizingCard = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      rsHandle.style.opacity = "0";
      card.style.maxWidth = "";
      card.style.flex = "";
    });
  }
  renderLinkRow(link, body, selectedIndex) {
    var self = this;
    var row = body.createDiv("ql-link-row");
    row.style.cssText = "display:flex;align-items:center;gap:6px;padding:6px 10px;cursor:pointer;border-bottom:0.5px solid var(--background-modifier-border);transition:background 0.1s;font-size:12px;position:relative;";
    row.dataset.linkIndex = String(link._originalIndex);
    if (link._originalIndex === selectedIndex) row.style.background = "var(--background-modifier-active)";
    row.addEventListener("mouseenter", function() { if (link._originalIndex !== selectedIndex) row.style.background = "var(--background-modifier-hover)"; });
    row.addEventListener("mouseleave", function() { if (link._originalIndex !== selectedIndex) row.style.background = ""; });
    if (link.favorite) {
      var s = row.createSpan(""); s.textContent = "\u2B50"; s.style.fontSize = "11px"; s.style.flexShrink = "0";
    }
    var titleSpan = row.createSpan("ql-link-title");
    titleSpan.textContent = link.title;
    titleSpan.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;";
    var platDef4 = this.platforms.find(function(p) { return p.id === link.platform; });
    var rowBadge = row.createSpan("ql-platform-badge");
    rowBadge.textContent = platDef4 ? platDef4.name : link.platform;
    rowBadge.style.cssText = "font-size:10px;padding:1px 5px;border-radius:3px;flex-shrink:0;";
    if (platDef4) {
      rowBadge.style.backgroundColor = platDef4.color + "20";
      rowBadge.style.color = platDef4.color;
      rowBadge.style.border = "0.5px solid " + platDef4.color + "40";
    }
    // Gear button - popup goes to document.body to avoid clipping
    var gearActive = false;
    var rowGear = row.createEl("button");
    rowGear.textContent = "\u2699";
    rowGear.style.cssText = "cursor:pointer;font-size:12px;opacity:0.3;flex-shrink:0;background:none;border:none;padding:0 2px;line-height:1;color:var(--text-muted);position:relative;";
    rowGear.addEventListener("mouseenter", function() { rowGear.style.opacity = "1"; });
    rowGear.addEventListener("mouseleave", function() { rowGear.style.opacity = "0.3"; });
    rowGear.addEventListener("click", function(e) {
      e.stopPropagation(); e.preventDefault();
      gearActive = true;
      setTimeout(function() { gearActive = false; }, 300);
      // Close existing popup (toggle behavior)
      var existing = document.querySelector(".ql-link-popup");
      if (existing) { existing.remove(); return; }
      // Create popup on document.body to avoid parent overflow:hidden clipping
      var pop = document.createElement("div");
      pop.className = "ql-link-popup";
      pop.style.cssText = "position:fixed;z-index:99999;background:var(--background-primary);border:1px solid var(--background-modifier-border);border-radius:8px;padding:4px;min-width:120px;box-shadow:0 8px 30px rgba(0,0,0,0.25);";
      var rect = rowGear.getBoundingClientRect();
      pop.style.left = Math.min(rect.right - 115, window.innerWidth - 130) + "px";
      pop.style.top = (rect.bottom + 4) + "px";
      function closePop() { if (pop.parentNode) pop.remove(); }
      var menuItems = [
        { t: "\u7F16\u8F91", a: function() { closePop(); self.callbacks.onEditLink(link._originalIndex); } },
        { t: link.favorite ? "\u53D6\u6D88\u6536\u85CF" : "\u2606 \u6536\u85CF", a: function() { closePop(); self.callbacks.onToggleFavorite(link._originalIndex); } },
        { t: "\u590D\u5236\u94FE\u63A5", a: function() { closePop(); self.callbacks.onCopyUrl(link.url); } },
        { t: "\u274C \u5220\u9664", a: function() { closePop(); self.callbacks.onDeleteLink(link._originalIndex); } }
      ];
      for (var mi = 0; mi < menuItems.length; mi++) {
        var mb = document.createElement("div");
        mb.textContent = menuItems[mi].t;
        mb.className = "ql-popup-item";
        mb.style.cssText = "padding:5px 10px;font-size:12px;cursor:pointer;border-radius:4px;white-space:nowrap;";
        mb.addEventListener("mouseenter", function() { this.style.background = "var(--background-modifier-hover)"; });
        mb.addEventListener("mouseleave", function() { this.style.background = ""; });
        (function(item) { mb.addEventListener("click", function(e2) { e2.stopPropagation(); gearActive = false; item.a(); }); })(menuItems[mi]);
        pop.appendChild(mb);
      }
      document.body.appendChild(pop);
      // Prevent immediate close from this click bubbling
      setTimeout(function() {
        pop.addEventListener("click", function(e3) { e3.stopPropagation(); });
      }, 0);
    });
    row.addEventListener("click", function() {
      if (gearActive) return;
      self.callbacks.onSelectLink(link._originalIndex);
      if (self.openMethod === "obsidian") window.open(link.url);
      else window.open(link.url, "_blank");
    });
  }
  highlightSelected(originalIndex) {
    this.container.querySelectorAll(".ql-link-item").forEach((el) => {
      el.classList.remove("ql-link-selected");
    });
    const target = this.container.querySelector(
      `.ql-link-item[data-link-index="${originalIndex}"]`
    );
    if (target) {
      target.classList.add("ql-link-selected");
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
  renderEmptyState() {
    const empty = this.container.createDiv("ql-empty-state");
    const icon = empty.createSpan({ text: "\u{1F4ED}", cls: "ql-empty-icon" });
    empty.createEl("p", { text: "\u6682\u65E0\u5339\u914D\u7684\u94FE\u63A5" });
    empty.createEl("p", { text: '\u70B9\u51FB\u9876\u90E8 "+ \u6DFB\u52A0\u94FE\u63A5" \u5F00\u59CB\u4F7F\u7528', cls: "ql-empty-hint" });
  }
  renderCategoryGroup(category, links, selectedIndex) {
    const group = this.container.createDiv("ql-category-group");
    const header = group.createDiv("ql-category-header");
    const isCollapsed = this.collapseState.get(category.name) ?? false;
    const arrow = header.createSpan("ql-category-arrow");
    arrow.textContent = isCollapsed ? "\u25B6" : "\u25BC";
    const icon = header.createSpan("ql-category-icon");
    icon.textContent = category.icon;
    const name = header.createSpan("ql-category-name");
    name.textContent = category.name;
    const count = header.createSpan("ql-category-count");
    count.textContent = `(${links.length})`;
    header.addEventListener("click", () => {
      const newState = !this.collapseState.get(category.name);
      this.collapseState.set(category.name, newState);
      arrow.textContent = newState ? "\u25B6" : "\u25BC";
      const itemsContainer2 = group.querySelector(".ql-link-items");
      if (itemsContainer2 instanceof HTMLElement) {
        itemsContainer2.style.display = newState ? "none" : "";
      }
    });
    const itemsContainer = group.createDiv("ql-link-items");
    if (isCollapsed) {
      itemsContainer.style.display = "none";
    }
    for (const link of links) {
      this.renderLinkItem(link, itemsContainer, selectedIndex);
    }
  }
  renderLinkItem(link, parent, selectedIndex) {
    var self = this;
    var item = parent.createDiv("ql-link-item");
    item.dataset.linkIndex = String(link._originalIndex);
    item.dataset.linkTitle = link.title;
    item.style.position = "relative";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "6px";
    if (link._originalIndex === selectedIndex) {
      item.classList.add("ql-link-selected");
    }
    if (link.favorite) {
      var star = item.createSpan("ql-link-favorite");
      star.textContent = "\u2B50";
      star.title = "\u5DF2\u6536\u85CF";
    }
    var title = item.createSpan("ql-link-title");
    title.textContent = link.title;
    var platDef = this.platforms.find(p => p.id === link.platform);
    var badge = new PlatformBadge(link.platform, platDef ? platDef.name : link.platform, platDef ? platDef.color : "#6B7280");
    item.appendChild(badge.getElement());
    item.addEventListener("click", () => {
      self.callbacks.onSelectLink(link._originalIndex);
      if (self.openMethod === "obsidian") {
        window.open(link.url);
      } else {
        window.open(link.url, "_blank");
      }
    });
    // 设置图标
    var gearBtn = item.createSpan("ql-link-gear");
    gearBtn.textContent = "\u2699\uFE0F";
    gearBtn.title = "\u8BBE\u7F6E";
    gearBtn.style.cssText = "cursor:pointer;margin-left:auto;padding:2px 4px;font-size:14px;opacity:0.5;flex-shrink:0;";
    gearBtn.addEventListener("mouseenter", function() { gearBtn.style.opacity = "1"; });
    gearBtn.addEventListener("mouseleave", function() { gearBtn.style.opacity = "0.5"; });
    gearBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      var existing = item.querySelector(".ql-link-popup");
      if (existing) { existing.remove(); return; }
      var popup = item.createDiv("ql-link-popup");
      popup.style.cssText = "position:absolute;right:4px;top:100%;z-index:1000;background:var(--background-primary);border:0.5px solid var(--background-modifier-border);border-radius:6px;padding:4px;min-width:120px;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
      var actions = [
        { text: "\u7F16\u8F91", action: function() { popup.remove(); self.callbacks.onEditLink(link._originalIndex); } },
        { text: link.favorite ? "\u53D6\u6D88\u6536\u85CF" : "\u2606 \u6536\u85CF", action: function() { popup.remove(); self.callbacks.onToggleFavorite(link._originalIndex); } },
        { text: "\u590D\u5236\u94FE\u63A5", action: function() { popup.remove(); self.callbacks.onCopyUrl(link.url); } },
        { text: "\u274C \u5220\u9664", action: function() { popup.remove(); self.callbacks.onDeleteLink(link._originalIndex); }, cls: "ql-popup-danger" }
      ];
      for (var i = 0; i < actions.length; i++) {
        var btn = popup.createDiv("ql-popup-item");
        btn.textContent = actions[i].text;
        btn.style.cssText = "padding:6px 10px;font-size:13px;cursor:pointer;border-radius:4px;white-space:nowrap;" + (actions[i].cls === "ql-popup-danger" ? "color:var(--text-error);" : "");
        btn.addEventListener("mouseenter", function() { this.style.background = "var(--background-modifier-hover)"; });
        btn.addEventListener("mouseleave", function() { this.style.background = ""; });
        (function(a) { btn.addEventListener("click", function(e2) { e2.stopPropagation(); a.action(); }); })(actions[i]);
      }
      setTimeout(function() {
        document.addEventListener("click", function closePopup(e3) {
          if (popup.parentElement) { popup.remove(); }
          document.removeEventListener("click", closePopup);
        }, { once: true });
      }, 0);
    });
    return item;
  }
  groupByCategory(links, categories) {
    const grouped = /* @__PURE__ */ new Map();
    for (const category of categories) {
      grouped.set(category.name, []);
    }
    for (const link of links) {
      if (!grouped.has(link.category)) {
        grouped.set(link.category, []);
      }
      grouped.get(link.category).push(link);
    }
    for (const [key, value] of grouped) {
      if (value.length === 0) {
        grouped.delete(key);
      }
    }
    return grouped;
  }
  sortLinks(links) {
    const sorted = [...links];
    sorted.sort((a, b) => {
      if (a.favorite && !b.favorite)
        return -1;
      if (!a.favorite && b.favorite)
        return 1;
      if (a.updated && b.updated) {
        return b.updated.localeCompare(a.updated);
      }
      return 0;
    });
    return sorted;
  }
};

// src/views/linkDetailPanel.ts
var LinkDetailPanel = class {
  container;
  callbacks;
  platforms = [];
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }
  render(link, originalIndex) {
    this.container.empty();
    if (!link) {
      this.renderEmptyState();
      return;
    }
    this.renderDetailCard(link, originalIndex);
  }
  renderEmptyState() {
    const empty = this.container.createDiv("ql-detail-empty");
    const icon = empty.createSpan({ text: "\u{1F4CE}", cls: "ql-detail-empty-icon" });
    empty.createEl("h3", { text: "Quick Links" });
    empty.createEl("p", { text: "\u9009\u62E9\u4E00\u4E2A\u94FE\u63A5\u67E5\u770B\u8BE6\u60C5" });
    empty.createEl("p", { text: "\u70B9\u51FB\u5DE6\u4FA7\u94FE\u63A5\u9879\u5373\u53EF\u67E5\u770B", cls: "ql-empty-hint" });
  }
  renderDetailCard(link, originalIndex) {
    const card = this.container.createDiv("ql-detail-card");
    const header = card.createDiv("ql-detail-header");
    if (link.favorite) {
      const favIcon = header.createSpan("ql-detail-fav");
      favIcon.textContent = "\u2B50";
      favIcon.title = "\u5DF2\u6536\u85CF";
    }
    const title = header.createEl("h2", {
      text: link.title,
      cls: "ql-detail-title"
    });
    const meta = card.createDiv("ql-detail-meta");
    const platformItem = meta.createDiv("ql-meta-item");
    platformItem.createSpan({ text: "\u5E73\u53F0\uFF1A", cls: "ql-meta-label" });
    var platDef2 = this.platforms.find(p => p.id === link.platform);
    var platBadge2 = platformItem.createSpan({
      text: platDef2 ? platDef2.name : link.platform,
      cls: "ql-platform-badge"
    });
    if (platDef2) {
      platBadge2.style.backgroundColor = platDef2.color + "20";
      platBadge2.style.color = platDef2.color;
      platBadge2.style.borderColor = platDef2.color + "40";
    }
    const categoryItem = meta.createDiv("ql-meta-item");
    categoryItem.createSpan({ text: "\u5206\u7C7B\uFF1A", cls: "ql-meta-label" });
    categoryItem.createSpan({ text: link.category, cls: "ql-meta-value" });
    if (link.updated) {
      const updatedItem = meta.createDiv("ql-meta-item");
      updatedItem.createSpan({ text: "\u66F4\u65B0\uFF1A", cls: "ql-meta-label" });
      updatedItem.createSpan({ text: link.updated, cls: "ql-meta-value" });
    }
    if (link.description) {
      const desc = card.createDiv("ql-detail-description");
      const descTitle = desc.createDiv("ql-detail-section-title");
      descTitle.textContent = "\u63CF\u8FF0";
      desc.createEl("p", { text: link.description, cls: "ql-detail-desc-text" });
    }
    const urlSection = card.createDiv("ql-detail-url-section");
    const urlSectionTitle = urlSection.createDiv("ql-detail-section-title");
    urlSectionTitle.textContent = "\u94FE\u63A5\u5730\u5740";
    const urlInput = urlSection.createEl("input", {
      type: "text",
      value: link.url,
      cls: "ql-detail-url-input"
    });
    urlInput.setAttribute("readonly", "true");
    const actions = card.createDiv("ql-detail-actions");
    const openBtn = actions.createEl("button", {
      text: "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00",
      cls: "ql-btn ql-btn-primary"
    });
    openBtn.addEventListener("click", () => {
      this.callbacks.onOpenUrl(link.url);
    });
    const copyBtn = actions.createEl("button", {
      text: "\u590D\u5236\u94FE\u63A5",
      cls: "ql-btn ql-btn-secondary ql-btn-copy"
    });
    copyBtn.addEventListener("click", () => {
      this.callbacks.onCopyUrl(link.url);
    });
    const favBtn = actions.createEl("button", {
      text: link.favorite ? "\u53D6\u6D88\u6536\u85CF" : "\u6536\u85CF",
      cls: "ql-btn ql-btn-secondary"
    });
    favBtn.addEventListener("click", () => {
      this.callbacks.onToggleFavorite(originalIndex);
      favBtn.textContent = link.favorite ? "\u6536\u85CF" : "\u53D6\u6D88\u6536\u85CF";
      setTimeout(() => {
        favBtn.textContent = link.favorite ? "\u53D6\u6D88\u6536\u85CF" : "\u6536\u85CF";
      }, 500);
    });
    const editBtn = actions.createEl("button", {
      text: "\u7F16\u8F91",
      cls: "ql-btn ql-btn-secondary"
    });
    editBtn.addEventListener("click", () => {
      this.callbacks.onEditLink(originalIndex);
    });
    const deleteBtn = actions.createEl("button", {
      text: "\u5220\u9664",
      cls: "ql-btn ql-btn-danger"
    });
    deleteBtn.addEventListener("click", () => {
      const confirmed = confirm(`\u786E\u5B9A\u8981\u5220\u9664\u94FE\u63A5 "${link.title}" \u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`);
      if (confirmed) {
        this.callbacks.onDeleteLink(originalIndex);
      }
    });
  }
};

// src/modals/linkEditModal.ts
var import_obsidian2 = require("obsidian");
var LinkEditModal = class extends import_obsidian2.Modal {
  categories;
  platforms;
  existingLink;
  onSubmit;
  titleInput;
  urlInput;
  descInput;
  categorySelect;
  platformSelect;
  favoriteCheck;
  tagsInput;
  constructor(app, categories, platforms, existingLink, onSubmit) {
    super(app);
    this.categories = categories;
    this.platforms = platforms || [];
    this.existingLink = existingLink;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    const isEdit = this.existingLink !== null;
    contentEl.empty();
    contentEl.addClass("ql-modal");
    contentEl.createEl("h2", {
      text: isEdit ? "\u7F16\u8F91\u94FE\u63A5" : "\u6DFB\u52A0\u94FE\u63A5",
      cls: "ql-modal-title"
    });
    new import_obsidian2.Setting(contentEl).setName("\u6807\u9898").setDesc("\u94FE\u63A5\u663E\u793A\u540D\u79F0").addText((text) => {
      this.titleInput = text.inputEl;
      text.setPlaceholder("\u8F93\u5165\u94FE\u63A5\u6807\u9898");
      if (this.existingLink) {
        text.setValue(this.existingLink.title);
      }
      text.inputEl.addClass("ql-form-input");
    });
    new import_obsidian2.Setting(contentEl).setName("URL").setDesc("\u5B8C\u6574\u7684\u94FE\u63A5\u5730\u5740").addText((text) => {
      this.urlInput = text.inputEl;
      text.setPlaceholder("https://docs.qq.com/xxx");
      if (this.existingLink) {
        text.setValue(this.existingLink.url);
      }
      text.inputEl.addClass("ql-form-input");
    });
    new import_obsidian2.Setting(contentEl).setName("\u63CF\u8FF0").setDesc("\u94FE\u63A5\u7684\u6587\u5B57\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09").addTextArea((text) => {
      this.descInput = text.inputEl;
      text.setPlaceholder("\u7B80\u8981\u63CF\u8FF0\u6B64\u94FE\u63A5\u7684\u7528\u9014");
      if (this.existingLink && this.existingLink.description) {
        text.setValue(this.existingLink.description);
      }
      text.inputEl.addClass("ql-form-textarea");
      text.inputEl.rows = 3;
    });
    new import_obsidian2.Setting(contentEl).setName("\u5206\u7C7B").setDesc("\u9009\u62E9\u6240\u5C5E\u5206\u7C7B").addDropdown((dropdown) => {
      this.categorySelect = dropdown.selectEl;
      if (this.categories.length === 0) {
        dropdown.addOption("", "-- \u6682\u65E0\u5206\u7C7B --");
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
      dropdown.selectEl.addClass("ql-form-select");
    });
    new import_obsidian2.Setting(contentEl).setName("\u5E73\u53F0").setDesc("\u94FE\u63A5\u6240\u5C5E\u5E73\u53F0").addDropdown((dropdown) => {
      this.platformSelect = dropdown.selectEl;
      if (this.platforms.length === 0) {
        dropdown.addOption("web", "\u7F51\u9875\u94FE\u63A5");
      } else {
        for (const plat of this.platforms) {
          dropdown.addOption(plat.id, plat.name);
        }
      }
      if (this.existingLink) {
        dropdown.setValue(this.existingLink.platform);
      } else if (this.platforms.length > 0) {
        dropdown.setValue(this.platforms[0].id);
      }
      dropdown.selectEl.addClass("ql-form-select");
    });
    new import_obsidian2.Setting(contentEl).setName("\u6536\u85CF").setDesc("\u6807\u8BB0\u4E3A\u6536\u85CF\uFF0C\u5C06\u5728\u5217\u8868\u4E2D\u7F6E\u9876\u663E\u793A").addToggle((toggle) => {
      this.favoriteCheck = toggle.toggleEl;
      toggle.setValue(this.existingLink?.favorite ?? false);
    });
    new import_obsidian2.Setting(contentEl).setName("\u6807\u7B7E").setDesc("\u7528\u9017\u53F7\u5206\u9694\uFF0C\u5982: IoT, \u786C\u4EF6, \u9700\u6C42").addText(
      (text) => {
        this.tagsInput = text.inputEl;
        text.setPlaceholder("IoT, \u786C\u4EF6, \u9700\u6C42");
        if (this.existingLink && this.existingLink.tags) {
          text.setValue(this.existingLink.tags.join(", "));
        }
        text.inputEl.addClass("ql-form-input");
      }
    );
    const btnGroup = contentEl.createDiv("ql-modal-buttons");
    const saveBtn = btnGroup.createEl("button", {
      text: "\u4FDD\u5B58",
      cls: "ql-btn ql-btn-primary"
    });
    saveBtn.addEventListener("click", () => {
      if (this.validateAndSubmit()) {
        this.close();
      }
    });
    const cancelBtn = btnGroup.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "ql-btn ql-btn-secondary"
    });
    cancelBtn.addEventListener("click", () => {
      this.close();
    });
    if (isEdit) {
      const deleteBtn = btnGroup.createEl("button", {
        text: "\u5220\u9664\u6B64\u94FE\u63A5",
        cls: "ql-btn ql-btn-danger"
      });
      deleteBtn.style.marginLeft = "auto";
      deleteBtn.addEventListener("click", () => {
        const confirmed = confirm(`\u786E\u5B9A\u8981\u5220\u9664\u94FE\u63A5 "${this.existingLink.title}" \u5417\uFF1F`);
        if (confirmed) {
          this.close();
        }
      });
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  validateAndSubmit() {
    const title = this.titleInput.value.trim();
    const url = this.urlInput.value.trim();
    const description = this.descInput.value.trim() || void 0;
    const category = this.categorySelect.value;
    const platform = this.platformSelect.value;
    const favorite = this.favoriteCheck.checked;
    var tagsStr2 = this.tagsInput ? this.tagsInput.value.trim() : "";
    var tags = tagsStr2 ? tagsStr2.split(",").map(function(t) { return t.trim(); }).filter(function(t) { return t; }) : [];
    if (!title) {
      new import_obsidian2.Notice("\u8BF7\u8F93\u5165\u94FE\u63A5\u6807\u9898");
      this.titleInput.focus();
      return false;
    }
    if (!url) {
      new import_obsidian2.Notice("\u8BF7\u8F93\u5165\u94FE\u63A5\u5730\u5740");
      this.urlInput.focus();
      return false;
    }
    if (!/^https?:\/\/.+/.test(url)) {
      new import_obsidian2.Notice("\u8BF7\u8F93\u5165\u6709\u6548\u7684 URL\uFF08\u4EE5 http:// \u6216 https:// \u5F00\u5934\uFF09");
      this.urlInput.focus();
      return false;
    }
    if (!category) {
      new import_obsidian2.Notice("\u8BF7\u9009\u62E9\u6216\u521B\u5EFA\u5206\u7C7B");
      return false;
    }
    const link = {
      title,
      url,
      description,
      category,
      platform,
      favorite,
      tags,
      updated: this.existingLink?.updated || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    };
    this.onSubmit(link);
    return true;
  }
};

// src/modals/categoryManageModal.ts
var import_obsidian3 = require("obsidian");
var CategoryManageModal = class extends import_obsidian3.Modal {
  categories;
  platforms;
  links;
  onSubmit;
  constructor(app, categories, platforms, links, onSubmit) {
    super(app);
    this.categories = Array.isArray(categories) ? [...categories] : [];
    var plats = Array.isArray(platforms) && platforms.length > 0 ? platforms : DEFAULT_PLATFORMS;
    this.platforms = [...plats];
    this.links = links;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    var self = this;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("ql-modal");
    // Collect unique tags from all links
    var tagMap = /* @__PURE__ */ new Map();
    for (var ti = 0; ti < this.links.length; ti++) {
      var linkTags = this.links[ti].tags;
      if (linkTags && linkTags.length) {
        for (var tj = 0; tj < linkTags.length; tj++) {
          var tn = linkTags[tj].trim();
          if (!tn) continue;
          tagMap.set(tn, (tagMap.get(tn) || 0) + 1);
        }
      }
    }
    var sortedTags = Array.from(tagMap.entries()).sort(function(a, b) { return b[1] - a[1]; });
    contentEl.createEl("h2", {
      text: "\u7BA1\u7406\u5206\u7C7B\u3001\u5E73\u53F0\u4E0E\u6807\u7B7E",
      cls: "ql-modal-title"
    });
    // --- 分类 ---
    contentEl.createEl("h3", { text: "\u5206\u7C7B" });
    var listContainer = contentEl.createDiv("ql-category-list-modal");
    if (this.categories.length === 0) {
      listContainer.createEl("p", { text: "\u6682\u65E0\u5206\u7C7B\uFF0C\u8BF7\u6DFB\u52A0", cls: "ql-empty-hint" });
    }
    for (let i = 0; i < this.categories.length; i++) {
      this.renderCategoryItem(listContainer, this.categories[i], i);
    }
    contentEl.createEl("hr", { cls: "ql-modal-divider" });
    this.renderAddForm(contentEl);
    // --- 平台 ---
    contentEl.createEl("hr", { cls: "ql-modal-divider" });
    contentEl.createEl("h3", { text: "\u5E73\u53F0" });
    var platList = contentEl.createDiv("ql-category-list-modal");
    if (this.platforms.length === 0) {
      platList.createEl("p", { text: "\u6682\u65E0\u5E73\u53F0\uFF0C\u8BF7\u6DFB\u52A0", cls: "ql-empty-hint" });
    }
    for (let i = 0; i < this.platforms.length; i++) {
      var pitem = platList.createDiv("ql-category-list-item");
      var pcolor = pitem.createSpan("");
      pcolor.style.cssText = "display:inline-block;width:12px;height:12px;border-radius:3px;background:" + this.platforms[i].color + ";margin-right:8px;";
      var pnameSpan = pitem.createSpan("ql-category-item-name");
      pnameSpan.textContent = this.platforms[i].name;
      var pidSpan = pitem.createSpan("ql-category-item-count");
      pidSpan.textContent = this.platforms[i].id;
      var pdelBtn = pitem.createEl("button", { text: "\u5220\u9664", cls: "ql-btn ql-btn-small ql-btn-danger" });
      (function(idx) {
        pdelBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (confirm('\u786E\u5B9A\u5220\u9664\u5E73\u53F0 "' + self.platforms[idx].name + '" \u5417\uFF1F')) {
            self.platforms.splice(idx, 1);
            self.onOpen();
          }
        });
      })(i);
    }
    var platForm = contentEl.createDiv("ql-add-category-form");
    platForm.createEl("label", { text: "\u6DFB\u52A0\u65B0\u5E73\u53F0", cls: "ql-form-label" });
    var platInputs = platForm.createDiv("ql-add-category-inputs");
    var pidInput = platInputs.createEl("input", { type: "text", placeholder: "ID", cls: "ql-form-input", attr: { style: "width: 100px" } });
    var pnameInput = platInputs.createEl("input", { type: "text", placeholder: "\u540D\u79F0", cls: "ql-form-input", attr: { style: "flex: 1" } });
    var pcolorInput = platInputs.createEl("input", { type: "text", placeholder: "#2B7FF5", value: "#2B7FF5", cls: "ql-form-input", attr: { style: "width: 80px" } });
    var paddBtn = platInputs.createEl("button", { text: "\u6DFB\u52A0", cls: "ql-btn ql-btn-primary" });
    paddBtn.addEventListener("click", function() {
      var id = pidInput.value.trim();
      var name = pnameInput.value.trim();
      var color = pcolorInput.value.trim() || "#6B7280";
      if (!id || !name) { new import_obsidian3.Notice("\u8BF7\u586B\u5199\u5E73\u53F0 ID \u548C\u540D\u79F0"); return; }
      if (self.platforms.some(function(p) { return p.id === id; })) { new import_obsidian3.Notice('\u5E73\u53F0 ID "' + id + '" \u5DF2\u5B58\u5728'); return; }
      self.platforms.push({ id: id, name: name, color: color });
      self.onOpen();
    });
    // --- 标签 ---
    contentEl.createEl("hr", { cls: "ql-modal-divider" });
    contentEl.createEl("h3", { text: "\u6807\u7B7E" });
    var tagList = contentEl.createDiv("ql-category-list-modal");
    if (sortedTags.length === 0) {
      tagList.createEl("p", { text: "\u6682\u65E0\u6807\u7B7E\uFF0C\u8BF7\u6DFB\u52A0", cls: "ql-empty-hint" });
    }
    for (var si = 0; si < sortedTags.length; si++) {
      var tagName = sortedTags[si][0];
      var tagCount = sortedTags[si][1];
      var ttitem = tagList.createDiv("ql-category-list-item");
      var tnameSpan = ttitem.createSpan("ql-category-item-name");
      tnameSpan.textContent = tagName;
      var tcntSpan = ttitem.createSpan("ql-category-item-count");
      tcntSpan.textContent = "(" + tagCount + " \u4E2A\u94FE\u63A5)";
      var trenameBtn = ttitem.createEl("button", { text: "\u91CD\u547D\u540D", cls: "ql-btn ql-btn-small" });
      (function(oldName) {
        trenameBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var newName = prompt('\u8F93\u5165\u65B0\u6807\u7B7E\u540D\uFF1A', oldName);
          if (!newName || newName.trim() === oldName) return;
          newName = newName.trim();
          for (var li = 0; li < self.links.length; li++) {
            var lt = self.links[li].tags;
            if (lt && lt.indexOf(oldName) >= 0) {
              self.links[li].tags = lt.map(function(t) { return t === oldName ? newName : t; });
            }
          }
          self.onOpen();
        });
      })(tagName);
      var tdelBtn = ttitem.createEl("button", { text: "\u5220\u9664", cls: "ql-btn ql-btn-small ql-btn-danger" });
      (function(oldName) {
        tdelBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (confirm('\u786E\u5B9A\u5220\u9664\u6807\u7B7E "' + oldName + '" \u5417\uFF1F\u5C06\u4ECE\u6240\u6709\u94FE\u63A5\u4E2D\u79FB\u9664\u3002')) {
            for (var li = 0; li < self.links.length; li++) {
              var lt = self.links[li].tags;
              if (lt) {
                self.links[li].tags = lt.filter(function(t) { return t !== oldName; });
              }
            }
            self.onOpen();
          }
        });
      })(tagName);
    }
    var tagForm = contentEl.createDiv("ql-add-category-form");
    tagForm.createEl("label", { text: "\u6DFB\u52A0\u65B0\u6807\u7B7E", cls: "ql-form-label" });
    var tagInputs = tagForm.createDiv("ql-add-category-inputs");
    var tagnameInput = tagInputs.createEl("input", { type: "text", placeholder: "\u6807\u7B7E\u540D\u79F0", cls: "ql-form-input", attr: { style: "flex: 1" } });
    var taddBtn = tagInputs.createEl("button", { text: "\u6DFB\u52A0", cls: "ql-btn ql-btn-primary" });
    taddBtn.addEventListener("click", function() {
      var tn = tagnameInput.value.trim();
      if (!tn) { new import_obsidian3.Notice("\u8BF7\u8F93\u5165\u6807\u7B7E\u540D\u79F0"); return; }
      if (tagMap.has(tn)) { new import_obsidian3.Notice('\u6807\u7B7E "' + tn + '" \u5DF2\u5B58\u5728'); return; }
      tagMap.set(tn, 0);
      sortedTags.push([tn, 0]);
      self.onOpen();
    });
    // --- 按钮 ---
    var btnGroup = contentEl.createDiv("ql-modal-buttons");
    var saveBtn = btnGroup.createEl("button", { text: "\u5B8C\u6210", cls: "ql-btn ql-btn-primary" });
    saveBtn.addEventListener("click", () => {
      this.onSubmit([...this.categories], [...this.platforms]);
      this.close();
    });
    var cancelBtn = btnGroup.createEl("button", { text: "\u53D6\u6D88", cls: "ql-btn ql-btn-secondary" });
    cancelBtn.addEventListener("click", () => { this.close(); });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  renderCategoryItem(container, category, index) {
    const item = container.createDiv("ql-category-list-item");
    item.dataset.categoryIndex = String(index);
    const icon = item.createSpan("ql-category-item-icon");
    icon.textContent = category.icon;
    const name = item.createSpan("ql-category-item-name");
    name.textContent = category.name;
    const count = this.links.filter((l) => l.category === category.name).length;
    const countEl = item.createSpan("ql-category-item-count");
    countEl.textContent = `${count} \u4E2A\u94FE\u63A5`;
    const editBtn = item.createEl("button", {
      text: "\u7F16\u8F91",
      cls: "ql-btn ql-btn-small ql-btn-secondary"
    });
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.editCategory(index, item);
    });
    const deleteBtn = item.createEl("button", {
      text: "\u5220\u9664",
      cls: "ql-btn ql-btn-small ql-btn-danger"
    });
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteCategory(index);
    });
  }
  editCategory(index, itemEl) {
    const category = this.categories[index];
    const name = category.name;
    itemEl.empty();
    const iconInput = itemEl.createEl("input", {
      type: "text",
      value: category.icon,
      cls: "ql-form-input ql-category-edit-icon",
      attr: { maxlength: "2", style: "width: 40px" }
    });
    const nameInput = itemEl.createEl("input", {
      type: "text",
      value: name,
      cls: "ql-form-input ql-category-edit-name",
      attr: { style: "flex: 1" }
    });
    const saveBtn = itemEl.createEl("button", {
      text: "\u4FDD\u5B58",
      cls: "ql-btn ql-btn-small ql-btn-primary"
    });
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const newName = nameInput.value.trim();
      const newIcon = iconInput.value.trim() || "\u{1F4CB}";
      if (!newName) {
        new import_obsidian3.Notice("\u5206\u7C7B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      if (newName !== name && this.categories.some((c) => c.name === newName)) {
        new import_obsidian3.Notice(`\u5206\u7C7B "${newName}" \u5DF2\u5B58\u5728`);
        return;
      }
      if (newName !== name) {
        for (const link of this.links) {
          if (link.category === name) {
            link.category = newName;
          }
        }
      }
      this.categories[index] = { name: newName, icon: newIcon };
      this.refreshList();
    });
    const cancelBtn = itemEl.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "ql-btn ql-btn-small ql-btn-secondary"
    });
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.refreshList();
    });
    nameInput.focus();
  }
  deleteCategory(index) {
    const category = this.categories[index];
    const linkCount = this.links.filter((l) => l.category === category.name).length;
    let confirmed = false;
    if (linkCount > 0) {
      confirmed = confirm(
        `\u5206\u7C7B "${category.name}" \u4E0B\u6709 ${linkCount} \u4E2A\u94FE\u63A5\u3002
\u5220\u9664\u5206\u7C7B\u540E\uFF0C\u8FD9\u4E9B\u94FE\u63A5\u7684\u5206\u7C7B\u5C06\u53D8\u4E3A\u7A7A\u767D\u3002

\u786E\u5B9A\u8981\u5220\u9664\u5417\uFF1F`
      );
    } else {
      confirmed = confirm(`\u786E\u5B9A\u8981\u5220\u9664\u5206\u7C7B "${category.name}" \u5417\uFF1F`);
    }
    if (!confirmed)
      return;
    this.categories.splice(index, 1);
    this.refreshList();
  }
  refreshList() {
    const listContainer = this.contentEl.querySelector(".ql-category-list-modal");
    if (listContainer instanceof HTMLElement) {
      listContainer.empty();
      if (this.categories.length === 0) {
        listContainer.createEl("p", {
          text: "\u6682\u65E0\u5206\u7C7B\uFF0C\u8BF7\u6DFB\u52A0",
          cls: "ql-empty-hint"
        });
      }
      for (let i = 0; i < this.categories.length; i++) {
        this.renderCategoryItem(listContainer, this.categories[i], i);
      }
    }
  }
  renderAddForm(container) {
    const formGroup = container.createDiv("ql-add-category-form");
    formGroup.createEl("label", {
      text: "\u6DFB\u52A0\u65B0\u5206\u7C7B",
      cls: "ql-form-label"
    });
    const inputsRow = formGroup.createDiv("ql-add-category-inputs");
    const iconInput = inputsRow.createEl("input", {
      type: "text",
      placeholder: "\u56FE\u6807",
      value: "\u{1F4CB}",
      cls: "ql-form-input",
      attr: { maxlength: "2", style: "width: 50px" }
    });
    const nameInput = inputsRow.createEl("input", {
      type: "text",
      placeholder: "\u5206\u7C7B\u540D\u79F0",
      cls: "ql-form-input",
      attr: { style: "flex: 1" }
    });
    const addBtn = inputsRow.createEl("button", {
      text: "\u6DFB\u52A0",
      cls: "ql-btn ql-btn-primary"
    });
    addBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      const icon = iconInput.value.trim() || "\u{1F4CB}";
      if (!name) {
        new import_obsidian3.Notice("\u8BF7\u8F93\u5165\u5206\u7C7B\u540D\u79F0");
        nameInput.focus();
        return;
      }
      if (this.categories.some((c) => c.name === name)) {
        new import_obsidian3.Notice(`\u5206\u7C7B "${name}" \u5DF2\u5B58\u5728`);
        return;
      }
      this.categories.push({ name, icon });
      nameInput.value = "";
      iconInput.value = "\u{1F4CB}";
      this.refreshList();
    });
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addBtn.click();
      }
    });
  }
};

// src/views/quickLinksView.ts
var QuickLinksView = class extends import_obsidian4.ItemView {
  dataStore;
  toolbar;
  linkListPanel;
  currentData = { categories: [], platforms: DEFAULT_PLATFORMS, links: [] };
  currentFilter = { platform: "all", searchText: "" };
  selectedLinkIndex = -1;
  groupMode = "category";
  constructor(leaf, dataStore, openMethod) {
    super(leaf);
    this.dataStore = dataStore;
    this.openMethod = openMethod || "external";
  }
  getViewType() {
    return VIEW_TYPE_QUICK_LINKS;
  }
  getDisplayText() {
    return PLUGIN_DISPLAY_NAME;
  }
  getIcon() {
    return PLUGIN_ICON;
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.classList.add("ql-view-container");
    this.toolbar = new Toolbar(container, {
      onFilterChange: (filter) => this.handleFilterChange(filter),
      onAddLink: () => this.openAddLinkModal(),
      onManageCategories: () => this.openCategoryManageModal(),
      onGroupModeChange: (mode) => this.handleGroupModeChange(mode)
    });
    container.style.cssText = "display:flex;flex-direction:column;flex:1;";
    var contentArea = container.createDiv("");
    contentArea.style.cssText = "flex:1;overflow:auto;";
    this.linkListPanel = new LinkListPanel(contentArea, {
      onSelectLink: (index) => this.handleSelectLink(index),
      onEditLink: (index) => this.openEditLinkModal(index),
      onDeleteLink: (index) => this.handleDeleteLink(index),
      onCopyUrl: (url) => this.handleCopyUrl(url),
      onToggleFavorite: (index) => this.handleToggleFavorite(index)
    });
    this.linkListPanel.openMethod = this.openMethod;
    this.currentData = await this.dataStore.readAllData();
    this.render();
    // Single global click handler to close popups when clicking elsewhere
    this._docClickHandler = function(e) {
      // Don't close if click is on a gear button itself (let the gear handler toggle)
      if (e.target.closest(".ql-link-row button")) return;
      var popups = document.querySelectorAll(".ql-link-popup");
      for (var i = 0; i < popups.length; i++) {
        if (!popups[i].contains(e.target)) { popups[i].remove(); }
      }
    };
    document.addEventListener("click", this._docClickHandler, true);
    this.dataStore.onChange(async () => {
      this.currentData = await this.dataStore.readAllData();
      this.render();
    });
  }
  async onClose() {
    if (this._docClickHandler) {
      document.removeEventListener("click", this._docClickHandler, true);
      this._docClickHandler = null;
    }
    this.dataStore.removeAllListeners();
    this.containerEl.children[1].empty();
  }
  render() {
    this.toolbar.setPlatforms(this.currentData.platforms || []);
    this.linkListPanel.render(this.currentData, this.currentFilter, this.selectedLinkIndex, this.groupMode);
  }
  handleFilterChange(filter) {
    this.currentFilter = filter;
    this.linkListPanel.render(this.currentData, this.currentFilter, this.selectedLinkIndex, this.groupMode);
  }
  handleGroupModeChange(mode) {
    this.groupMode = mode;
    this.linkListPanel.render(this.currentData, this.currentFilter, this.selectedLinkIndex, this.groupMode);
  }
  handleSelectLink(index) {
    this.selectedLinkIndex = index;
    this.linkListPanel.highlightSelected(index);
  }
  handleOpenUrl(url) {
    if (this.openMethod === "obsidian") {
      window.open(url);
    } else {
      window.open(url, "_blank");
    }
  }
  async handleCopyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      const btn = this.containerEl.querySelector(".ql-btn-copy");
      if (btn instanceof HTMLButtonElement) {
        const originalText = btn.textContent;
        btn.textContent = "\u5DF2\u590D\u5236!";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1500);
      }
    } catch (err) {
      console.error("[Quick Links] Failed to copy URL:", err);
    }
  }
  async handleDeleteLink(index) {
    if (index < 0 || index >= this.currentData.links.length)
      return;
    const link = this.currentData.links[index];
    const confirmed = confirm(`\u786E\u5B9A\u8981\u5220\u9664\u94FE\u63A5 "${link.title}" \u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`);
    if (!confirmed)
      return;
    await this.dataStore.deleteLink(index);
    if (this.selectedLinkIndex === index) {
      this.selectedLinkIndex = -1;
    }
  }
  async handleToggleFavorite(index) {
    await this.dataStore.toggleFavorite(index);
  }
  async openAddLinkModal() {
    const data = await this.dataStore.readAllData();
    new LinkEditModal(this.app, data.categories, data.platforms, null, async (link) => {
      await this.dataStore.addLink(link);
    }).open();
  }
  async openEditLinkModal(index) {
    const data = await this.dataStore.readAllData();
    if (index < 0 || index >= data.links.length)
      return;
    const link = data.links[index];
    new LinkEditModal(this.app, data.categories, data.platforms, link, async (updatedLink) => {
      await this.dataStore.updateLink(index, updatedLink);
    }).open();
  }
  async openCategoryManageModal() {
    const data = await this.dataStore.readAllData();
    new CategoryManageModal(this.app, data.categories, (data.platforms && data.platforms.length) ? data.platforms : DEFAULT_PLATFORMS, data.links, async (categories, platforms) => {
      data.categories = categories;
      data.platforms = platforms;
      await this.dataStore.saveData(data);
    }).open();
  }
};

// src/data/dataStore.ts
var import_obsidian5 = require("obsidian");

// src/data/yamlHelper.ts
function parseFrontmatter(content) {
  const result = {
    data: { categories: [], links: [] },
    body: content
  };
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    return result;
  }
  const yamlContent = fmMatch[1];
  result.body = content.slice(fmMatch[0].length).trim();
  result.data = parseYamlContent(yamlContent);
  return result;
}
function serializeFrontmatter(data, body) {
  const lines = [];
  lines.push("---");
  lines.push(...serializeAppData(data));
  lines.push("---");
  lines.push("");
  if (body) {
    lines.push(body);
  }
  return lines.join("\n") + "\n";
}
function parseYamlContent(yaml) {
  const data = { categories: [], links: [] };
  const lines = yaml.split(/\r?\n/);
  let section = "none";
  let currentObj = {};
  function flushObject() {
    if (Object.keys(currentObj).length === 0)
      return;
    if (section === "categories") {
      const cat = {
        name: currentObj["name"] || "",
        icon: currentObj["icon"] || "\u{1F4CB}"
      };
      if (cat.name)
        data.categories.push(cat);
    } else if (section === "links") {
      var tagsStr = currentObj["tags"] || "";
      var tagsArr = tagsStr ? tagsStr.split(",").map(function(t) { return t.trim(); }).filter(function(t) { return t; }) : [];
      const link = {
        title: currentObj["title"] || "",
        url: currentObj["url"] || "",
        description: currentObj["description"],
        category: currentObj["category"] || "",
        platform: currentObj["platform"] || "web",
        favorite: currentObj["favorite"] === "true",
        updated: currentObj["updated"] || "",
        tags: tagsArr
      };
      if (link.title)
        data.links.push(link);
    } else if (section === "platforms") {
      const plat = {
        id: currentObj["id"] || "",
        name: currentObj["name"] || "",
        color: currentObj["color"] || "#6B7280"
      };
      if (plat.id && plat.name) {
        if (!data.platforms) data.platforms = [];
        data.platforms.push(plat);
      }
    }
    currentObj = {};
  }
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^categories\s*:/.test(line)) {
      flushObject();
      section = "categories";
      continue;
    }
    if (/^links\s*:/.test(line)) {
      flushObject();
      section = "links";
      continue;
    }
    if (/^platforms\s*:/.test(line)) {
      flushObject();
      section = "platforms";
      continue;
    }
    const itemMatch = line.match(/^\s{2}-\s/);
    if (itemMatch) {
      flushObject();
      const restOfLine = line.slice(itemMatch[0].length);
      const inlinePropMatch = restOfLine.match(/^(\w+)\s*:\s*(.*)/);
      if (inlinePropMatch) {
        const key = inlinePropMatch[1];
        let value = inlinePropMatch[2].trim();
        if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        currentObj[key] = value;
      }
      continue;
    }
    if (section !== "none") {
      const propMatch = line.match(/^\s{4}(\w+)\s*:\s*(.*)$/);
      if (propMatch) {
        const key = propMatch[1];
        let value = propMatch[2].trim();
        if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        currentObj[key] = value;
      }
    }
  }
  flushObject();
  return data;
}
function serializeAppData(data) {
  const lines = [];
  lines.push("categories:");
  for (const cat of data.categories) {
    lines.push(`  - name: "${escapeYamlValue(cat.name)}"`);
    lines.push(`    icon: "${escapeYamlValue(cat.icon)}"`);
  }
  lines.push("");
  if (data.platforms && data.platforms.length > 0) {
    lines.push("platforms:");
    for (const plat of data.platforms) {
      lines.push(`  - id: ${plat.id}`);
      lines.push(`    name: "${escapeYamlValue(plat.name)}"`);
      lines.push(`    color: "${plat.color}"`);
    }
    lines.push("");
  }
  lines.push("links:");
  for (const link of data.links) {
    lines.push(`  - title: "${escapeYamlValue(link.title)}"`);
    lines.push(`    url: "${escapeYamlValue(link.url)}"`);
    if (link.description) {
      lines.push(`    description: "${escapeYamlValue(link.description)}"`);
    }
    lines.push(`    category: "${escapeYamlValue(link.category)}"`);
    lines.push(`    platform: ${link.platform}`);
    if (link.favorite) {
      lines.push("    favorite: true");
    }
    if (link.updated) {
      lines.push(`    updated: "${link.updated}"`);
    }
    if (link.tags && link.tags.length > 0) {
      lines.push(`    tags: "${escapeYamlValue(link.tags.join(", "))}"`);
    }
    lines.push("");
  }
  return lines;
}
function escapeYamlValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// src/data/dataStore.ts
var DataStore = class {
  vault;
  dataFilePath;
  cachedData = null;
  listeners = [];
  isInternalWrite = false;
  constructor(vault, dataFilePath) {
    this.vault = vault;
    this.dataFilePath = dataFilePath;
  }
  onChange(listener) {
    this.listeners.push(listener);
  }
  removeAllListeners() {
    this.listeners = [];
  }
  async handleFileModify(file) {
    if (file.path === this.dataFilePath && !this.isInternalWrite) {
      this.cachedData = null;
      await this.readAllData();
      this.notifyListeners();
    }
  }
  handleFileDelete(file) {
    if (file.path === this.dataFilePath) {
      this.cachedData = null;
      this.notifyListeners();
    }
  }
  handleFileRename(file, oldPath) {
    if (oldPath === this.dataFilePath) {
      this.cachedData = null;
      this.notifyListeners();
    }
  }
  async ensureDataFile() {
    const normalizedPath = (0, import_obsidian5.normalizePath)(this.dataFilePath);
    const existingFile = this.vault.getAbstractFileByPath(normalizedPath);
    if (!existingFile) {
      const defaultData = {
        categories: [
          { name: "\u4EA7\u54C1\u6587\u6863", icon: "\u{1F4CB}" },
          { name: "\u9879\u76EE\u7BA1\u7406", icon: "\u{1F4CA}" }
        ],
        platforms: DEFAULT_PLATFORMS,
        links: []
      };
      const body = "# \u5DE5\u4F5C\u94FE\u63A5\u5BFC\u822A\n\n> \u6B64\u6587\u4EF6\u7531 Quick Links \u63D2\u4EF6\u7BA1\u7406\uFF0C\u8BF7\u52FF\u624B\u52A8\u4FEE\u6539 YAML \u5934\u90E8\n";
      const content = serializeFrontmatter(defaultData, body);
      await this.vault.create(normalizedPath, content);
      this.cachedData = defaultData;
    }
  }
  async readAllData() {
    if (this.cachedData) {
      return { ...this.cachedData, links: [...this.cachedData.links], categories: [...this.cachedData.categories], platforms: this.cachedData.platforms ? [...this.cachedData.platforms] : [...DEFAULT_PLATFORMS] };
    }
    const normalizedPath = (0, import_obsidian5.normalizePath)(this.dataFilePath);
    const file = this.vault.getAbstractFileByPath(normalizedPath);
    if (!file || !(file instanceof import_obsidian5.TFile)) {
      await this.ensureDataFile();
      return this.cachedData;
    }
    const content = await this.vault.read(file);
    const result = parseFrontmatter(content);
    if (result.error) {
      console.error("[Quick Links] Failed to parse data file:", result.error);
      return { categories: [], platforms: [...DEFAULT_PLATFORMS], links: [] };
    }
    this.cachedData = result.data;
    return { ...result.data, links: [...result.data.links], categories: [...result.data.categories], platforms: result.data.platforms ? [...result.data.platforms] : [...DEFAULT_PLATFORMS] };
  }
  async saveData(data) {
    const normalizedPath = (0, import_obsidian5.normalizePath)(this.dataFilePath);
    const file = this.vault.getAbstractFileByPath(normalizedPath);
    if (!file || !(file instanceof import_obsidian5.TFile)) {
      await this.ensureDataFile();
    }
    const normalizedPath2 = (0, import_obsidian5.normalizePath)(this.dataFilePath);
    const targetFile = this.vault.getAbstractFileByPath(normalizedPath2);
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
  notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("[Quick Links] Listener error:", err);
      }
    }
  }
  getFile() {
    const normalizedPath = (0, import_obsidian5.normalizePath)(this.dataFilePath);
    const file = this.vault.getAbstractFileByPath(normalizedPath);
    return file instanceof import_obsidian5.TFile ? file : null;
  }
  async addPlatform(platform) {
    const data = await this.readAllData();
    if (!data.platforms) data.platforms = [...DEFAULT_PLATFORMS];
    if (data.platforms.some(p => p.id === platform.id)) {
      throw new Error(`\u5E73\u53F0 ID "${platform.id}" \u5DF2\u5B58\u5728`);
    }
    data.platforms.push(platform);
    await this.saveData(data);
  }
  async updatePlatform(oldId, platform) {
    const data = await this.readAllData();
    if (!data.platforms) data.platforms = [...DEFAULT_PLATFORMS];
    const idx = data.platforms.findIndex(p => p.id === oldId);
    if (idx === -1) {
      throw new Error(`\u5E73\u53F0 "${oldId}" \u4E0D\u5B58\u5728`);
    }
    data.platforms[idx] = platform;
    await this.saveData(data);
  }
  async deletePlatform(id) {
    const data = await this.readAllData();
    if (!data.platforms) data.platforms = [...DEFAULT_PLATFORMS];
    const idx = data.platforms.findIndex(p => p.id === id);
    if (idx === -1) {
      throw new Error(`\u5E73\u53F0 "${id}" \u4E0D\u5B58\u5728`);
    }
    data.platforms.splice(idx, 1);
    await this.saveData(data);
  }
  async addLink(link) {
    const data = await this.readAllData();
    if (!link.updated) {
      link.updated = formatDate(/* @__PURE__ */ new Date());
    }
    if (!link.platform) {
      link.platform = "web";
    }
    if (link.favorite === void 0) {
      link.favorite = false;
    }
    data.links.push(link);
    await this.saveData(data);
  }
  async updateLink(index, link) {
    const data = await this.readAllData();
    if (index < 0 || index >= data.links.length) {
      throw new Error(`Link index out of bounds: ${index}`);
    }
    link.updated = formatDate(/* @__PURE__ */ new Date());
    data.links[index] = link;
    await this.saveData(data);
  }
  async deleteLink(index) {
    const data = await this.readAllData();
    if (index < 0 || index >= data.links.length) {
      throw new Error(`Link index out of bounds: ${index}`);
    }
    data.links.splice(index, 1);
    await this.saveData(data);
  }
  async toggleFavorite(index) {
    const data = await this.readAllData();
    if (index < 0 || index >= data.links.length) {
      throw new Error(`Link index out of bounds: ${index}`);
    }
    data.links[index].favorite = !data.links[index].favorite;
    await this.saveData(data);
  }
  async addCategory(category) {
    const data = await this.readAllData();
    if (data.categories.some((c) => c.name === category.name)) {
      throw new Error(`\u5206\u7C7B "${category.name}" \u5DF2\u5B58\u5728`);
    }
    data.categories.push(category);
    await this.saveData(data);
  }
  async updateCategory(oldName, newCategory) {
    const data = await this.readAllData();
    const idx = data.categories.findIndex((c) => c.name === oldName);
    if (idx === -1) {
      throw new Error(`\u5206\u7C7B "${oldName}" \u4E0D\u5B58\u5728`);
    }
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
  async deleteCategory(name, migrateTo) {
    const data = await this.readAllData();
    const idx = data.categories.findIndex((c) => c.name === name);
    if (idx === -1) {
      throw new Error(`\u5206\u7C7B "${name}" \u4E0D\u5B58\u5728`);
    }
    const affectedLinks = data.links.filter((l) => l.category === name);
    if (migrateTo) {
      for (const link of affectedLinks) {
        link.category = migrateTo;
      }
    }
    data.categories.splice(idx, 1);
    await this.saveData(data);
  }
  async getCategoryLinkCount(categoryName) {
    const data = await this.readAllData();
    return data.links.filter((l) => l.category === categoryName).length;
  }
};
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// src/main.ts
var QuickLinksPlugin = class extends import_obsidian6.Plugin {
  dataStore;
  settings = { dataFilePath: DEFAULT_DATA_FILE_PATH, openMethod: "external" };
  async onload() {
    try {
    console.log("[Quick Links] Loading plugin...");
    var loadedData;
    try { loadedData = await this.loadData(); } catch (ld) { console.warn("[Quick Links] Failed to load settings:", ld); loadedData = null; }
    if (loadedData && loadedData.dataFilePath) {
      this.settings.dataFilePath = loadedData.dataFilePath;
    }
    if (loadedData && loadedData.openMethod) {
      this.settings.openMethod = loadedData.openMethod;
    }
    this.dataStore = new DataStore(this.app.vault, this.settings.dataFilePath);
    try {
      await this.dataStore.ensureDataFile();
    } catch (e2) {
      console.error("[Quick Links] Failed to ensure data file, using defaults:", e2);
    }
    this.registerView(
      VIEW_TYPE_QUICK_LINKS,
      (leaf) => new QuickLinksView(leaf, this.dataStore, this.settings.openMethod)
    );
    this.addRibbonIcon(PLUGIN_ICON, `\u6253\u5F00 ${PLUGIN_DISPLAY_NAME}`, () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-quick-links",
      name: `\u6253\u5F00 ${PLUGIN_DISPLAY_NAME}`,
      callback: () => {
        this.activateView();
      }
    });
    this.addSettingTab(new QuickLinksSettingTab(this.app, this));
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (file instanceof import_obsidian6.TFile && file.path === this.settings.dataFilePath) {
          await this.dataStore.handleFileModify(file);
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof import_obsidian6.TFile) {
          this.dataStore.handleFileDelete(file);
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof import_obsidian6.TFile) {
          this.dataStore.handleFileRename(file, oldPath);
        }
      })
    );
    console.log("[Quick Links] Plugin loaded successfully.");
    } catch (e) {
      console.error("[Quick Links] Failed to load plugin:", e);
    }
  }
  onunload() {
    console.log("[Quick Links] Plugin unloaded.");
    this.dataStore.removeAllListeners();
  }
  async activateView() {
    const { workspace } = this.app;
    const existingLeaf = workspace.getLeavesOfType(VIEW_TYPE_QUICK_LINKS);
    if (existingLeaf.length > 0) {
      workspace.revealLeaf(existingLeaf[0]);
      return;
    }
    const leaf = workspace.getLeaf(false);
    if (leaf) {
      await leaf.setViewState({
        type: VIEW_TYPE_QUICK_LINKS,
        active: true
      });
      workspace.revealLeaf(leaf);
    }
  }
};
