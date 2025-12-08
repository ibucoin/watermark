import { useRef, useEffect, useCallback, useState } from 'react';
import type { ImageData, TextBox, TextBoxStyle, TileWatermarkConfig, ExportFormat } from '@/types/watermark';
import { renderTileWatermark, renderTextBoxes, getTextBoxAtPosition, getHandleAtPosition, exportImage, downloadBlob, type HandleType } from '@/utils/watermark';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Trash2, ZoomIn, ZoomOut, Type, Palette, Eye, Copy, CopyPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

// 预设颜色
const presetColors = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
];

interface ImageCanvasProps {
  image: ImageData;
  images: ImageData[];
  currentIndex: number;
  textBoxes: TextBox[];
  selectedTextBoxId: string | null;
  selectedTextBox: TextBox | undefined;
  tileConfig: TileWatermarkConfig;
  exportFormat: ExportFormat;
  jpgQuality: number;
  batchSync: boolean;
  onSelectTextBox: (id: string | null) => void;
  onUpdateTextBox: (id: string, updates: Partial<TextBox>) => void;
  onUpdateTextBoxStyle: (id: string, updates: Partial<TextBoxStyle>) => void;
  onDuplicateTextBox: (id: string) => void;
  onRemoveTextBox: (id: string) => void;
  onCopyToImages: (textBoxId: string, targetIndices: number[]) => void;
  onImageSelect: (index: number) => void;
  onImageRemove: (index: number) => void;
  onImagesAdd: (images: ImageData[]) => void;
  onClearImages: () => void;
}

