import type { ExportFormat } from '@/types/watermark';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SliderControl } from '../Toolbar/SliderControl';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  exportFormat: ExportFormat;
  jpgQuality: number;
  hasImages: boolean;
  onExportFormatChange: (format: ExportFormat) => void;
  onJpgQualityChange: (quality: number) => void;
}

export function ExportButton({
  exportFormat,
  jpgQuality,
  hasImages,
  onExportFormatChange,
  onJpgQualityChange,
}: ExportButtonProps) {
  const handleExport = () => {
    // 触发导出事件，由 Canvas 组件处理
    window.dispatchEvent(new CustomEvent('watermark:export'));
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">导出设置</Label>

      {/* 格式选择 */}
      <div className="space-y-2">
        <Label>导出格式</Label>
        <Select value={exportFormat} onValueChange={(v) => onExportFormatChange(v as ExportFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG（无损）</SelectItem>
            <SelectItem value="jpg">JPG（压缩）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* JPG 质量（仅 JPG 格式） */}
      {exportFormat === 'jpg' && (
        <SliderControl
          label="图片质量"
          value={jpgQuality}
          min={10}
          max={100}
          step={5}
          unit="%"
          onChange={onJpgQualityChange}
        />
      )}

      {/* 导出按钮 */}
      <Button
        className="w-full"
        size="lg"
        disabled={!hasImages}
        onClick={handleExport}
      >
        <Download className="w-4 h-4 mr-2" />
        导出图片
      </Button>
    </div>
  );
}

