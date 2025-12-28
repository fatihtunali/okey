'use client';

import { Tile as TileType } from '@/lib/game/types';
import { isOkey } from '@/lib/game/tiles';
import { cn } from '@/lib/utils';

interface TileProps {
  tile: TileType;
  okeyTile?: TileType | null;
  isSelected?: boolean;
  isFaceDown?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  draggable?: boolean;
  className?: string;
}

// Realistic tile colors matching traditional okey tiles
const colorStyles: Record<string, { text: string; glow: string }> = {
  red: {
    text: 'text-red-600',
    glow: 'shadow-red-200',
  },
  yellow: {
    text: 'text-amber-500',
    glow: 'shadow-amber-200',
  },
  blue: {
    text: 'text-blue-600',
    glow: 'shadow-blue-200',
  },
  black: {
    text: 'text-gray-800',
    glow: 'shadow-gray-200',
  },
};

const sizeClasses = {
  sm: {
    container: 'w-10 h-14',
    text: 'text-xl',
    subtext: 'text-[8px]',
  },
  md: {
    container: 'w-12 h-16',
    text: 'text-2xl',
    subtext: 'text-[9px]',
  },
  lg: {
    container: 'w-14 h-20',
    text: 'text-3xl',
    subtext: 'text-[10px]',
  },
  xl: {
    container: 'w-16 h-24',
    text: 'text-4xl',
    subtext: 'text-xs',
  },
};

export function Tile({
  tile,
  okeyTile,
  isSelected = false,
  isFaceDown = false,
  size = 'lg',
  onClick,
  draggable = false,
  className,
}: TileProps) {
  const isOkeyTile = okeyTile && isOkey(tile, okeyTile);
  const colors = colorStyles[tile.color] || colorStyles.black;
  const sizes = sizeClasses[size];

  // Face down tile - realistic wooden back
  if (isFaceDown || tile.isFaceDown) {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-amber-800/50',
          'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900',
          'flex items-center justify-center',
          'shadow-lg shadow-black/30',
          'transition-all duration-200',
          sizes.container,
          className
        )}
      >
        {/* Decorative pattern on back */}
        <div className="w-4/5 h-4/5 rounded-lg border border-amber-600/30 bg-gradient-to-br from-amber-600/20 to-transparent flex items-center justify-center">
          <div className="w-2/3 h-2/3 rounded border border-amber-500/20 flex items-center justify-center">
            <span className="text-amber-500/50 font-bold text-xs">◆</span>
          </div>
        </div>
      </div>
    );
  }

  // Joker tile - golden special tile
  if (tile.isJoker) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'rounded-xl cursor-pointer',
          'bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100',
          'border-2 border-amber-300',
          'flex flex-col items-center justify-center gap-0.5',
          'shadow-lg shadow-amber-200/50',
          'hover:shadow-xl hover:-translate-y-1 hover:scale-105',
          'active:translate-y-0 active:scale-100',
          'transition-all duration-150',
          isSelected && 'ring-4 ring-blue-400 -translate-y-3 scale-105',
          isOkeyTile && 'ring-4 ring-green-400',
          sizes.container,
          className
        )}
        draggable={draggable}
      >
        <span className="text-amber-600 drop-shadow-sm" style={{ fontSize: 'inherit' }}>
          <span className={sizes.text}>★</span>
        </span>
        <span className={cn('text-amber-700 font-bold tracking-tight', sizes.subtext)}>OKEY</span>
      </div>
    );
  }

  // Regular tile - realistic cream-colored with colored number
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl cursor-pointer',
        // Realistic tile texture
        'bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100',
        'border-2 border-stone-200',
        // 3D effect
        'shadow-lg shadow-black/20',
        'flex flex-col items-center justify-center',
        // Hover effects
        'hover:shadow-xl hover:-translate-y-1.5 hover:scale-105',
        'active:translate-y-0 active:scale-100',
        'transition-all duration-150',
        // Selection states
        isSelected && 'ring-4 ring-blue-400 -translate-y-4 scale-110 z-10',
        isOkeyTile && 'ring-4 ring-green-400 animate-pulse',
        sizes.container,
        className
      )}
      draggable={draggable}
    >
      {/* Number */}
      <span className={cn('font-black drop-shadow-sm', colors.text, sizes.text)}>
        {tile.number}
      </span>

      {/* Okey indicator */}
      {isOkeyTile && (
        <span className={cn('font-bold text-green-600 tracking-tight', sizes.subtext)}>OKEY</span>
      )}
    </div>
  );
}