export function ImageCanvas({
  image,
  images,
  currentIndex,
  textBoxes,
  selectedTextBoxId,
  selectedTextBox,
  tileConfig,
  exportFormat,
  jpgQuality,
  batchSync,
  onSelectTextBox,
  onUpdateTextBox,
  onUpdateTextBoxStyle,
  onDuplicateTextBox,
  onRemoveTextBox,
  onCopyToImages,
  onImageSelect,
  onImageRemove,
  onImagesAdd,
  onClearImages,
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<HandleType>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(100); // 缩放百分比
  const [fitZoom, setFitZoom] = useState(100); // 适配容器的缩放值
  const [isEditing, setIsEditing] = useState(false); // 是否正在编辑文本
  const [editingText, setEditingText] = useState(''); // 编辑中的文本
  const [hoveredTextBoxId, setHoveredTextBoxId] = useState<string | null>(null); // 悬停的文本框 ID
  const [showCopyToMenu, setShowCopyToMenu] = useState(false); // 显示复制到其他图片菜单
  const [showBatchHint, setShowBatchHint] = useState(false); // 显示批量模式提示

  // 计算实际缩放比例（基于适配缩放）
  const scale = (fitZoom / 100) * (zoom / 100);
  
  // 批量模式下是否可编辑（只有第一张图片可编辑）
  const isEditable = !batchSync || currentIndex === 0;

  // 批量模式下非第一张图片时，显示提示并在2秒后自动消失
  useEffect(() => {
    if (batchSync && currentIndex !== 0) {
      setShowBatchHint(true);
      const timer = setTimeout(() => {
        setShowBatchHint(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowBatchHint(false);
    }
  }, [batchSync, currentIndex]);

  // 加载图片并计算适配缩放（首次加载时）
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
      
      // 计算适配容器的缩放比例（首次加载时）
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const maxWidth = containerRect.width - 32;
        const maxHeight = containerRect.height - 32;
        
        const fitScale = Math.min(
          maxWidth / img.naturalWidth,
          maxHeight / img.naturalHeight,
          1 // 不放大超过原始尺寸
        );
        setFitZoom(fitScale * 100);
      }
      // 注意：不重置 zoom，保持用户之前设置的缩放比例
    };
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

    const dpr = window.devicePixelRatio || 1;

    const displayWidth = loadedImage.naturalWidth * scale;
    const displayHeight = loadedImage.naturalHeight * scale;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.scale(dpr, dpr);

    // 绘制图片
    ctx.drawImage(loadedImage, 0, 0, displayWidth, displayHeight);

    // 渲染平铺水印
    if (tileConfig.enabled) {
      const scaledTileConfig = {
        ...tileConfig,
        fontSize: tileConfig.fontSize * scale,
        spacing: tileConfig.spacing * scale,
      };
      renderTileWatermark(ctx, displayWidth, displayHeight, scaledTileConfig);
    }

    // 渲染文本框（按比例缩放）
    const scaledTextBoxes = textBoxes.map(tb => ({
      ...tb,
      style: {
        ...tb.style,
        fontSize: tb.style.fontSize * scale,
      },
    }));
    renderTextBoxes(ctx, displayWidth, displayHeight, scaledTextBoxes, selectedTextBoxId, true, hoveredTextBoxId);
  }, [loadedImage, textBoxes, selectedTextBoxId, tileConfig, scale, hoveredTextBoxId]);

  // 处理双击编辑
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditable) return; // 批量模式下非第一张图片不可编辑
    
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否双击了文本框
    const scaledTextBoxes = textBoxes.map(tb => ({
      ...tb,
      style: { ...tb.style, fontSize: tb.style.fontSize * scale },
    }));
    const clickedBox = getTextBoxAtPosition(x, y, rect.width, rect.height, scaledTextBoxes);
    
    if (clickedBox) {
      setIsEditing(true);
      setEditingText(clickedBox.text);
      onSelectTextBox(clickedBox.id);
      // 聚焦输入框
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditable, loadedImage, textBoxes, scale, onSelectTextBox]);

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isEditing) return; // 编辑模式下不处理拖拽
    if (!isEditable) return; // 批量模式下非第一张图片不可操作

    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 如果有选中的文本框，检查是否点击了控制手柄
    if (selectedTextBoxId) {
      const selectedBox = textBoxes.find(tb => tb.id === selectedTextBoxId);
      if (selectedBox) {
        const scaledBox = {
          ...selectedBox,
          style: { ...selectedBox.style, fontSize: selectedBox.style.fontSize * scale },
        };
        const handle = getHandleAtPosition(x, y, rect.width, rect.height, scaledBox);
        if (handle) {
          setDragHandle(handle);
          setDragStartPos({ x, y });
          setIsDragging(true);
          return;
        }
      }
    }

    // 检查是否点击了文本框
    const scaledTextBoxes = textBoxes.map(tb => ({
      ...tb,
      style: { ...tb.style, fontSize: tb.style.fontSize * scale },
    }));
    const clickedBox = getTextBoxAtPosition(x, y, rect.width, rect.height, scaledTextBoxes);
    
    if (clickedBox) {
      onSelectTextBox(clickedBox.id);
      setDragHandle('move');
      setDragStartPos({ x, y });
      setIsDragging(true);
    } else {
      onSelectTextBox(null);
      setIsEditing(false);
    }
  }, [isEditing, isEditable, loadedImage, textBoxes, selectedTextBoxId, scale, onSelectTextBox]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 如果正在拖拽（只有可编辑时才处理）
    if (isDragging && selectedTextBoxId && dragHandle && isEditable) {
      const selectedBox = textBoxes.find(tb => tb.id === selectedTextBoxId);
      if (!selectedBox) return;

      if (dragHandle === 'move') {
        // 移动文本框
        const deltaX = ((x - dragStartPos.x) / rect.width) * 100;
        const deltaY = ((y - dragStartPos.y) / rect.height) * 100;
        
        const newX = Math.max(5, Math.min(95, selectedBox.x + deltaX));
        const newY = Math.max(5, Math.min(95, selectedBox.y + deltaY));
        
        onUpdateTextBox(selectedTextBoxId, { x: newX, y: newY });
        setDragStartPos({ x, y });
      } else if (dragHandle === 'rotate') {
        // 旋转文本框
        const centerX = (selectedBox.x / 100) * rect.width;
        const centerY = (selectedBox.y / 100) * rect.height;
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
        onUpdateTextBox(selectedTextBoxId, { angle: Math.round(angle) });
      } else if (dragHandle?.startsWith('resize')) {
        // 调整大小
        const deltaX = x - dragStartPos.x;
        const newWidth = Math.max(10, Math.min(80, selectedBox.width + (deltaX / rect.width) * 100));
        onUpdateTextBox(selectedTextBoxId, { width: newWidth });
        setDragStartPos({ x, y });
      }
    } else if (isEditable) {
      // 检测悬停的文本框（只有可编辑时才显示 hover 效果）
      const scaledTextBoxes = textBoxes.map(tb => ({
        ...tb,
        style: { ...tb.style, fontSize: tb.style.fontSize * scale },
      }));
      const hoveredBox = getTextBoxAtPosition(x, y, rect.width, rect.height, scaledTextBoxes);
      setHoveredTextBoxId(hoveredBox?.id || null);
    } else {
      // 不可编辑时清除 hover 状态
      setHoveredTextBoxId(null);
    }
  }, [isDragging, selectedTextBoxId, dragHandle, dragStartPos, textBoxes, scale, isEditable, onUpdateTextBox]);

  // 处理鼠标松开
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
    setHoveredTextBoxId(null);
  }, []);

  // 处理文本编辑完成
  const handleEditComplete = useCallback(() => {
    if (selectedTextBoxId && editingText !== undefined) {
      onUpdateTextBox(selectedTextBoxId, { text: editingText });
    }
    setIsEditing(false);
  }, [selectedTextBoxId, editingText, onUpdateTextBox]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [handleEditComplete]);

  // 导出处理
  useEffect(() => {
    const handleExport = async () => {
      if (!loadedImage || isExporting) return;
      setIsExporting(true);

      try {
        if (images.length > 1) {
          await exportBatch();
        } else {
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
  }, [loadedImage, images, textBoxes, tileConfig, exportFormat, jpgQuality, batchSync, currentIndex, isExporting]);

  // 获取文件名（不含扩展名）
  const getFileName = (file: File): string => {
    const name = file.name;
    const lastDot = name.lastIndexOf('.');
    return lastDot > 0 ? name.substring(0, lastDot) : name;
  };

  // 单张导出
  const exportSingle = async () => {
    if (!loadedImage || !image) return;

    const canvas = document.createElement('canvas');
    canvas.width = loadedImage.naturalWidth;
    canvas.height = loadedImage.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(loadedImage, 0, 0);
    
    // 渲染平铺水印
    if (tileConfig.enabled) {
      renderTileWatermark(ctx, canvas.width, canvas.height, tileConfig);
    }
    
    // 渲染文本框（不显示控制手柄）
    renderTextBoxes(ctx, canvas.width, canvas.height, textBoxes, null, false);

    const ext = exportFormat === 'png' ? 'png' : 'jpg';
    const originalName = getFileName(image.file);
    const blob = await exportImage(canvas, exportFormat, jpgQuality, '');
    downloadBlob(blob, `${originalName}.${ext}`);
  };

  // 批量导出
  const exportBatch = async () => {
    const zip = new JSZip();
    const ext = exportFormat === 'png' ? 'png' : 'jpg';

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i];
      const img = new Image();
      img.src = imgData.url;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.drawImage(img, 0, 0);
      
      // 渲染平铺水印（如果启用，所有图片都应用）
      if (tileConfig.enabled) {
        renderTileWatermark(ctx, canvas.width, canvas.height, tileConfig);
      }
      
      // 确定要渲染的文本框
      // 批量模式：所有图片使用传入的 textBoxes（全局水印）
      // 独立模式：每张图片使用自己的 textBoxes
      if (batchSync) {
        // 批量模式：所有图片使用相同的水印
        if (textBoxes.length > 0) {
          renderTextBoxes(ctx, canvas.width, canvas.height, textBoxes, null, false);
        }
      } else {
        // 独立模式：使用图片自己的水印
        const imageTextBoxes = imgData.textBoxes || [];
        if (imageTextBoxes.length > 0) {
          renderTextBoxes(ctx, canvas.width, canvas.height, imageTextBoxes, null, false);
        }
      }

      const originalName = getFileName(imgData.file);
      const blob = await exportImage(canvas, exportFormat, jpgQuality, '');
      zip.file(`${originalName}.${ext}`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `watermarked-images-${Date.now()}.zip`);
  };

  // 添加更多图片
  const handleAddMore = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.multiple = true;
    
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
  }, [onImagesAdd]);

  // 计算编辑框位置
  const getEditInputPosition = useCallback(() => {
    if (!selectedTextBoxId || !canvasRef.current || !containerRef.current) return null;
    
    const selectedBox = textBoxes.find(tb => tb.id === selectedTextBoxId);
    if (!selectedBox) return null;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;

    const x = offsetX + (selectedBox.x / 100) * canvasRect.width;
    const y = offsetY + (selectedBox.y / 100) * canvasRect.height;

    return { x, y };
  }, [selectedTextBoxId, textBoxes]);

  const editPosition = getEditInputPosition();

  return (
    <div className="h-full flex flex-col gap-3">
      {/* 顶部工具区：缩放控制 + 浮动工具栏 */}
      <div className="flex items-center justify-between gap-4 py-2 px-4 bg-card rounded-lg border">
        {/* 缩放控制 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(10, zoom - 10))}
            disabled={zoom <= 10}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 w-36">
            <Slider
              value={[zoom]}
              min={10}
              max={300}
              step={5}
              onValueChange={([value]) => setZoom(value)}
            />
            <span className="text-sm text-muted-foreground w-12">{zoom}%</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(300, zoom + 10))}
            disabled={zoom >= 300}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(100)}
          >
            适配
          </Button>
        </div>

        {/* 浮动工具栏 - 选中文本框时显示（批量模式下非第一张图片不显示） */}
        {selectedTextBox && isEditable && (
          <div className="flex items-center divide-x border-l pl-4">
            {/* 字体大小 */}
            <div className="flex items-center gap-2 pr-4">
              <Type className="w-4 h-4 text-muted-foreground" />
              <div className="w-24">
                <Slider
                  value={[selectedTextBox.style.fontSize]}
                  min={12}
                  max={200}
                  step={1}
                  onValueChange={([value]) => onUpdateTextBoxStyle(selectedTextBox.id, { fontSize: value })}
                />
              </div>
              <span className="text-sm text-muted-foreground w-10">{selectedTextBox.style.fontSize}px</span>
            </div>

            {/* 文字颜色 */}
            <div className="flex items-center gap-2 px-4">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1">
                {presetColors.slice(0, 6).map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-5 h-5 rounded border transition-all ${
                      selectedTextBox.style.color === color 
                        ? 'border-primary ring-1 ring-primary' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdateTextBoxStyle(selectedTextBox.id, { color })}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={selectedTextBox.style.color}
                    onChange={(e) => onUpdateTextBoxStyle(selectedTextBox.id, { color: e.target.value })}
                    className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer"
                  />
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ 
                      background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 透明度 */}
            <div className="flex items-center gap-2 px-4">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <div className="w-16">
                <Slider
                  value={[selectedTextBox.style.opacity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => onUpdateTextBoxStyle(selectedTextBox.id, { opacity: value })}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{selectedTextBox.style.opacity}%</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1 pl-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicateTextBox(selectedTextBox.id)}
                title="复制"
                className="h-7 w-7 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
              {images.length > 1 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCopyToMenu(!showCopyToMenu)}
                    title="复制到其他图片"
                    className="h-7 w-7 p-0"
                  >
                    <CopyPlus className="w-4 h-4" />
                  </Button>
                  {showCopyToMenu && (
                    <div className="absolute top-full right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 min-w-[160px] py-1">
                      <div className="px-3 py-1.5 text-xs text-muted-foreground border-b">
                        复制到其他图片
                      </div>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors"
                        onClick={() => {
                          const allIndices = images.map((_, i) => i).filter(i => i !== currentIndex);
                          onCopyToImages(selectedTextBox.id, allIndices);
                          setShowCopyToMenu(false);
                        }}
                      >
                        全部图片
                      </button>
                      <div className="border-t my-1" />
                      {images.map((img, index) => (
                        index !== currentIndex && (
                          <button
                            key={img.url}
                            type="button"
                            className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors flex items-center gap-2"
                            onClick={() => {
                              onCopyToImages(selectedTextBox.id, [index]);
                              setShowCopyToMenu(false);
                            }}
                          >
                            <img
                              src={img.url}
                              alt={`Image ${index + 1}`}
                              className="w-6 h-6 object-cover rounded"
                            />
                            <span>图片 {index + 1}</span>
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveTextBox(selectedTextBox.id)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas 预览区域 - 支持滚动查看 */}
      <div
        ref={containerRef}
        className="flex-1 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')] rounded-lg overflow-auto relative"
      >
        {/* 批量模式下非第一张图片的提示（2秒后自动消失） */}
        {showBatchHint && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-md text-sm flex items-center gap-2 pointer-events-auto animate-in fade-in duration-200">
            <span>批量水印模式下，请切换到第一张图片进行编辑</span>
            <button
              type="button"
              className="text-amber-600 hover:text-amber-800 underline"
              onClick={() => onImageSelect(0)}
            >
              切换到第一张
            </button>
          </div>
        )}
        {/* 内部容器：使用 inline-flex 确保内容可以超出容器并触发滚动 */}
        <div className="inline-flex min-w-full min-h-full items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            className={cn(
              'shadow-lg',
              !isEditable ? 'cursor-not-allowed' :
              isDragging ? 'cursor-grabbing' : 
              hoveredTextBoxId ? 'cursor-pointer' : 'cursor-default'
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleDoubleClick}
          />
        </div>

        {/* 文本编辑输入框 */}
        {isEditing && editPosition && (
          <input
            ref={inputRef}
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={handleEditComplete}
            onKeyDown={handleKeyDown}
            className="absolute bg-white border-2 border-primary rounded px-2 py-1 text-center outline-none shadow-lg z-10"
            style={{
              left: editPosition.x,
              top: editPosition.y,
              transform: 'translate(-50%, -50%)',
              minWidth: '100px',
            }}
          />
        )}
      </div>

      {/* 底部缩略图 */}
      {images.length > 0 && (
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

      {/* 底部信息栏 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {image && `${image.width} × ${image.height} px`}
          {images.length > 1 && ` · ${images.length} 张图片`}
          {textBoxes.length > 0 && ` · ${textBoxes.length} 个文本框`}
          <span className="ml-2 text-xs">(双击文本框可编辑文字)</span>
        </div>
        <Button variant="outline" size="sm" onClick={onClearImages}>
          <Trash2 className="w-4 h-4 mr-1" />
          清除全部
        </Button>
      </div>
    </div>
  );
}
