import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

// 预设颜色
const presetColors = [
  '#000000', // 黑色
  '#ffffff', // 白色
  '#ef4444', // 红色
  '#f97316', // 橙色
  '#eab308', // 黄色
  '#22c55e', // 绿色
  '#3b82f6', // 蓝色
  '#8b5cf6', // 紫色
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {/* 预设颜色 */}
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-7 h-7 rounded-md border-2 transition-all ${
              value === color ? 'border-primary scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
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

