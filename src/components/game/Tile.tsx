'use client';

import { Tile as TileType } from '@/lib/game/types';
import { isOkey } from '@/lib/game/tiles';
import { cn } from '@/lib/utils';

interface TileProps {
  tile: TileType;
  okeyTile?: TileType | null;
  isSelected?: boolean;
  isFaceDown?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  onDoubleClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
}

// Clean tile colors matching Zynga 101 Okey Plus style
const colorStyles: Record<string, { text: string; dot: string }> = {
  red: {
    text: 'text-red-600',
    dot: 'bg-red-400',
  },
  yellow: {
    text: 'text-amber-500',
    dot: 'bg-amber-400',
  },
  blue: {
    text: 'text-blue-600',
    dot: 'bg-blue-400',
  },
  black: {
    text: 'text-gray-800',
    dot: 'bg-gray-500',
  },
};

const sizeClasses = {
  xs: {
    container: 'w-8 h-11',
    text: 'text-lg font-black',
    dots: 'gap-0.5',
    dot: 'w-1 h-1',
  },
  sm: {
    container: 'w-10 h-14',
    text: 'text-xl font-black',
    dots: 'gap-0.5',
    dot: 'w-1 h-1',
  },
  md: {
    container: 'w-12 h-16',
    text: 'text-2xl font-black',
    dots: 'gap-1',
    dot: 'w-1.5 h-1.5',
  },
  lg: {
    container: 'w-14 h-[72px]',
    text: 'text-3xl font-black',
    dots: 'gap-1',
    dot: 'w-1.5 h-1.5',
  },
  xl: {
    container: 'w-16 h-20',
    text: 'text-4xl font-black',
    dots: 'gap-1',
    dot: 'w-2 h-2',
  },
};

export function Tile({
  tile,
  okeyTile,
  isSelected = false,
  isFaceDown = false,
  size = 'lg',
  onClick,
  onDoubleClick,
  draggable = false,
  onDragStart,
  onDragEnd,
  className,
}: TileProps) {
  const isOkeyTile = okeyTile && isOkey(tile, okeyTile);
  const colors = colorStyles[tile.color] || colorStyles.black;
  const sizes = sizeClasses[size];

  // Face down tile - clean back design
  if (isFaceDown || tile.isFaceDown) {
    return (
      <div
        className={cn(
          'rounded-lg',
          'bg-gradient-to-b from-sky-600 to-sky-700',
          'border-2 border-sky-500',
          'flex items-center justify-center',
          'shadow-lg',
          sizes.container,
          className
        )}
      >
        <div className="w-2/3 h-2/3 rounded-md border-2 border-sky-400/50 bg-sky-500/30 flex items-center justify-center">
          <span className="text-sky-300/70 font-black text-lg">◆</span>
        </div>
      </div>
    );
  }

  // Joker tile (false joker / sahte okey)
  if (tile.isJoker) {
    return (
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          'rounded-lg cursor-pointer select-none',
          'bg-white',
          'border-2 border-gray-200',
          'flex flex-col items-center justify-center gap-1',
          'shadow-lg hover:shadow-xl',
          'hover:-translate-y-1 active:translate-y-0',
          'transition-all duration-150',
          isSelected && 'ring-3 ring-blue-500 -translate-y-3 scale-110 z-10 shadow-blue-200',
          isOkeyTile && 'ring-3 ring-green-500 shadow-green-200',
          sizes.container,
          className
        )}
      >
        <span className={cn('text-red-500', sizes.text)}>☆</span>
        {/* Decorative dots */}
        <div className={cn('flex', sizes.dots)}>
          <div className={cn('rounded-full bg-red-400', sizes.dot)} />
          <div className={cn('rounded-full bg-red-400', sizes.dot)} />
        </div>
      </div>
    );
  }

  // Regular tile - clean Zynga style
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-lg cursor-pointer select-none',
        'bg-white',
        'border-2 border-gray-200',
        'flex flex-col items-center justify-center gap-1',
        'shadow-lg hover:shadow-xl',
        'hover:-translate-y-1 active:translate-y-0',
        'transition-all duration-150',
        isSelected && 'ring-3 ring-blue-500 -translate-y-3 scale-110 z-10 shadow-blue-200',
        isOkeyTile && 'ring-3 ring-green-500 shadow-green-200',
        sizes.container,
        className
      )}
    >
      <span className={cn(colors.text, sizes.text)}>
        {tile.number}
      </span>
      {/* Decorative dots below number */}
      <div className={cn('flex', sizes.dots)}>
        <div className={cn('rounded-full', colors.dot, sizes.dot)} />
        <div className={cn('rounded-full', colors.dot, sizes.dot)} />
      </div>
    </div>
  );
}

// Empty slot for rack
export function TileSlot({
  size = 'lg',
  onDrop,
  onDragOver,
  isHighlighted = false,
  className
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  isHighlighted?: boolean;
  className?: string;
}) {
  const sizes = sizeClasses[size];

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={cn(
        'rounded-lg border-2 border-dashed',
        isHighlighted ? 'border-blue-400 bg-blue-100/30' : 'border-gray-400/30 bg-gray-500/10',
        sizes.container,
        className
      )}
    />
  );
}

// Tile Stack - clean design matching Zynga style
interface TileStackProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  canClick?: boolean;
  className?: string;
}

