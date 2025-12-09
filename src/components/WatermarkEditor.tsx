import { useState, useCallback } from 'react';
import type { WatermarkState, TextBox, TextBoxStyle, TileWatermarkConfig, ExportFormat, ImageData } from '@/types/watermark';
import { defaultWatermarkState, createTextBox } from '@/types/watermark';
import { ImageCanvas } from './Canvas/ImageCanvas';
import { ImageUploader } from './Canvas/ImageUploader';
import { TileConfigPanel } from './Toolbar/TileConfigPanel';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Grid3X3, Download, Layers, Github } from 'lucide-react';

export function WatermarkEditor() {
  const [state, setState] = useState<WatermarkState>(defaultWatermarkState);
  const [showTileConfig, setShowTileConfig] = useState(false);

  // 获取当前图片的文本框列表
  const getCurrentTextBoxes = useCallback((s: WatermarkState): TextBox[] => {
    if (s.batchSync) {
      // 批量模式：使用全局 textBoxes
      return s.textBoxes;
    } else {
      // 独立模式：使用当前图片的 textBoxes
      const currentImg = s.images[s.currentImageIndex];
      return currentImg?.textBoxes || [];
    }
  }, []);

  // 添加文本框
  const addTextBox = useCallback(() => {
    const newTextBox = createTextBox();
    setState(prev => {
      if (prev.batchSync) {
        // 批量模式：添加到全局 textBoxes
        return {
          ...prev,
          textBoxes: [...prev.textBoxes, newTextBox],
          selectedTextBoxId: newTextBox.id,
        };
      } else {
        // 独立模式：添加到当前图片的 textBoxes
        const newImages = prev.images.map((img, index) => {
          if (index !== prev.currentImageIndex) return img;
          return {
            ...img,
            textBoxes: [...(img.textBoxes || []), newTextBox],
          };
        });
        return {
          ...prev,
          images: newImages,
          selectedTextBoxId: newTextBox.id,
        };
      }
    });
  }, []);

  // 更新文本框
  const updateTextBox = useCallback((id: string, updates: Partial<TextBox>) => {
    setState(prev => {
      if (prev.batchSync) {
        return {
          ...prev,
          textBoxes: prev.textBoxes.map(tb =>
            tb.id === id ? { ...tb, ...updates } : tb
          ),
        };
      } else {
        const newImages = prev.images.map((img, index) => {
          if (index !== prev.currentImageIndex) return img;
          return {
            ...img,
            textBoxes: (img.textBoxes || []).map(tb =>
              tb.id === id ? { ...tb, ...updates } : tb
            ),
          };
        });
        return { ...prev, images: newImages };
      }
    });
  }, []);

  // 更新文本框样式
  const updateTextBoxStyle = useCallback((id: string, styleUpdates: Partial<TextBoxStyle>) => {
    setState(prev => {
      if (prev.batchSync) {
        return {
          ...prev,
          textBoxes: prev.textBoxes.map(tb =>
            tb.id === id ? { ...tb, style: { ...tb.style, ...styleUpdates } } : tb
          ),
        };
      } else {
        const newImages = prev.images.map((img, index) => {
          if (index !== prev.currentImageIndex) return img;
          return {
            ...img,
            textBoxes: (img.textBoxes || []).map(tb =>
              tb.id === id ? { ...tb, style: { ...tb.style, ...styleUpdates } } : tb
            ),
          };
        });
        return { ...prev, images: newImages };
      }
    });
  }, []);

  // 选择文本框
  const selectTextBox = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedTextBoxId: id }));
  }, []);

  // 删除文本框
  const removeTextBox = useCallback((id: string) => {
    setState(prev => {
      if (prev.batchSync) {
        return {
          ...prev,
          textBoxes: prev.textBoxes.filter(tb => tb.id !== id),
          selectedTextBoxId: prev.selectedTextBoxId === id ? null : prev.selectedTextBoxId,
        };
      } else {
        const newImages = prev.images.map((img, index) => {
          if (index !== prev.currentImageIndex) return img;
          return {
            ...img,
            textBoxes: (img.textBoxes || []).filter(tb => tb.id !== id),
          };
        });
        return {
          ...prev,
          images: newImages,
          selectedTextBoxId: prev.selectedTextBoxId === id ? null : prev.selectedTextBoxId,
        };
      }
    });
  }, []);

  // 复制文本框
  const duplicateTextBox = useCallback((id: string) => {
    setState(prev => {
      const currentTextBoxes = getCurrentTextBoxes(prev);
      const original = currentTextBoxes.find(tb => tb.id === id);
      if (!original) return prev;

      const newTextBox = createTextBox({
        text: original.text,
        x: Math.min(original.x + 5, 95),
        y: Math.min(original.y + 5, 95),
        width: original.width,
        angle: original.angle,
        style: { ...original.style },
      });

      if (prev.batchSync) {
        return {
          ...prev,
          textBoxes: [...prev.textBoxes, newTextBox],
          selectedTextBoxId: newTextBox.id,
        };
      } else {
        const newImages = prev.images.map((img, index) => {
          if (index !== prev.currentImageIndex) return img;
          return {
            ...img,
            textBoxes: [...(img.textBoxes || []), newTextBox],
          };
        });
        return {
          ...prev,
          images: newImages,
          selectedTextBoxId: newTextBox.id,
        };
      }
    });
  }, [getCurrentTextBoxes]);

  // 复制水印到其他图片
  const copyToImages = useCallback((textBoxId: string, targetIndices: number[]) => {
    setState(prev => {
      const currentTextBoxes = getCurrentTextBoxes(prev);
      const original = currentTextBoxes.find(tb => tb.id === textBoxId);
      if (!original) return prev;

      const newImages = prev.images.map((img, index) => {
        if (!targetIndices.includes(index)) return img;

        // 为目标图片创建新的文本框副本
        const newTextBox = createTextBox({
          text: original.text,
          x: original.x,
          y: original.y,
          width: original.width,
          angle: original.angle,
          style: { ...original.style },
        });

        // 添加到目标图片的 textBoxes
        const existingTextBoxes = img.textBoxes || [];
        return {
          ...img,
          textBoxes: [...existingTextBoxes, newTextBox],
        };
      });

      return { ...prev, images: newImages };
    });
  }, [getCurrentTextBoxes]);

  // 更新平铺水印配置
  const updateTileConfig = useCallback((updates: Partial<TileWatermarkConfig>) => {
    setState(prev => ({
      ...prev,
      tileConfig: { ...prev.tileConfig, ...updates },
    }));
  }, []);

  // 切换批量同步
  const toggleBatchSync = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, batchSync: enabled }));
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
    setState(prev => ({ 
      ...prev, 
      currentImageIndex: index,
      // 切换图片时清除选中状态（除非是批量模式）
      selectedTextBoxId: prev.batchSync ? prev.selectedTextBoxId : null,
    }));
  }, []);

  // 触发导出
  const handleExport = useCallback(() => {
    window.dispatchEvent(new CustomEvent('watermark:export'));
  }, []);

  const currentImage = state.images[state.currentImageIndex];
  // 根据批量模式获取当前显示的文本框
  const currentTextBoxes = state.batchSync 
    ? state.textBoxes 
    : (currentImage?.textBoxes || []);
  const selectedTextBox = currentTextBoxes.find(tb => tb.id === state.selectedTextBoxId);

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
              {state.images.length > 1 && (
                <div className="flex items-center gap-2 px-2 py-1 border rounded-md bg-background">
                  <Switch
                    id="batch-sync"
                    checked={state.batchSync}
                    onCheckedChange={toggleBatchSync}
                  />
                  <Label htmlFor="batch-sync" className="text-sm cursor-pointer">
                    <Layers className="w-4 h-4 inline mr-1" />
                    批量水印
                  </Label>
                </div>
              )}
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
          <a
            href="https://github.com/ibucoin/watermark"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
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
            textBoxes={currentTextBoxes}
            selectedTextBoxId={state.selectedTextBoxId}
            selectedTextBox={selectedTextBox}
            tileConfig={state.tileConfig}
            exportFormat={state.exportFormat}
            jpgQuality={state.jpgQuality}
            batchSync={state.batchSync}
            onSelectTextBox={selectTextBox}
            onUpdateTextBox={updateTextBox}
            onUpdateTextBoxStyle={updateTextBoxStyle}
            onDuplicateTextBox={duplicateTextBox}
            onRemoveTextBox={removeTextBox}
            onCopyToImages={copyToImages}
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
