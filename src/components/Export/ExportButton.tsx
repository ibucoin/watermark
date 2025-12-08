import { useMemo } from 'react';
import type { ExportFormat, ImageData, WatermarkMode } from '@/types/watermark';
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
  images: ImageData[];
  currentImage: ImageData | undefined;
  mode: WatermarkMode;
  onExportFormatChange: (format: ExportFormat) => void;
  onJpgQualityChange: (quality: number) => void;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 预估文件大小（基于像素数和格式）
function estimateFileSize(
  width: number,
  height: number,
  format: ExportFormat,
  quality: number
): number {
  const pixels = width * height;
  
  if (format === 'png') {
    // PNG 无损压缩，预估压缩比约 3:1 到 5:1
    // 原始大小 = pixels * 4 (RGBA)
    return Math.round(pixels * 4 / 4);
  } else {
    // JPG 有损压缩，质量影响大小
    // 高质量(100%)约 1:10，低质量(10%)约 1:50
    const compressionRatio = 10 + (100 - quality) * 0.4;
    return Math.round((pixels * 3) / compressionRatio);
  }
}

export function ExportButton({
  exportFormat,
  jpgQuality,
  hasImages,
  images,
  currentImage,
  mode,
  onExportFormatChange,
  onJpgQualityChange,
}: ExportButtonProps) {
  const handleExport = () => {
    // 触发导出事件，由 Canvas 组件处理
    window.dispatchEvent(new CustomEvent('watermark:export'));
  };

  // 计算导出信息
  const exportInfo = useMemo(() => {
    if (!hasImages || !currentImage) return null;

    const { width, height } = currentImage;
    const singleSize = estimateFileSize(width, height, exportFormat, jpgQuality);

    if (mode === 'batch' && images.length > 1) {
      // 批量模式：计算所有图片的总大小
      const totalSize = images.reduce((sum, img) => {
        return sum + estimateFileSize(img.width, img.height, exportFormat, jpgQuality);
      }, 0);
      
      return {
        dimension: `${width} × ${height}`,
        singleSize: formatFileSize(singleSize),
        totalSize: formatFileSize(totalSize),
        imageCount: images.length,
      };
    }

    return {
      dimension: `${width} × ${height}`,
      singleSize: formatFileSize(singleSize),
      totalSize: null,
      imageCount: 1,
    };
  }, [hasImages, currentImage, images, mode, exportFormat, jpgQuality]);

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">导出设置</Label>

      {/* 导出信息 */}
      {exportInfo && (
        <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">导出尺寸</span>
            <span className="font-mono">{exportInfo.dimension} px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">预估大小</span>
            <span className="font-mono">
              {exportInfo.totalSize 
                ? `${exportInfo.totalSize}（${exportInfo.imageCount} 张）` 
                : `~${exportInfo.singleSize}`}
            </span>
          </div>
        </div>
      )}

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
        {mode === 'batch' && images.length > 1 
          ? `导出 ${images.length} 张图片` 
          : '导出图片'}
      </Button>
    </div>
  );
}
