import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

// 预设颜色
const presetColors = [
  '#333333', // 深灰色（推荐）
  '#000000', // 黑色
  '#ffffff', // 白色
  '#ef4444', // 红色
  '#f97316', // 橙色
  '#eab308', // 黄色
  '#22c55e', // 绿色
  '#3b82f6', // 蓝色
  '#8b5cf6', // 紫色
];

// 判断颜色是否为浅色（需要显示边框）
function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return false;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  // 使用亮度公式判断
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.8;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {/* 预设颜色 */}
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              'w-7 h-7 rounded-md border-2 transition-all',
              value === color 
                ? 'border-primary scale-110' 
                : isLightColor(color) 
                  ? 'border-gray-300' // 浅色显示边框
                  : 'border-transparent'
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color === '#333333' ? `${color} (推荐)` : color}
          />
        ))}
      </div>

      {/* 自定义颜色 */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-md border cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}

