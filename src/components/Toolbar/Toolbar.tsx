import type { WatermarkConfig, WatermarkMode, ExportFormat, ImageData } from '@/types/watermark';
import { defaultWatermarkConfig } from '@/types/watermark';
import { ModeSelector } from './ModeSelector';
import { SliderControl } from './SliderControl';
import { ColorPicker } from './ColorPicker';
import { ExportButton } from '../Export/ExportButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ToolbarProps {
  config: WatermarkConfig;
  mode: WatermarkMode;
  exportFormat: ExportFormat;
  jpgQuality: number;
  hasImages: boolean;
  images: ImageData[];
  currentImage: ImageData | undefined;
  onConfigChange: (updates: Partial<WatermarkConfig>) => void;
  onModeChange: (mode: WatermarkMode) => void;
  onExportFormatChange: (format: ExportFormat) => void;
  onJpgQualityChange: (quality: number) => void;
}

export function Toolbar({
  config,
  mode,
  exportFormat,
  jpgQuality,
  hasImages,
  images,
  currentImage,
  onConfigChange,
  onModeChange,
  onExportFormatChange,
  onJpgQualityChange,
}: ToolbarProps) {
  // 重置配置
  const handleReset = () => {
    onConfigChange(defaultWatermarkConfig);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Logo 和标题 */}
      <div className="pb-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">水印设置</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="重置为推荐配置"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          重置
        </Button>
      </div>

      {/* 模式选择 */}
      <div className="space-y-2">
        <Label>水印模式</Label>
        <ModeSelector value={mode} onChange={onModeChange} />
      </div>

      {/* 水印文字 */}
      <div className="space-y-2">
        <Label htmlFor="watermark-text">水印文字</Label>
        <Input
          id="watermark-text"
          value={config.text}
          onChange={(e) => onConfigChange({ text: e.target.value })}
          placeholder="请输入水印文字"
        />
      </div>

      {/* 颜色选择 */}
      <div className="space-y-2">
        <Label>水印颜色</Label>
        <ColorPicker
          value={config.color}
          onChange={(color) => onConfigChange({ color })}
        />
      </div>

      {/* 透明度 */}
      <SliderControl
        label="透明度"
        value={config.opacity}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={(opacity) => onConfigChange({ opacity })}
      />

      {/* 字体大小 */}
      <SliderControl
        label="字体大小"
        value={config.fontSize}
        min={12}
        max={200}
        step={1}
        unit="px"
        onChange={(fontSize) => onConfigChange({ fontSize })}
      />

      {/* 旋转角度 */}
      <SliderControl
        label="旋转角度"
        value={config.angle}
        min={-180}
        max={180}
        step={1}
        unit="°"
        onChange={(angle) => onConfigChange({ angle })}
      />

      {/* 间距（仅平铺模式） */}
      {mode === 'tile' && (
        <SliderControl
          label="水印间距"
          value={config.spacing}
          min={50}
          max={500}
          step={10}
          unit="px"
          onChange={(spacing) => onConfigChange({ spacing })}
        />
      )}

      {/* 批量模式提示 */}
      {mode === 'batch' && (
        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          💡 在图片上拖拽水印来调整位置，所有图片将使用相同的相对位置。
        </div>
      )}

      {/* 导出设置 */}
      <div className="pt-4 border-t space-y-4">
        <ExportButton
          exportFormat={exportFormat}
          jpgQuality={jpgQuality}
          hasImages={hasImages}
          images={images}
          currentImage={currentImage}
          mode={mode}
          onExportFormatChange={onExportFormatChange}
          onJpgQualityChange={onJpgQualityChange}
        />
      </div>
    </div>
  );
}

