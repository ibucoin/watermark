import { useState, useCallback } from 'react';
import type { WatermarkState, TextBox, TextBoxStyle, TileWatermarkConfig, ExportFormat, ImageData } from '@/types/watermark';
import { defaultWatermarkState, createTextBox } from '@/types/watermark';
import { ImageCanvas } from './Canvas/ImageCanvas';
import { ImageUploader } from './Canvas/ImageUploader';
import { TileConfigPanel } from './Toolbar/TileConfigPanel';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Download } from 'lucide-react';

export function WatermarkEditor() {
  const [state, setState] = useState<WatermarkState>(defaultWatermarkState);
  const [showTileConfig, setShowTileConfig] = useState(false);

  // 添加文本框
  const addTextBox = useCallback(() => {
    const newTextBox = createTextBox();
    setState(prev => ({
      ...prev,
      textBoxes: [...prev.textBoxes, newTextBox],
      selectedTextBoxId: newTextBox.id,
    }));
  }, []);

  // 更新文本框
  const updateTextBox = useCallback((id: string, updates: Partial<TextBox>) => {
    setState(prev => ({
      ...prev,
      textBoxes: prev.textBoxes.map(tb =>
        tb.id === id ? { ...tb, ...updates } : tb
      ),
    }));
  }, []);

  // 更新文本框样式
  const updateTextBoxStyle = useCallback((id: string, styleUpdates: Partial<TextBoxStyle>) => {
    setState(prev => ({
      ...prev,
      textBoxes: prev.textBoxes.map(tb =>
        tb.id === id ? { ...tb, style: { ...tb.style, ...styleUpdates } } : tb
      ),
    }));
  }, []);

  // 选择文本框
  const selectTextBox = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedTextBoxId: id }));
  }, []);

  // 删除文本框
  const removeTextBox = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      textBoxes: prev.textBoxes.filter(tb => tb.id !== id),
      selectedTextBoxId: prev.selectedTextBoxId === id ? null : prev.selectedTextBoxId,
    }));
  }, []);

  // 复制文本框
  const duplicateTextBox = useCallback((id: string) => {
    setState(prev => {
      const original = prev.textBoxes.find(tb => tb.id === id);
      if (!original) return prev;

      const newTextBox = createTextBox({
        text: original.text,
        x: Math.min(original.x + 5, 95),
        y: Math.min(original.y + 5, 95),
        width: original.width,
        angle: original.angle,
        style: { ...original.style },
      });

      return {
        ...prev,
        textBoxes: [...prev.textBoxes, newTextBox],
        selectedTextBoxId: newTextBox.id,
      };
    });
  }, []);

  // 更新平铺水印配置
  const updateTileConfig = useCallback((updates: Partial<TileWatermarkConfig>) => {
    setState(prev => ({
      ...prev,
      tileConfig: { ...prev.tileConfig, ...updates },
    }));
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
      textBoxes: [],
      selectedTextBoxId: null,
    }));
  }, []);

  // 设置当前图片索引
  const setCurrentImageIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentImageIndex: index }));
  }, []);

  // 触发导出
  const handleExport = useCallback(() => {
    window.dispatchEvent(new CustomEvent('watermark:export'));
  }, []);

  const currentImage = state.images[state.currentImageIndex];
  const selectedTextBox = state.textBoxes.find(tb => tb.id === state.selectedTextBoxId);

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* 顶部标题栏 */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">图片水印工具</h1>
          <span className="text-sm text-muted-foreground">
            纯前端处理，图片不上传服务器
          </span>
        </div>
        <div className="flex items-center gap-2">
          {state.images.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={addTextBox}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加文字
              </Button>
              <Button
                variant={state.tileConfig.enabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTileConfig(!showTileConfig)}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                平铺水印
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
            </>
          )}
        </div>
      </header>

      {/* 平铺水印配置面板 */}
      {showTileConfig && (
        <TileConfigPanel
          config={state.tileConfig}
          onUpdate={updateTileConfig}
          onClose={() => setShowTileConfig(false)}
        />
      )}

      {/* 图片区域 */}
      <main className="flex-1 p-4 overflow-hidden">
        {state.images.length === 0 ? (
          <ImageUploader onImagesAdd={addImages} />
        ) : (
          <ImageCanvas
            image={currentImage}
            images={state.images}
            currentIndex={state.currentImageIndex}
            textBoxes={state.textBoxes}
            selectedTextBoxId={state.selectedTextBoxId}
            selectedTextBox={selectedTextBox}
            tileConfig={state.tileConfig}
            exportFormat={state.exportFormat}
            jpgQuality={state.jpgQuality}
            onSelectTextBox={selectTextBox}
            onUpdateTextBox={updateTextBox}
            onUpdateTextBoxStyle={updateTextBoxStyle}
            onDuplicateTextBox={duplicateTextBox}
            onRemoveTextBox={removeTextBox}
            onImageSelect={setCurrentImageIndex}
            onImageRemove={removeImage}
            onImagesAdd={addImages}
            onClearImages={clearImages}
          />
        )}
      </main>
    </div>
  );
}
