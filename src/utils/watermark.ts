import type { TextBox, TileWatermarkConfig, WatermarkConfig, WatermarkMode, AnchorPosition, SingleWatermark } from '@/types/watermark';

// ============ 新版渲染函数 ============

// 渲染平铺水印
export function renderTileWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: TileWatermarkConfig
) {
  if (!config.enabled || !config.text.trim()) return;

  const { text, fontSize, angle, spacing, color, opacity } = config;

  // 设置字体和样式
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = hexToRgba(color, opacity / 100);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 计算文字尺寸
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  // 计算旋转后需要覆盖的区域
  const diagonal = Math.sqrt(width * width + height * height);
  const startX = -diagonal / 2;
  const startY = -diagonal / 2;
  const endX = width + diagonal / 2;
  const endY = height + diagonal / 2;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // 绘制平铺水印
  for (let y = startY; y < endY; y += textHeight + spacing) {
    for (let x = startX; x < endX; x += textWidth + spacing) {
      ctx.fillText(text, x + textWidth / 2, y + textHeight / 2);
    }
  }

  ctx.restore();
}

// 渲染文本框
export function renderTextBox(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  textBox: TextBox,
  isSelected: boolean,
  showControls: boolean = true // 是否显示控制手柄（导出时设为 false）
) {
  const { text, x, y, width: boxWidth, angle, style } = textBox;
  const { color, opacity, fontSize } = style;

  if (!text.trim() && !showControls) return;

  // 计算实际位置和尺寸
  const actualX = (x / 100) * width;
  const actualY = (y / 100) * height;
  const actualWidth = (boxWidth / 100) * width;

  // 设置字体
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 计算文字尺寸
  const metrics = ctx.measureText(text || '输入水印');
  const textWidth = metrics.width;
  const textHeight = fontSize;
  const padding = 12;

  // 实际盒子尺寸
  const boxWidthPx = Math.max(actualWidth, textWidth + padding * 2);
  const boxHeightPx = textHeight + padding * 2;

  ctx.save();
  ctx.translate(actualX, actualY);
  ctx.rotate((angle * Math.PI) / 180);

  // 绘制边框（仅在预览且选中时显示）
  if (showControls) {
    ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.setLineDash(isSelected ? [] : [4, 4]);
    ctx.strokeRect(-boxWidthPx / 2, -boxHeightPx / 2, boxWidthPx, boxHeightPx);
    ctx.setLineDash([]);

    // 绘制控制手柄（仅选中时）
    if (isSelected) {
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      
      // 四角调整大小手柄
      const corners = [
        [-boxWidthPx / 2, -boxHeightPx / 2],
        [boxWidthPx / 2, -boxHeightPx / 2],
        [-boxWidthPx / 2, boxHeightPx / 2],
        [boxWidthPx / 2, boxHeightPx / 2],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
      });

      // 旋转手柄（顶部中心上方）
      const rotateHandleY = -boxHeightPx / 2 - 30;
      ctx.beginPath();
      ctx.arc(0, rotateHandleY, handleSize / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 连接线
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -boxHeightPx / 2);
      ctx.lineTo(0, rotateHandleY + handleSize / 2);
      ctx.stroke();
    }
  }

  // 绘制文字
  ctx.fillStyle = hexToRgba(color, opacity / 100);
  if (text.trim()) {
    ctx.fillText(text, 0, 0);
  } else if (showControls) {
    // 显示占位符
    ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.fillText('输入水印', 0, 0);
  }

  ctx.restore();
}

// 渲染所有文本框
export function renderTextBoxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  textBoxes: TextBox[],
  selectedId: string | null,
  showControls: boolean = true
) {
  textBoxes.forEach((textBox) => {
    const isSelected = textBox.id === selectedId;
    renderTextBox(ctx, width, height, textBox, isSelected, showControls);
  });
}

// 检测点击位置对应的文本框
export function getTextBoxAtPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  textBoxes: TextBox[]
): TextBox | null {
  // 从后往前检查（后添加的在上层）
  for (let i = textBoxes.length - 1; i >= 0; i--) {
    const tb = textBoxes[i];
    const actualX = (tb.x / 100) * width;
    const actualY = (tb.y / 100) * height;
    const actualWidth = (tb.width / 100) * width;
    const fontSize = tb.style.fontSize;
    const padding = 12;
    
    const boxWidth = Math.max(actualWidth, fontSize * tb.text.length * 0.6 + padding * 2);
    const boxHeight = fontSize + padding * 2;
    const hitPadding = 10;

    // 简化的碰撞检测（不考虑旋转）
    // TODO: 实现考虑旋转的精确碰撞检测
    if (
      x >= actualX - boxWidth / 2 - hitPadding &&
      x <= actualX + boxWidth / 2 + hitPadding &&
      y >= actualY - boxHeight / 2 - hitPadding &&
      y <= actualY + boxHeight / 2 + hitPadding
    ) {
      return tb;
    }
  }
  return null;
}

// 检测点击位置对应的控制手柄
export type HandleType = 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'rotate' | null;

