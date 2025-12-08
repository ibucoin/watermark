import { useCallback, useState } from 'react';
import type { ImageData, WatermarkMode } from '@/types/watermark';
import { Button } from '@/components/ui/button';
import { Upload, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImagesAdd: (images: ImageData[]) => void;
  mode: WatermarkMode;
}

// 支持的图片格式
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function ImageUploader({ onImagesAdd, mode }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理文件
  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    
    // 验证文件
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('仅支持 PNG、JPG、JPEG、WebP 格式');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('文件大小不能超过 50MB');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // 非批量模式只取第一张
    const filesToProcess = mode === 'batch' ? validFiles : [validFiles[0]];

    // 加载图片获取尺寸
    const imageDataList: ImageData[] = await Promise.all(
      filesToProcess.map(async (file) => {
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

    onImagesAdd(imageDataList);
  }, [mode, onImagesAdd]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  // 点击上传
  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPTED_TYPES.join(',');
    input.multiple = mode === 'batch';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    };
    
    input.click();
  }, [mode, processFiles]);

  return (
    <div
      className={cn(
        'h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <ImagePlus className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {mode === 'batch' ? '上传多张图片' : '上传图片'}
          </h3>
          <p className="text-sm text-muted-foreground">
            拖拽图片到此处，或点击下方按钮选择
          </p>
          <p className="text-xs text-muted-foreground">
            支持 PNG、JPG、WebP 格式，单文件最大 50MB
          </p>
        </div>

        <Button onClick={handleClick} size="lg">
          <Upload className="w-4 h-4 mr-2" />
          选择图片
        </Button>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}

