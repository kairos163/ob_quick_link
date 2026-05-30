import { Platform } from '../types';
import { PLATFORM_LABELS, PLATFORM_CSS_CLASS } from '../utils/constants';

/**
 * 平台徽章组件 - 生成小尺寸平台标签
 */
export class PlatformBadge {
  private el: HTMLElement;

  constructor(platform: Platform) {
    this.el = document.createElement('span');
    this.el.className = `ql-platform-badge ${PLATFORM_CSS_CLASS[platform] || ''}`;
    this.el.textContent = PLATFORM_LABELS[platform] || platform;
  }

  getElement(): HTMLElement {
    return this.el;
  }

  getPlatform(): Platform {
    // 从 CSS 类名推断平台
    const cls = this.el.className;
    if (cls.includes('ql-plat-tencent')) return 'tencent-docs';
    if (cls.includes('ql-plat-feishu')) return 'feishu-docs';
    return 'web';
  }

  /**
   * 创建 SVG 图标元素（可选：更精细的 icon）
   */
  static createSvgIcon(platform: Platform): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.classList.add('ql-platform-icon');

    switch (platform) {
      case 'tencent-docs':
        // 简化文档图标
        const pathTencent = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathTencent.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
        pathTencent.setAttribute('fill', 'none');
        pathTencent.setAttribute('stroke', 'currentColor');
        pathTencent.setAttribute('stroke-width', '2');
        svg.appendChild(pathTencent);
        break;

      case 'feishu-docs':
        const pathFeishu = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathFeishu.setAttribute('d', 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5');
        pathFeishu.setAttribute('fill', 'none');
        pathFeishu.setAttribute('stroke', 'currentColor');
        pathFeishu.setAttribute('stroke-width', '2');
        svg.appendChild(pathFeishu);
        break;

      case 'web':
        const pathWeb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pathWeb.setAttribute('cx', '12');
        pathWeb.setAttribute('cy', '12');
        pathWeb.setAttribute('r', '10');
        pathWeb.setAttribute('fill', 'none');
        pathWeb.setAttribute('stroke', 'currentColor');
        pathWeb.setAttribute('stroke-width', '2');
        svg.appendChild(pathWeb);
        break;
    }

    return svg;
  }
}
