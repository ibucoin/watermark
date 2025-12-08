import { useRef, useEffect, useCallback, useState } from 'react';
import type { ImageData, WatermarkConfig, WatermarkMode, AnchorPosition, ExportFormat } from '@/types/watermark';
import { renderWatermark, exportImage, downloadBlob } from '@/utils/watermark';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface ImageCanvasProps {
  image: ImageData;
  images: ImageData[];
  currentIndex: number;
  config: WatermarkConfig;
  mode: WatermarkMode;
  position: { x: number; y: number };
  anchor: AnchorPosition;
  exportFormat: ExportFormat;
  jpgQuality: number;
  onPositionChange: (position: { x: number; y: number }) => void;
  onImageSelect: (index: number) => void;
  onImageRemove: (index: number) => void;
  onImagesAdd: (images: ImageData[]) => void;
  onClearImages: () => void;
}

export function ImageCanvas({
  image,
  images,
  currentIndex,
  config,
  mode,
  position,
  anchor,
  exportFormat,
  jpgQuality,
  onPositionChange,
  onImageSelect,
  onImageRemove,
  onImagesAdd,
  onClearImages,
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 加载图片
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.onload = () => setLoadedImage(img);
    img.src = image.url;

    return () => {
      setLoadedImage(null);
    };
  }, [image]);

  // 渲染 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !loadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 计算缩放比例以适应容器
    const containerRect = container.getBoundingClientRect();
    const maxWidth = containerRect.width - 32;
    const maxHeight = containerRect.height - 32;
    
    const scale = Math.min(
      maxWidth / loadedImage.naturalWidth,
      maxHeight / loadedImage.naturalHeight,
      1 // 不放大
    );

    const displayWidth = loadedImage.naturalWidth * scale;
    const displayHeight = loadedImage.naturalHeight * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // 绘制图片
    ctx.drawImage(loadedImage, 0, 0, displayWidth, displayHeight);

    // 渲染水印（按比例缩放配置）
    const scaledConfig = {
      ...config,
      fontSize: config.fontSize * scale,
      spacing: config.spacing * scale,
    };

    renderWatermark(ctx, displayWidth, displayHeight, scaledConfig, mode, position, anchor);
  }, [loadedImage, config, mode, position, anchor]);

  // 处理拖拽（单个模式）
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'single') return;
    setIsDragging(true);
  }, [mode]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || mode !== 'single') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPositionChange({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, [isDragging, mode, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 导出处理
  useEffect(() => {
    const handleExport = async () => {
      if (!loadedImage || isExporting) return;
      setIsExporting(true);

      try {
        if (mode === 'batch' && images.length > 1) {
          // 批量导出
          await exportBatch();
        } else {
          // 单张导出
          await exportSingle();
        }
      } catch (error) {
        console.error('Export failed:', error);
        alert('导出失败，请重试');
      } finally {
        setIsExporting(false);
      }
    };

    window.addEventListener('watermark:export', handleExport);
    return () => window.removeEventListener('watermark:export', handleExport);
  }, [loadedImage, images, config, mode, position, anchor, exportFormat, jpgQuality, isExporting]);

  // 单张导出
  const exportSingle = async () => {
    if (!loadedImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = loadedImage.naturalWidth;
    canvas.height = loadedImage.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(loadedImage, 0, 0);
    renderWatermark(ctx, canvas.width, canvas.height, config, mode, position, anchor);

    const ext = exportFormat === 'png' ? 'png' : 'jpg';
    const blob = await exportImage(canvas, exportFormat, jpgQuality, 'watermarked');
    downloadBlob(blob, `watermarked-${Date.now()}.${ext}`);
  };

  // 批量导出
  const exportBatch = async () => {
    const zip = new JSZip();
    const ext = exportFormat === 'png' ? 'png' : 'jpg';

    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.src = images[i].url;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.drawImage(img, 0, 0);
      renderWatermark(ctx, canvas.width, canvas.height, config, mode, position, anchor);

      const blob = await exportImage(canvas, exportFormat, jpgQuality, '');
      zip.file(`watermarked-${i + 1}.${ext}`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `watermarked-images-${Date.now()}.zip`);
  };

  // 添加更多图片
  const handleAddMore = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.multiple = mode === 'batch';
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const newImages: ImageData[] = await Promise.all(
        Array.from(files).map(async (file) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          
          return new Promise<ImageData>((resolve) => {
            img.onload = () => {
              resolve({
                file,
                url,
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            };
            img.src = url;
          });
        })
      );

      onImagesAdd(newImages);
    };
    
    input.click();
  }, [mode, onImagesAdd]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Canvas 预览区域 */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')] rounded-lg overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className={cn(
            'shadow-lg',
            mode === 'single' && 'cursor-move'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* 批量模式缩略图 */}
      {mode === 'batch' && images.length > 0 && (
        <div className="flex gap-2 p-2 bg-card rounded-lg overflow-x-auto">
          {images.map((img, index) => (
            <div
              key={img.url}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-colors',
                index === currentIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'
              )}
              onClick={() => onImageSelect(index)}
            >
              <img
                src={img.url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-0 right-0 p-0.5 bg-destructive text-destructive-foreground rounded-bl-md opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove(index);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* 添加更多按钮 */}
          <button
            type="button"
            className="flex-shrink-0 w-16 h-16 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex items-center justify-center transition-colors"
            onClick={handleAddMore}
          >
            <Plus className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {image && `${image.width} × ${image.height} px`}
          {mode === 'batch' && images.length > 1 && ` · ${images.length} 张图片`}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddMore}>
            <Plus className="w-4 h-4 mr-1" />
            {mode === 'batch' ? '添加图片' : '更换图片'}
          </Button>
          <Button variant="outline" size="sm" onClick={onClearImages}>
            <Trash2 className="w-4 h-4 mr-1" />
            清除
          </Button>
        </div>
      </div>
    </div>
  );
}

