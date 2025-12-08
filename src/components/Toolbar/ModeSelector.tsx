import type { WatermarkMode } from '@/types/watermark';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModeSelectorProps {
  value: WatermarkMode;
  onChange: (mode: WatermarkMode) => void;
}

const modes: { value: WatermarkMode; label: string }[] = [
  { value: 'tile', label: '平铺' },
  { value: 'single', label: '单个' },
  { value: 'batch', label: '批量' },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as WatermarkMode)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {modes.map((mode) => (
          <TabsTrigger key={mode.value} value={mode.value}>
            {mode.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

