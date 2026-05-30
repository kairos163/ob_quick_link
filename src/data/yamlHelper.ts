import { AppData, Category, Link, Platform } from '../types';

/**
 * 从 Markdown 文件内容中解析 YAML frontmatter
 * 返回解析后的数据和正文内容
 */
export interface ParseResult {
  data: AppData;
  body: string;
  error?: string;
}

/**
 * 解析 frontmatter 中的 YAML 数据
 */
export function parseFrontmatter(content: string): ParseResult {
  const result: ParseResult = {
    data: { categories: [], links: [] },
    body: content,
  };

  // 匹配 YAML frontmatter 块: 以 --- 开头和结尾
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    // 无 frontmatter，返回空数据
    return result;
  }

  const yamlContent = fmMatch[1];
  // 提取正文（frontmatter 之后的内容）
  result.body = content.slice(fmMatch[0].length).trim();

  // 解析 categories 和 links
  result.data = parseYamlContent(yamlContent);

  return result;
}

/**
 * 将数据序列化为 YAML frontmatter + 正文的完整 Markdown 文本
 */
export function serializeFrontmatter(data: AppData, body: string): string {
  const lines: string[] = [];
  lines.push('---');
  lines.push(...serializeAppData(data));
  lines.push('---');
  lines.push('');
  if (body) {
    lines.push(body);
  }
  return lines.join('\n') + '\n';
}

// ==========================================
// 内部解析函数
// ==========================================

type ParseSection = 'none' | 'categories' | 'links';

function parseYamlContent(yaml: string): AppData {
  const data: AppData = { categories: [], links: [] };

  const lines = yaml.split(/\r?\n/);
  let section: ParseSection = 'none';
  let currentObj: Record<string, string> = {};

  function flushObject() {
    if (Object.keys(currentObj).length === 0) return;
    if (section === 'categories') {
      const cat: Category = {
        name: currentObj['name'] || '',
        icon: currentObj['icon'] || '📋',
      };
      if (cat.name) data.categories.push(cat);
    } else if (section === 'links') {
      const link: Link = {
        title: currentObj['title'] || '',
        url: currentObj['url'] || '',
        description: currentObj['description'],
        category: currentObj['category'] || '',
        platform: (currentObj['platform'] || 'web') as Platform,
        favorite: currentObj['favorite'] === 'true',
        updated: currentObj['updated'] || '',
      };
      if (link.title) data.links.push(link);
    }
    currentObj = {};
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // 检测顶层 key
    if (/^categories\s*:/.test(line)) {
      flushObject();
      section = 'categories';
      continue;
    }
    if (/^links\s*:/.test(line)) {
      flushObject();
      section = 'links';
      continue;
    }

    // 检测数组元素分隔符 "- "
    const itemMatch = line.match(/^\s{2}-\s/);
    if (itemMatch) {
      flushObject();
      continue;
    }

    // 检测数组元素内的属性 "    key: value"
    if (section !== 'none') {
      const propMatch = line.match(/^\s{4}(\w+)\s*:\s*(.*)$/);
      if (propMatch) {
        const key = propMatch[1];
        let value = propMatch[2].trim();

        // 去除字符串引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        currentObj[key] = value;
      }
    }
  }

  // 刷新最后一个对象
  flushObject();

  return data;
}

// ==========================================
// 内部序列化函数
// ==========================================

function serializeAppData(data: AppData): string[] {
  const lines: string[] = [];

  // categories
  lines.push('categories:');
  for (const cat of data.categories) {
    lines.push(`  - name: "${escapeYamlValue(cat.name)}"`);
    lines.push(`    icon: "${escapeYamlValue(cat.icon)}"`);
  }

  // links
  lines.push('');
  lines.push('links:');
  for (const link of data.links) {
    lines.push(`  - title: "${escapeYamlValue(link.title)}"`);
    lines.push(`    url: "${escapeYamlValue(link.url)}"`);
    if (link.description) {
      lines.push(`    description: "${escapeYamlValue(link.description)}"`);
    }
    lines.push(`    category: "${escapeYamlValue(link.category)}"`);
    lines.push(`    platform: ${link.platform}`);
    if (link.favorite) {
      lines.push('    favorite: true');
    }
    if (link.updated) {
      lines.push(`    updated: "${link.updated}"`);
    }
    lines.push('');
  }

  return lines;
}

function escapeYamlValue(value: string): string {
  // 转义 YAML 字符串中的特殊字符
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