export function TileStack({
  count,
  size = 'lg',
  onClick,
  canClick = false,
  className,
}: TileStackProps) {
  const stackSizes = {
    sm: { w: 'w-10', h: 'h-14', offset: 2 },
    md: { w: 'w-12', h: 'h-16', offset: 2.5 },
    lg: { w: 'w-14', h: 'h-[72px]', offset: 3 },
  };

  const s = stackSizes[size];
  const visibleLayers = Math.min(5, Math.ceil(count / 20));

  return (
    <div
      className={cn(
        'relative flex flex-col items-center',
        canClick && 'cursor-pointer group',
        className
      )}
      onClick={canClick ? onClick : undefined}
    >
      {/* Stacked tiles visual */}
      <div className="relative" style={{ marginBottom: visibleLayers * 3 }}>
        {Array.from({ length: visibleLayers }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute rounded-lg',
              'bg-gradient-to-b from-sky-500 to-sky-600',
              'border-2 border-sky-400',
              'shadow-md',
              s.w, s.h,
              canClick && i === visibleLayers - 1 && 'group-hover:-translate-y-1 group-hover:shadow-xl transition-all'
            )}
            style={{
              top: -i * s.offset,
              left: i * 1,
              zIndex: i,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2/3 h-2/3 rounded-md border-2 border-sky-300/50 bg-sky-400/30 flex items-center justify-center">
                <span className="text-sky-200/70 font-black">◆</span>
              </div>
            </div>
          </div>
        ))}
        {/* Top interactive tile */}
        <div
          className={cn(
            'relative rounded-lg',
            'bg-gradient-to-b from-sky-500 to-sky-600',
            'border-2 border-sky-400',
            'shadow-lg',
            s.w, s.h,
            canClick && 'group-hover:-translate-y-2 group-hover:shadow-xl transition-all'
          )}
          style={{ zIndex: visibleLayers }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2/3 h-2/3 rounded-md border-2 border-sky-300/50 bg-sky-400/30 flex items-center justify-center">
              <span className="text-sky-200 font-black text-xl">◆</span>
            </div>
          </div>
        </div>
      </div>

      {/* Count badge */}
      <div className="mt-2 bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
        {count}
      </div>
    </div>
  );
}

// Indicator tile on stand - shows which tile is the okey
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
  const okeyColors = colorStyles[okeyTile.color] || colorStyles.black;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Indicator label */}
      <div className="bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-t-lg">
        GÖSTERGE
      </div>

      {/* The indicator tile on a stand */}
      <div className="relative">
        {/* Stand */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-amber-700 rounded-b-lg shadow-md" />

        {/* Tile holder */}
        <div className="bg-amber-600 px-2 pt-2 pb-3 rounded-b-lg">
          {/* The tile */}
          <div className={cn(
            'w-14 h-[72px] rounded-lg',
            'bg-white',
            'border-2 border-gray-200',
            'flex flex-col items-center justify-center gap-1',
            'shadow-lg',
            'ring-2 ring-amber-400'
          )}>
            <span className={cn('text-3xl font-black', colors.text)}>
              {tile.number}
            </span>
            <div className="flex gap-1">
              <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
              <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            </div>
          </div>
        </div>
      </div>

      {/* Okey info badge */}
      <div className="mt-3 flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-full shadow">
        <span className="text-xs font-medium">Okey:</span>
        <span className={cn('font-black', okeyColors.text, 'text-white bg-white/20 px-2 py-0.5 rounded')}>
          {okeyTile.color === tile.color ? okeyTile.number : `${okeyTile.number}`}
        </span>
        <span className={cn('w-3 h-3 rounded-full', okeyColors.dot)} />
      </div>
    </div>
  );
}

// Discarded tile (clickable to draw)
export function DiscardedTile({
  tile,
  okeyTile,
  onClick,
  canClick = false,
  className,
}: {
  tile?: TileType | null;
  okeyTile?: TileType | null;
  onClick?: () => void;
  canClick?: boolean;
  className?: string;
}) {
  if (!tile) {
    return (
      <div className={cn(
        'w-14 h-[72px] rounded-lg border-2 border-dashed border-gray-400/30',
        'flex items-center justify-center',
        'bg-gray-500/10',
        className
      )}>
        <span className="text-gray-400 text-xs font-medium">Boş</span>
      </div>
    );
  }

  const isOkeyTile = okeyTile && isOkey(tile, okeyTile);
  const colors = colorStyles[tile.color] || colorStyles.black;

  return (
    <div
      onClick={canClick ? onClick : undefined}
      className={cn(
        'w-14 h-[72px] rounded-lg',
        'bg-white',
        'border-2 border-gray-200',
        'flex flex-col items-center justify-center gap-1',
        'shadow-lg',
        canClick && 'cursor-pointer hover:scale-110 hover:-translate-y-2 hover:shadow-xl transition-all',
        isOkeyTile && 'ring-3 ring-green-500 shadow-green-200',
        className
      )}
    >
      {tile.isJoker ? (
        <>
          <span className="text-red-500 text-3xl font-black">☆</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          </div>
        </>
      ) : (
        <>
          <span className={cn('font-black text-3xl', colors.text)}>
            {tile.number}
          </span>
          <div className="flex gap-1">
            <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
          </div>
        </>
      )}
    </div>
  );
}

// Discard pile showing recent discards
export function DiscardPile({
  tiles,
  okeyTile,
  onClickTop,
  canClickTop = false,
  className,
}: {
  tiles: TileType[];
  okeyTile?: TileType | null;
  onClickTop?: () => void;
  canClickTop?: boolean;
  className?: string;
}) {
  const topTile = tiles[tiles.length - 1];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Label */}
      <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-t-lg">
        ATILAN
      </div>

      {/* Discard area */}
      <div className="bg-red-600/20 border-2 border-red-500/30 rounded-b-lg p-3">
        <DiscardedTile
          tile={topTile}
          okeyTile={okeyTile}
          onClick={onClickTop}
          canClick={canClickTop}
        />
      </div>

      {/* Count badge */}
      <div className="mt-2 bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
        {tiles.length}
      </div>
    </div>
  );
}
