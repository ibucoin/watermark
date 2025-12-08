// 导出格式
export type ExportFormat = 'png' | 'jpg';

// 文本框样式配置
export interface TextBoxStyle {
  // 文字颜色
  color: string;
  // 透明度 0-100
  opacity: number;
  // 字体大小 px
  fontSize: number;
}

// 文本框实例
export interface TextBox {
  id: string;
  // 文本内容
  text: string;
  // 相对于图片的百分比位置 (0-100)
  x: number;
  y: number;
  // 宽度（相对于图片的百分比）
  width: number;
  // 旋转角度 -180 to 180
  angle: number;
  // 样式配置
  style: TextBoxStyle;
}

// 平铺水印配置
export interface TileWatermarkConfig {
  // 是否启用平铺水印
  enabled: boolean;
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
  // 间距 px
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
  // 文本框列表
  textBoxes: TextBox[];
  // 当前选中的文本框 ID
  selectedTextBoxId: string | null;
  // 平铺水印配置
  tileConfig: TileWatermarkConfig;
  // 图片列表
  images: ImageData[];
  // 当前图片索引
  currentImageIndex: number;
  // 导出格式
  exportFormat: ExportFormat;
  // JPG 质量 0-100
  jpgQuality: number;
}

// 默认文本框样式
export const defaultTextBoxStyle: TextBoxStyle = {
  color: '#333333',
  opacity: 50,
  fontSize: 48,
};

// 默认平铺水印配置
export const defaultTileConfig: TileWatermarkConfig = {
  enabled: false,
  text: '水印文字',
  color: '#333333',
  opacity: 25,
  fontSize: 48,
  angle: -30,
  spacing: 150,
};

// 生成唯一 ID
export function generateTextBoxId(): string {
  return `tb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 创建新文本框
export function createTextBox(overrides?: Partial<TextBox>): TextBox {
  return {
    id: generateTextBoxId(),
    text: '输入水印',
    x: 50,
    y: 50,
    width: 20, // 默认宽度为图片宽度的 20%
    angle: 0,
    style: { ...defaultTextBoxStyle },
    ...overrides,
  };
}

// 默认状态
export const defaultWatermarkState: WatermarkState = {
  textBoxes: [],
  selectedTextBoxId: null,
  tileConfig: { ...defaultTileConfig },
  images: [],
  currentImageIndex: 0,
  exportFormat: 'png',
  jpgQuality: 90,
};

// ============ 兼容旧代码的类型（将在后续清理） ============

// 水印模式（已废弃，保留用于渐进式迁移）
export type WatermarkMode = 'tile' | 'single' | 'batch';

// 单个水印实例（已废弃，由 TextBox 替代）
export interface SingleWatermark {
  id: string;
  x: number;
  y: number;
}

// 批量模式锚点位置（已废弃）
export type AnchorPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// 旧版水印配置（已废弃，由 TextBoxStyle + TileWatermarkConfig 替代）
export interface WatermarkConfig {
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  angle: number;
  spacing: number;
}

// 旧版推荐水印配置
export const defaultWatermarkConfig: WatermarkConfig = {
  text: '水印文字',
  color: '#333333',
  opacity: 25,
  fontSize: 48,
  angle: -30,
  spacing: 150,
};
