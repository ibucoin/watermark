import type { TextBox, TextBoxStyle } from '@/types/watermark';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Copy, Trash2, Type, Palette, Eye } from 'lucide-react';

interface FloatingToolbarProps {
  textBox: TextBox;
  onUpdateStyle: (updates: Partial<TextBoxStyle>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

// 预设颜色
const presetColors = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
];

export function FloatingToolbar({
  textBox,
  onUpdateStyle,
  onDuplicate,
  onDelete,
}: FloatingToolbarProps) {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-card border rounded-xl shadow-lg">
      <div className="flex items-center divide-x">
        {/* 字体大小 */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Type className="w-4 h-4 text-muted-foreground" />
          <div className="w-28">
            <Slider
              value={[textBox.style.fontSize]}
              min={12}
              max={200}
              step={1}
              onValueChange={([value]) => onUpdateStyle({ fontSize: value })}
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">{textBox.style.fontSize}px</span>
        </div>

        {/* 文字颜色 */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-6 h-6 rounded border transition-all ${
                  textBox.style.color === color 
                    ? 'border-primary ring-2 ring-primary ring-offset-1' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onUpdateStyle({ color })}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={textBox.style.color}
                onChange={(e) => onUpdateStyle({ color: e.target.value })}
                className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer"
              />
              <div 
                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs"
                style={{ 
                  background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` 
                }}
              />
            </div>
          </div>
        </div>

        {/* 透明度 */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <div className="w-20">
            <Slider
              value={[textBox.style.opacity]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => onUpdateStyle({ opacity: value })}
            />
          </div>
          <span className="text-sm text-muted-foreground w-10">{textBox.style.opacity}%</span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 px-3 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            title="复制"
            className="h-8 w-8 p-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
