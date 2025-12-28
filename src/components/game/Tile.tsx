'use client';

import { Tile as TileType } from '@/lib/game/types';
import { isOkey } from '@/lib/game/tiles';
import { cn } from '@/lib/utils';

interface TileProps {
  tile: TileType;
  okeyTile?: TileType | null;
  isSelected?: boolean;
  isFaceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  draggable?: boolean;
  className?: string;
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  yellow: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  black: {
    bg: 'bg-gray-50',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
};

const sizeClasses = {
  sm: 'w-8 h-12 text-sm',
  md: 'w-10 h-14 text-lg',
  lg: 'w-12 h-16 text-xl',
};

export function Tile({
  tile,
  okeyTile,
  isSelected = false,
  isFaceDown = false,
  size = 'md',
  onClick,
  draggable = false,
  className,
}: TileProps) {
  const isOkeyTile = okeyTile && isOkey(tile, okeyTile);
  const colors = colorClasses[tile.color] || colorClasses.black;

  // Face down tile
  if (isFaceDown || tile.isFaceDown) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-amber-700 bg-gradient-to-br from-amber-800 to-amber-900',
          'flex items-center justify-center shadow-md',
          'transition-transform duration-150',
          sizeClasses[size],
          className
        )}
      >
        <div className="w-3/4 h-3/4 rounded border border-amber-600 bg-amber-700/50 flex items-center justify-center">
          <span className="text-amber-400 text-xs font-bold">OK</span>
        </div>
      </div>
    );
  }

  // Joker tile
  if (tile.isJoker) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'rounded-lg border-2 cursor-pointer',
          'flex flex-col items-center justify-center shadow-md',
          'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400',
          'hover:shadow-lg hover:scale-105 active:scale-95',
          'transition-all duration-150',
          isSelected && 'ring-2 ring-blue-500 ring-offset-2 -translate-y-2',
          isOkeyTile && 'ring-2 ring-green-500',
          sizeClasses[size],
          className
        )}
        draggable={draggable}
      >
        <span className="text-2xl">★</span>
        <span className="text-[8px] text-amber-700 font-bold">OKEY</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 cursor-pointer',
        'flex flex-col items-center justify-center shadow-md',
        'hover:shadow-lg hover:scale-105 active:scale-95',
        'transition-all duration-150',
        colors.bg,
        colors.border,
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 -translate-y-2',
        isOkeyTile && 'ring-2 ring-green-500 ring-offset-1',
        sizeClasses[size],
        className
      )}
      draggable={draggable}
    >
      <span className={cn('font-bold', colors.text)}>
        {tile.number}
      </span>
      {isOkeyTile && (
        <span className="text-[8px] text-green-600 font-bold">OKEY</span>
      )}
    </div>
  );
}

// Empty tile slot (for rack display)
export function TileSlot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-10 h-14 rounded-lg border-2 border-dashed border-gray-300',
        'bg-gray-100/50',
        className
      )}
    />
  );
}

// Tile stack (for draw pile display)
export function TileStack({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Stack effect */}
      <div className="absolute -top-1 -left-1 w-10 h-14 rounded-lg bg-amber-900 border-2 border-amber-700" />
      <div className="absolute -top-0.5 -left-0.5 w-10 h-14 rounded-lg bg-amber-800 border-2 border-amber-700" />

      {/* Top tile */}
      <div className="relative w-10 h-14 rounded-lg bg-gradient-to-br from-amber-800 to-amber-900 border-2 border-amber-700 flex items-center justify-center shadow-lg">
        <div className="w-3/4 h-3/4 rounded border border-amber-600 bg-amber-700/50 flex items-center justify-center">
          <span className="text-amber-400 text-xs font-bold">OK</span>
        </div>
      </div>

      {/* Count badge */}
      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
        {count}
      </div>
    </div>
  );
}
