import type { AnchorPosition } from '@/types/watermark';
import { cn } from '@/lib/utils';

interface PositionSelectorProps {
  value: AnchorPosition;
  onChange: (position: AnchorPosition) => void;
}

const positions: AnchorPosition[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

export function PositionSelector({ value, onChange }: PositionSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-1 p-2 bg-muted rounded-md">
      {positions.map((pos) => (
        <button
          key={pos}
          type="button"
          onClick={() => onChange(pos)}
          className={cn(
            'w-full aspect-square rounded-sm transition-colors',
            value === pos
              ? 'bg-primary'
              : 'bg-background hover:bg-accent'
          )}
          title={pos}
        />
      ))}
    </div>
  );
}

