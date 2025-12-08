import { useState, useCallback } from 'react';
import type { WatermarkState, WatermarkConfig, WatermarkMode, ExportFormat, ImageData, SingleWatermark } from '@/types/watermark';
import { defaultWatermarkState, generateWatermarkId } from '@/types/watermark';
import { Toolbar } from './Toolbar/Toolbar';
import { ImageCanvas } from './Canvas/ImageCanvas';
import { ImageUploader } from './Canvas/ImageUploader';

// 长宽比校验容差（1%）
const ASPECT_RATIO_TOLERANCE = 0.01;

// 检查长宽比是否一致
function checkAspectRatio(existingImages: ImageData[], newImages: ImageData[]): string[] {
  if (existingImages.length === 0 || newImages.length === 0) return [];
  
  const baseRatio = existingImages[0].width / existingImages[0].height;
  const warnings: string[] = [];
  
  newImages.forEach((img, index) => {
    const ratio = img.width / img.height;
    const diff = Math.abs(ratio - baseRatio) / baseRatio;
    
    if (diff > ASPECT_RATIO_TOLERANCE) {
      warnings.push(`图片 ${index + 1} 的长宽比（${ratio.toFixed(2)}）与其他图片（${baseRatio.toFixed(2)}）不一致，可能影响水印效果`);
    }
  });
  
  return warnings;
}

export function WatermarkEditor() {
  const [state, setState] = useState<WatermarkState>(defaultWatermarkState);
  const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null);

  // 更新水印配置
  const updateConfig = useCallback((updates: Partial<WatermarkConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  // 更新模式
  const setMode = useCallback((mode: WatermarkMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  // 添加水印（单个模式）
  const addWatermark = useCallback(() => {
    const newWatermark: SingleWatermark = {
      id: generateWatermarkId(),
      x: 50,
      y: 50,
    };
    setState(prev => ({
      ...prev,
      watermarks: [...prev.watermarks, newWatermark],
      selectedWatermarkId: newWatermark.id,
    }));
  }, []);

  // 更新水印位置（单个模式）
  const updateWatermarkPosition = useCallback((id: string, x: number, y: number) => {
    setState(prev => ({
      ...prev,
      watermarks: prev.watermarks.map(wm => 
        wm.id === id ? { ...wm, x, y } : wm
      ),
    }));
  }, []);

  // 选择水印（单个模式）
  const selectWatermark = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedWatermarkId: id }));
  }, []);

  // 删除水印
  const removeWatermark = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      watermarks: prev.watermarks.filter(wm => wm.id !== id),
      selectedWatermarkId: prev.selectedWatermarkId === id ? null : prev.selectedWatermarkId,
    }));
  }, []);

  // 添加图片（带长宽比校验）
  const addImages = useCallback((newImages: ImageData[]) => {
    setState(prev => {
      // 批量模式下校验长宽比
      if (prev.mode === 'batch' && prev.images.length > 0) {
        const warnings = checkAspectRatio(prev.images, newImages);
        if (warnings.length > 0) {
          setAspectRatioWarning(warnings[0]);
          // 3秒后自动清除警告
          setTimeout(() => setAspectRatioWarning(null), 5000);
        }
      }
      
      return {
        ...prev,
        images: [...prev.images, ...newImages],
        currentImageIndex: prev.images.length === 0 ? 0 : prev.currentImageIndex,
      };
    });
  }, []);

  // 移除图片
  const removeImage = useCallback((index: number) => {
    setState(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        currentImageIndex: Math.min(prev.currentImageIndex, Math.max(0, newImages.length - 1)),
      };
    });
  }, []);

  // 清除所有图片
  const clearImages = useCallback(() => {
    setState(prev => ({
      ...prev,
      images: [],
      currentImageIndex: 0,
    }));
  }, []);

  // 设置当前图片索引
  const setCurrentImageIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentImageIndex: index }));
  }, []);

  // 更新导出格式
  const setExportFormat = useCallback((exportFormat: ExportFormat) => {
    setState(prev => ({ ...prev, exportFormat }));
  }, []);

  // 更新 JPG 质量
  const setJpgQuality = useCallback((jpgQuality: number) => {
    setState(prev => ({ ...prev, jpgQuality }));
  }, []);

  const currentImage = state.images[state.currentImageIndex];

  return (
    <div className="flex h-screen">
      {/* 左侧工具栏 */}
      <aside className="w-72 flex-shrink-0 border-r bg-card overflow-y-auto">
        <Toolbar
          config={state.config}
          mode={state.mode}
          exportFormat={state.exportFormat}
          jpgQuality={state.jpgQuality}
          hasImages={state.images.length > 0}
          images={state.images}
          currentImage={currentImage}
          onConfigChange={updateConfig}
          onModeChange={setMode}
          onExportFormatChange={setExportFormat}
          onJpgQualityChange={setJpgQuality}
        />
      </aside>

      {/* 右侧图片操作区域 */}
      <main className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
        {/* 顶部标题栏 */}
        <header className="h-14 border-b bg-card flex items-center px-4">
          <h1 className="text-lg font-semibold">图片水印工具</h1>
          <span className="ml-2 text-sm text-muted-foreground">
            纯前端处理，图片不上传服务器
          </span>
        </header>

        {/* 长宽比警告 */}
        {aspectRatioWarning && (
          <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ {aspectRatioWarning}
          </div>
        )}

        {/* 图片区域 */}
        <div className="flex-1 p-4 overflow-hidden">
          {state.images.length === 0 ? (
            <ImageUploader onImagesAdd={addImages} mode={state.mode} existingImages={state.images} />
          ) : (
            <ImageCanvas
              image={currentImage}
              images={state.images}
              currentIndex={state.currentImageIndex}
              config={state.config}
              mode={state.mode}
              watermarks={state.watermarks}
              selectedWatermarkId={state.selectedWatermarkId}
              anchor={state.anchor}
              exportFormat={state.exportFormat}
              jpgQuality={state.jpgQuality}
              onAddWatermark={addWatermark}
              onUpdateWatermarkPosition={updateWatermarkPosition}
              onSelectWatermark={selectWatermark}
              onRemoveWatermark={removeWatermark}
              onImageSelect={setCurrentImageIndex}
              onImageRemove={removeImage}
              onImagesAdd={addImages}
              onClearImages={clearImages}
            />
          )}
        </div>
      </main>
    </div>
  );
}

