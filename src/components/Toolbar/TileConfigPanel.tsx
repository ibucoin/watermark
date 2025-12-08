import type { TileWatermarkConfig } from '@/types/watermark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface TileConfigPanelProps {
  config: TileWatermarkConfig;
  onUpdate: (updates: Partial<TileWatermarkConfig>) => void;
  onClose: () => void;
}

// 预设颜色
const presetColors = [
  '#000000', '#333333', '#666666', '#999999', '#ffffff',
];

export function TileConfigPanel({
  config,
  onUpdate,
  onClose,
}: TileConfigPanelProps) {
  return (
    <div className="absolute top-16 right-4 z-50 w-72 bg-card border rounded-lg shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
          <span className="font-medium">平铺水印</span>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 配置内容 */}
      <div className={`p-4 space-y-4 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* 水印文字 */}
        <div className="space-y-2">
          <Label htmlFor="tile-text">水印文字</Label>
          <Input
            id="tile-text"
            value={config.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="请输入水印文字"
          />
        </div>

        {/* 颜色选择 */}
        <div className="space-y-2">
          <Label>颜色</Label>
          <div className="flex gap-1">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-7 h-7 rounded border-2 transition-all ${
                  config.color === color ? 'border-primary scale-110' : 'border-transparent'
                } ${color === '#ffffff' ? 'border border-gray-300' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onUpdate({ color })}
              />
            ))}
            <input
              type="color"
              value={config.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 透明度 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>透明度</Label>
            <span className="text-sm text-muted-foreground">{config.opacity}%</span>
          </div>
          <Slider
            value={[config.opacity]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => onUpdate({ opacity: value })}
          />
        </div>

        {/* 字体大小 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>字体大小</Label>
            <span className="text-sm text-muted-foreground">{config.fontSize}px</span>
          </div>
          <Slider
            value={[config.fontSize]}
            min={12}
            max={200}
            step={1}
            onValueChange={([value]) => onUpdate({ fontSize: value })}
          />
        </div>

        {/* 旋转角度 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>旋转角度</Label>
            <span className="text-sm text-muted-foreground">{config.angle}°</span>
          </div>
          <Slider
            value={[config.angle]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => onUpdate({ angle: value })}
          />
        </div>

        {/* 间距 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>间距</Label>
            <span className="text-sm text-muted-foreground">{config.spacing}px</span>
          </div>
          <Slider
            value={[config.spacing]}
            min={50}
            max={500}
            step={10}
            onValueChange={([value]) => onUpdate({ spacing: value })}
          />
        </div>
      </div>
    </div>
  );
}

