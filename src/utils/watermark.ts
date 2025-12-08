import type { WatermarkConfig, WatermarkMode, AnchorPosition, SingleWatermark } from '@/types/watermark';

// 渲染水印到 Canvas
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

  // 设置字体和样式
  ctx.font = `${config.fontSize}px sans-serif`;
  ctx.fillStyle = hexToRgba(config.color, config.opacity / 100);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (mode) {
    case 'tile':
      renderTileWatermark(ctx, width, height, config);
      break;
    case 'single':
      renderSingleWatermark(ctx, width, height, config, position);
      break;
    case 'batch':
      renderBatchWatermark(ctx, width, height, config, anchor);
      break;
  }
}

// 平铺水印
function renderTileWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig
) {
  const { text, fontSize, angle, spacing } = config;
  
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

// 单个水印（可拖拽）
function renderSingleWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  position?: { x: number; y: number }
) {
  const { text, angle } = config;
  const pos = position || { x: 50, y: 50 };
  
  // 将百分比位置转换为实际坐标
  const x = (pos.x / 100) * width;
  const y = (pos.y / 100) * height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// 渲染多个水印（单个模式），带可视边框
export function renderMultipleWatermarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  watermarks: SingleWatermark[],
  selectedId: string | null
) {
  if (!config.text.trim() || watermarks.length === 0) return;

  const { text, fontSize, angle, color, opacity } = config;
  
  // 设置字体
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 计算文字尺寸
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

    // 绘制边框背景（选中时高亮）
    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;
    
    ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.setLineDash(isSelected ? [] : [4, 4]);
    ctx.strokeRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);
    ctx.setLineDash([]);

    // 绘制水印文字
    ctx.fillStyle = hexToRgba(color, opacity / 100);
    ctx.fillText(text, 0, 0);

    ctx.restore();
  });
}

// 颜色转换：hex -> rgba（导出供外部使用）
export function hexToRgbaPublic(hex: string, alpha: number): string {
  return hexToRgba(hex, alpha);
}

// 批量水印（固定位置）
function renderBatchWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: WatermarkConfig,
  anchor?: AnchorPosition
) {
  const { text, fontSize, angle } = config;
  const position = anchor || 'bottom-right';
  
  // 计算文字尺寸用于边距
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const padding = fontSize;

  // 根据锚点计算位置
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

// 颜色转换：hex -> rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

