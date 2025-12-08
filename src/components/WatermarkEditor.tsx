import { useState, useCallback } from 'react';
import type { WatermarkState, WatermarkConfig, WatermarkMode, AnchorPosition, ExportFormat, ImageData } from '@/types/watermark';
import { defaultWatermarkState } from '@/types/watermark';
import { Toolbar } from './Toolbar/Toolbar';
import { ImageCanvas } from './Canvas/ImageCanvas';
import { ImageUploader } from './Canvas/ImageUploader';

export function WatermarkEditor() {
  const [state, setState] = useState<WatermarkState>(defaultWatermarkState);

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

  // 更新位置（单个模式）
  const setPosition = useCallback((position: { x: number; y: number }) => {
    setState(prev => ({ ...prev, position }));
  }, []);

  // 更新锚点（批量模式）
  const setAnchor = useCallback((anchor: AnchorPosition) => {
    setState(prev => ({ ...prev, anchor }));
  }, []);

  // 添加图片
  const addImages = useCallback((newImages: ImageData[]) => {
    setState(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
      currentImageIndex: prev.images.length === 0 ? 0 : prev.currentImageIndex,
    }));
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
          anchor={state.anchor}
          exportFormat={state.exportFormat}
          jpgQuality={state.jpgQuality}
          hasImages={state.images.length > 0}
          onConfigChange={updateConfig}
          onModeChange={setMode}
          onAnchorChange={setAnchor}
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

        {/* 图片区域 */}
        <div className="flex-1 p-4 overflow-hidden">
          {state.images.length === 0 ? (
            <ImageUploader onImagesAdd={addImages} mode={state.mode} />
          ) : (
            <ImageCanvas
              image={currentImage}
              images={state.images}
              currentIndex={state.currentImageIndex}
              config={state.config}
              mode={state.mode}
              position={state.position}
              anchor={state.anchor}
              exportFormat={state.exportFormat}
              jpgQuality={state.jpgQuality}
              onPositionChange={setPosition}
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

