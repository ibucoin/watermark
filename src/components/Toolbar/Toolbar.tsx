import type { WatermarkConfig, WatermarkMode, AnchorPosition, ExportFormat } from '@/types/watermark';
import { ModeSelector } from './ModeSelector';
import { SliderControl } from './SliderControl';
import { ColorPicker } from './ColorPicker';
import { PositionSelector } from './PositionSelector';
import { ExportButton } from '../Export/ExportButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ToolbarProps {
  config: WatermarkConfig;
  mode: WatermarkMode;
  anchor: AnchorPosition;
  exportFormat: ExportFormat;
  jpgQuality: number;
  hasImages: boolean;
  onConfigChange: (updates: Partial<WatermarkConfig>) => void;
  onModeChange: (mode: WatermarkMode) => void;
  onAnchorChange: (anchor: AnchorPosition) => void;
  onExportFormatChange: (format: ExportFormat) => void;
  onJpgQualityChange: (quality: number) => void;
}

export function Toolbar({
  config,
  mode,
  anchor,
  exportFormat,
  jpgQuality,
  hasImages,
  onConfigChange,
  onModeChange,
  onAnchorChange,
  onExportFormatChange,
  onJpgQualityChange,
}: ToolbarProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Logo 和标题 */}
      <div className="pb-4 border-b">
        <h2 className="text-xl font-bold">水印设置</h2>
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

      {/* 位置选择器（仅批量模式） */}
      {mode === 'batch' && (
        <div className="space-y-2">
          <Label>水印位置</Label>
          <PositionSelector value={anchor} onChange={onAnchorChange} />
        </div>
      )}

      {/* 导出设置 */}
      <div className="pt-4 border-t space-y-4">
        <ExportButton
          exportFormat={exportFormat}
          jpgQuality={jpgQuality}
          hasImages={hasImages}
          onExportFormatChange={onExportFormatChange}
          onJpgQualityChange={onJpgQualityChange}
        />
      </div>
    </div>
  );
}

