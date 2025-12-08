// 水印模式
export type WatermarkMode = 'tile' | 'single' | 'batch';

// 单个水印实例（单个模式下可添加多个）
export interface SingleWatermark {
  id: string;
  // 相对于图片的百分比位置
  x: number;
  y: number;
}

// 批量模式锚点位置
export type AnchorPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// 导出格式
export type ExportFormat = 'png' | 'jpg';

// 水印配置
export interface WatermarkConfig {
  // 水印文字
  text: string;
  // 颜色
  color: string;
  // 透明度 0-100
  opacity: number;
  // 字体大小 px
  fontSize: number;
  // 旋转角度 -180 to 180
  angle: number;
  // 间距 px（仅平铺模式）
  spacing: number;
}

// 图片数据
export interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

// 水印编辑器状态
export interface WatermarkState {
  // 水印配置
  config: WatermarkConfig;
  // 模式
  mode: WatermarkMode;
  // 单个模式水印列表
  watermarks: SingleWatermark[];
  // 当前选中的水印 ID
  selectedWatermarkId: string | null;
  // 批量模式位置（相对于图片的百分比位置）
  batchPosition: { x: number; y: number };
  // 批量模式锚点（已弃用，改用 batchPosition）
  anchor: AnchorPosition;
  // 图片列表
  images: ImageData[];
  // 当前图片索引
  currentImageIndex: number;
  // 导出格式
  exportFormat: ExportFormat;
  // JPG 质量 0-100
  jpgQuality: number;
}

// 推荐水印配置（深灰色，25% 透明度）
export const defaultWatermarkConfig: WatermarkConfig = {
  text: '水印文字',
  color: '#333333',
  opacity: 25,
  fontSize: 48,
  angle: -30,
  spacing: 150,
};

// 生成唯一 ID
export function generateWatermarkId(): string {
  return `wm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 默认状态
export const defaultWatermarkState: WatermarkState = {
  config: defaultWatermarkConfig,
  mode: 'tile',
  watermarks: [],
  selectedWatermarkId: null,
  batchPosition: { x: 85, y: 90 }, // 默认右下角
  anchor: 'bottom-right',
  images: [],
  currentImageIndex: 0,
  exportFormat: 'png',
  jpgQuality: 90,
};