// Empty tile slot for rack
export function TileSlot({ size = 'lg', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed border-amber-600/30',
        'bg-amber-900/20',
        sizes.container,
        className
      )}
    />
  );
}

// Tile stack for draw pile - realistic stack with depth
export function TileStack({
  count,
  size = 'lg',
  onClick,
  canClick = false,
  className
}: {
  count: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  canClick?: boolean;
  className?: string;
}) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'relative',
        canClick && 'cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      onClick={canClick ? onClick : undefined}
    >
      {/* Stack layers for depth effect */}
      <div className={cn(
        'absolute top-2 left-1 rounded-xl bg-amber-950 border border-amber-900',
        sizes.container
      )} />
      <div className={cn(
        'absolute top-1.5 left-0.5 rounded-xl bg-amber-900 border border-amber-800',
        sizes.container
      )} />
      <div className={cn(
        'absolute top-1 left-0 rounded-xl bg-amber-800 border border-amber-700',
        sizes.container
      )} />

      {/* Top tile */}
      <div className={cn(
        'relative rounded-xl',
        'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900',
        'border-2 border-amber-700',
        'flex items-center justify-center',
        'shadow-xl shadow-black/40',
        sizes.container
      )}>
        {/* Decorative center pattern */}
        <div className="w-4/5 h-4/5 rounded-lg border border-amber-600/30 bg-gradient-to-br from-amber-600/20 to-transparent flex items-center justify-center">
          <div className="w-2/3 h-2/3 rounded border border-amber-500/20 flex items-center justify-center">
            <span className="text-amber-500/60 font-bold">◆</span>
          </div>
        </div>
      </div>

      {/* Count badge */}
      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center shadow-lg border-2 border-red-500">
        {count}
      </div>
    </div>
  );
}

// Indicator tile display - special showcase for the okey indicator
export function IndicatorTile({
  tile,
  okeyTile,
  className
}: {
  tile: TileType;
  okeyTile: TileType;
  className?: string;
}) {
  const colors = colorStyles[tile.color] || colorStyles.black;

  return (
    <div className={cn('relative', className)}>
      {/* Elevated platform */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-amber-900 rounded-full shadow-lg" />

      {/* Tile */}
      <div className={cn(
        'relative w-14 h-20 rounded-xl',
        'bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100',
        'border-2 border-stone-300',
        'shadow-xl shadow-black/30',
        'flex flex-col items-center justify-center',
        'ring-2 ring-amber-400/50'
      )}>
        <span className={cn('font-black text-3xl drop-shadow-sm', colors.text)}>
          {tile.number}
        </span>
      </div>

      {/* Label */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
        Gösterge
      </div>

      {/* Okey indicator text */}
      <div className="text-center mt-3">
        <span className="text-white/80 text-xs">
          Okey: <span className={cn('font-bold', colorStyles[okeyTile.color]?.text || 'text-white')}>
            {okeyTile.number}
          </span>
        </span>
      </div>
    </div>
  );
}

// Discarded tile in the center
export function DiscardedTile({
  tile,
  okeyTile,
  onClick,
  canClick = false,
  className,
}: {
  tile: TileType;
  okeyTile?: TileType | null;
  onClick?: () => void;
  canClick?: boolean;
  className?: string;
}) {
  const isOkeyTile = okeyTile && isOkey(tile, okeyTile);
  const colors = colorStyles[tile.color] || colorStyles.black;

  return (
    <div
      onClick={canClick ? onClick : undefined}
      className={cn(
        'w-14 h-20 rounded-xl',
        'bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100',
        'border-2 border-stone-200',
        'shadow-lg shadow-black/20',
        'flex flex-col items-center justify-center',
        canClick && 'cursor-pointer hover:scale-105 hover:-translate-y-1 transition-all',
        isOkeyTile && 'ring-2 ring-green-400',
        className
      )}
    >
      {tile.isJoker ? (
        <>
          <span className="text-amber-600 text-3xl">★</span>
          <span className="text-amber-700 font-bold text-[9px]">OKEY</span>
        </>
      ) : (
        <>
          <span className={cn('font-black text-3xl drop-shadow-sm', colors.text)}>
            {tile.number}
          </span>
          {isOkeyTile && (
            <span className="font-bold text-green-600 text-[9px]">OKEY</span>
          )}
        </>
      )}
    </div>
  );
}