export function getHandleAtPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  textBox: TextBox
): HandleType {
  const actualX = (textBox.x / 100) * width;
  const actualY = (textBox.y / 100) * height;
  const actualWidth = (textBox.width / 100) * width;
  const fontSize = textBox.style.fontSize;
  const padding = 12;
  
  const boxWidth = Math.max(actualWidth, fontSize * textBox.text.length * 0.6 + padding * 2);
  const boxHeight = fontSize + padding * 2;
  const handleSize = 12;

  // 旋转手柄
  const rotateHandleY = actualY - boxHeight / 2 - 30;
  if (
    x >= actualX - handleSize &&
    x <= actualX + handleSize &&
    y >= rotateHandleY - handleSize &&
    y <= rotateHandleY + handleSize
  ) {
    return 'rotate';
  }

  // 四角调整大小手柄
  const corners: [number, number, HandleType][] = [
    [actualX - boxWidth / 2, actualY - boxHeight / 2, 'resize-tl'],
    [actualX + boxWidth / 2, actualY - boxHeight / 2, 'resize-tr'],
    [actualX - boxWidth / 2, actualY + boxHeight / 2, 'resize-bl'],
    [actualX + boxWidth / 2, actualY + boxHeight / 2, 'resize-br'],
  ];

  for (const [cx, cy, type] of corners) {
    if (
      x >= cx - handleSize &&
      x <= cx + handleSize &&
      y >= cy - handleSize &&
      y <= cy + handleSize
    ) {
      return type;
    }
  }

  // 盒子内部 - 移动
  if (
    x >= actualX - boxWidth / 2 &&
    x <= actualX + boxWidth / 2 &&
    y >= actualY - boxHeight / 2 &&
    y <= actualY + boxHeight / 2
  ) {
    return 'move';
  }

  return null;
}

// ============ 旧版渲染函数（兼容） ============

// 渲染水印到 Canvas（旧版，保留兼容）
export function renderWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  mode: WatermarkMode,
  position?: { x: number; y: number },
  anchor?: AnchorPosition
) {
  if (!config.text.trim()) return;

  ctx.font = `${config.fontSize}px sans-serif`;
  ctx.fillStyle = hexToRgba(config.color, config.opacity / 100);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (mode) {
    case 'tile':
      renderTileWatermarkLegacy(ctx, width, height, config);
      break;
    case 'single':
      renderSingleWatermarkLegacy(ctx, width, height, config, position);
      break;
    case 'batch':
      renderBatchWatermarkLegacy(ctx, width, height, config, anchor);
      break;
  }
}

function renderTileWatermarkLegacy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig
) {
  const { text, fontSize, angle, spacing } = config;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;
  const diagonal = Math.sqrt(width * width + height * height);
  const startX = -diagonal / 2;
  const startY = -diagonal / 2;
  const endX = width + diagonal / 2;
  const endY = height + diagonal / 2;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  for (let y = startY; y < endY; y += textHeight + spacing) {
    for (let x = startX; x < endX; x += textWidth + spacing) {
      ctx.fillText(text, x + textWidth / 2, y + textHeight / 2);
    }
  }

  ctx.restore();
}

function renderSingleWatermarkLegacy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  position?: { x: number; y: number }
) {
  const { text, angle } = config;
  const pos = position || { x: 50, y: 50 };
  const x = (pos.x / 100) * width;
  const y = (pos.y / 100) * height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function renderBatchWatermarkLegacy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  anchor?: AnchorPosition
) {
  const { text, fontSize, angle } = config;
  const position = anchor || 'bottom-right';
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const padding = fontSize;

  let x: number;
  let y: number;

  switch (position) {
    case 'top-left':
      x = padding + textWidth / 2;
      y = padding;
      break;
    case 'top-center':
      x = width / 2;
      y = padding;
      break;
    case 'top-right':
      x = width - padding - textWidth / 2;
      y = padding;
      break;
    case 'center-left':
      x = padding + textWidth / 2;
      y = height / 2;
      break;
    case 'center':
      x = width / 2;
      y = height / 2;
      break;
    case 'center-right':
      x = width - padding - textWidth / 2;
      y = height / 2;
      break;
    case 'bottom-left':
      x = padding + textWidth / 2;
      y = height - padding;
      break;
    case 'bottom-center':
      x = width / 2;
      y = height - padding;
      break;
    case 'bottom-right':
    default:
      x = width - padding - textWidth / 2;
      y = height - padding;
      break;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// 渲染多个水印（旧版，保留兼容）
export function renderMultipleWatermarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  watermarks: SingleWatermark[],
  selectedId: string | null,
  showBorder: boolean = true
) {
  if (!config.text.trim() || watermarks.length === 0) return;

  const { text, fontSize, angle, color, opacity } = config;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;
  const padding = 8;

  watermarks.forEach((wm) => {
    const x = (wm.x / 100) * width;
    const y = (wm.y / 100) * height;
    const isSelected = wm.id === selectedId;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);

    if (showBorder) {
      const boxWidth = textWidth + padding * 2;
      const boxHeight = textHeight + padding * 2;
      ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.setLineDash(isSelected ? [] : [4, 4]);
      ctx.strokeRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);
      ctx.setLineDash([]);
    }

    ctx.fillStyle = hexToRgba(color, opacity / 100);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  });
}

// ============ 工具函数 ============

// 颜色转换：hex -> rgba
export function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 颜色转换：hex -> rgba（导出供外部使用）
export function hexToRgbaPublic(hex: string, alpha: number): string {
  return hexToRgba(hex, alpha);
}

// 导出图片
export async function exportImage(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg',
  quality: number,
  filename: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const qualityValue = format === 'jpg' ? quality / 100 : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to export image'));
        }
      },
      mimeType,
      qualityValue
    );
  });
}

// 下载文件
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
