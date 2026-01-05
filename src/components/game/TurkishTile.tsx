'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH OKEY TILE - Authentic Design
// Inspired by traditional bone/ivory tiles
// with Ottoman decorative elements
// ============================================

interface TileProps {
  tile: TileType;
  okeyTile?: TileType | null;
  isSelected?: boolean;
  isFaceDown?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
  onDoubleClick?: () => void;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
  className?: string;
}

// Size configurations - larger for better visibility
// Mobile-first: use vw units for mobile scaling
const sizes = {
  xs: { w: 'w-8', h: 'h-11', text: 'text-base', dot: 'w-1 h-1' },
  sm: { w: 'w-10', h: 'h-14', text: 'text-lg', dot: 'w-1.5 h-1.5' },
  md: { w: 'w-12', h: 'h-16', text: 'text-xl', dot: 'w-1.5 h-1.5' },
  lg: { w: 'w-14', h: 'h-[72px]', text: 'text-2xl', dot: 'w-2 h-2' },
  xl: { w: 'w-[11vw] sm:w-16', h: 'h-[14vw] sm:h-20', text: 'text-2xl sm:text-3xl', dot: 'w-2 h-2' },
  '2xl': { w: 'w-[12vw] sm:w-20', h: 'h-[15vw] sm:h-24', text: 'text-3xl sm:text-4xl', dot: 'w-2.5 h-2.5' },
};

// Turkish color palette - high contrast for readability
const colors = {
  red: {
    text: 'text-red-700',
    bg: 'bg-red-600',
    border: 'border-red-800',
    glow: 'shadow-red-500/30',
    name: 'Kırmızı',
  },
  yellow: {
    text: 'text-amber-600',
    bg: 'bg-amber-500',
    border: 'border-amber-700',
    glow: 'shadow-amber-500/30',
    name: 'Sarı',
  },
  blue: {
    text: 'text-blue-700',
    bg: 'bg-blue-600',
    border: 'border-blue-800',
    glow: 'shadow-blue-500/30',
    name: 'Mavi',
  },
  black: {
    text: 'text-stone-800',
    bg: 'bg-stone-700',
    border: 'border-stone-900',
    glow: 'shadow-stone-500/30',
    name: 'Siyah',
  },
};

function isOkeyTile(tile: TileType, okeyTile?: TileType | null): boolean {
  if (!okeyTile) return false;
  return tile.number === okeyTile.number && tile.color === okeyTile.color;
}

export const TurkishTile = memo(function TurkishTile({
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
  const sizeConfig = sizes[size];
  const colorConfig = colors[tile.color];
  const isOkey = isOkeyTile(tile, okeyTile);
  const isJoker = tile.isJoker;

  // Face down tile - Ottoman pattern back
  if (isFaceDown) {
    return (
      <motion.div
        className={cn(
          sizeConfig.w,
          sizeConfig.h,
          'rounded-lg relative overflow-hidden',
          'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950',
          'border-2 border-amber-700',
          'shadow-lg',
          className
        )}
        whileHover={{ scale: 1.02 }}
      >
        {/* Ottoman pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 40 40">
            <pattern id="ottoman" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="8" fill="none" stroke="#C9A227" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="4" fill="none" stroke="#C9A227" strokeWidth="0.5" />
              <path d="M10 2 L10 18 M2 10 L18 10" stroke="#C9A227" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#ottoman)" />
          </svg>
        </div>
        {/* Center diamond */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-amber-600 rotate-45 border border-amber-400" />
        </div>
      </motion.div>
    );
  }

  // Joker (Sahte Okey) - Special design
  if (isJoker) {
    return (
      <motion.div
        className={cn(
          sizeConfig.w,
          sizeConfig.h,
          'rounded-lg relative overflow-hidden cursor-pointer',
          'bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100',
          'border-2 border-amber-500',
          'shadow-lg',
          isSelected && 'ring-4 ring-yellow-400 shadow-xl -translate-y-2',
          className
        )}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        draggable={draggable}
        {...(onDragStart && { onDragStart: onDragStart as never })}
        {...(onDragEnd && { onDragEnd: onDragEnd as never })}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Joker star pattern */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-red-600 text-2xl">★</span>
          <span className="text-xs font-bold text-amber-700 mt-0.5">OKEY</span>
        </div>
        {/* Corner dots */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </motion.div>
    );
  }

  // Regular tile
  return (
    <motion.div
      className={cn(
        sizeConfig.w,
        sizeConfig.h,
        'rounded-lg relative cursor-pointer select-none',
        'transition-all duration-200',
        // Ivory/bone tile appearance
        'bg-gradient-to-b from-amber-50 via-white to-amber-50',
        'border-2 border-amber-200',
        // Shadow and depth
        'shadow-md hover:shadow-lg',
        // Okey tile special styling
        isOkey && 'ring-2 ring-yellow-400 tile-okey-glow',
        // Selected state
        isSelected && 'tile-selected z-10',
        className
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      {...(onDragStart && { onDragStart: onDragStart as never })}
      {...(onDragEnd && { onDragEnd: onDragEnd as never })}
      whileHover={!isSelected ? { y: -4, scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Top left color indicator */}
      <div
        className={cn(
          'absolute top-1 left-1 rounded-full',
          sizeConfig.dot,
          colorConfig.bg
        )}
      />

      {/* Main number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'font-black',
            sizeConfig.text,
            colorConfig.text,
            // Add text shadow for depth
            'drop-shadow-sm'
          )}
        >
          {tile.number}
        </span>
      </div>

      {/* Bottom right color indicator */}
      <div
        className={cn(
          'absolute bottom-1 right-1 rounded-full',
          sizeConfig.dot,
          colorConfig.bg
        )}
      />

      {/* Okey indicator badge */}
      {isOkey && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 text-[8px] font-bold px-1 rounded shadow">
          OK
        </div>
      )}

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-lg pointer-events-none" />
    </motion.div>
  );
});

// ============================================
// TILE SLOT - Drop zone for rack arrangement
// ============================================

interface TileSlotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  isHighlighted?: boolean;
  isEmpty?: boolean;
  className?: string;
}

export const TileSlot = memo(function TileSlot({
  size = 'lg',
  onDrop,
  onDragOver,
  onDragLeave,
  isHighlighted = false,
  isEmpty = true,
  className,
}: TileSlotProps) {
  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        sizeConfig.w,
        sizeConfig.h,
        'rounded-lg transition-all duration-200',
        isEmpty
          ? 'border-2 border-dashed border-amber-600/30 bg-amber-900/20'
          : 'bg-transparent',
        isHighlighted && 'border-amber-400 bg-amber-500/20 scale-105',
        className
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    />
  );
});

// ============================================
// TILE STACK - Draw pile with count
// ============================================

interface TileStackProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  canClick?: boolean;
  className?: string;
}

export const TileStack = memo(function TileStack({
  count,
  size = 'md',
  onClick,
  canClick = false,
  className,
}: TileStackProps) {
  const stackCount = Math.min(count, 6);
  const sizeConfig = sizes[size];

  return (
    <motion.div
      className={cn(
        'relative cursor-pointer',
        canClick && 'hover:scale-105',
        className
      )}
      onClick={canClick ? onClick : undefined}
      whileHover={canClick ? { y: -4 } : {}}
      whileTap={canClick ? { scale: 0.95 } : {}}
    >
      {/* Stacked tiles */}
      {Array.from({ length: stackCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            sizeConfig.w,
            sizeConfig.h,
            'absolute rounded-lg',
            'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900',
            'border border-amber-600',
            'shadow-md'
          )}
          style={{
            top: -i * 2,
            left: i * 1,
            zIndex: stackCount - i,
          }}
        >
          {/* Ottoman pattern on top card */}
          {i === stackCount - 1 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-amber-500/50 rotate-45 border border-amber-400/50" />
            </div>
          )}
        </div>
      ))}

      {/* Count badge */}
      <div
        className={cn(
          'absolute -bottom-3 left-1/2 -translate-x-1/2',
          'bg-amber-600 text-white text-xs font-bold',
          'px-2 py-0.5 rounded-full',
          'border border-amber-400',
          'shadow-lg'
        )}
      >
        {count}
      </div>

      {/* Draw hint */}
      {canClick && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="text-amber-300 text-xs font-medium bg-black/50 px-2 py-1 rounded">
            Taş Çek
          </span>
        </motion.div>
      )}
    </motion.div>
  );
});

// ============================================
// INDICATOR TILE - Gösterge display
// ============================================

interface IndicatorTileProps {
  tile: TileType;
  okeyTile: TileType;
  className?: string;
}

export const IndicatorTile = memo(function IndicatorTile({
  tile,
  okeyTile,
  className,
}: IndicatorTileProps) {
  const okeyColor = colors[okeyTile.color];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Gösterge label */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-t-lg border-t border-x border-amber-400">
        GÖSTERGE
      </div>

      {/* Stand with tile */}
      <div className="relative">
        {/* Wooden stand */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg border-x border-b border-amber-600" />

        {/* The indicator tile */}
        <TurkishTile tile={tile} size="md" />
      </div>

      {/* Okey info */}
      <div className="mt-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/30">
        <span className="text-amber-300 text-xs font-medium">Okey:</span>
        <div className={cn('flex items-center gap-1 font-bold text-sm', okeyColor.text.replace('text-', 'text-').replace('-700', '-400').replace('-800', '-400').replace('-600', '-400'))}>
          <span className={cn('w-3 h-3 rounded-full', okeyColor.bg)} />
          <span className="text-white">{okeyTile.number}</span>
        </div>
      </div>
    </div>
  );
});

// ============================================
// DISCARD PILE - Çöp with Turkish styling
// ============================================

interface DiscardPileProps {
  tiles: TileType[];
  okeyTile?: TileType | null;
  onClickTop?: () => void;
  canClickTop?: boolean;
  className?: string;
}

export const DiscardPile = memo(function DiscardPile({
  tiles,
  okeyTile,
  onClickTop,
  canClickTop = false,
  className,
}: DiscardPileProps) {
  const topTile = tiles[tiles.length - 1];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Label */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-t-lg border-t border-x border-red-500">
        ATILAN
      </div>

      {/* Discard area */}
      <motion.div
        className={cn(
          'w-20 h-24 rounded-lg relative',
          'bg-gradient-to-b from-red-900/50 to-red-950/50',
          'border-2 border-red-700/50',
          canClickTop && 'discard-ready cursor-pointer'
        )}
        onClick={canClickTop ? onClickTop : undefined}
        whileHover={canClickTop ? { scale: 1.02 } : {}}
      >
        {topTile ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <TurkishTile
              tile={topTile}
              okeyTile={okeyTile}
              size="md"
              onClick={canClickTop ? onClickTop : undefined}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-400/50 text-xs">Boş</span>
          </div>
        )}

        {/* Count badge */}
        {tiles.length > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-red-400">
            {tiles.length}
          </div>
        )}
      </motion.div>

      {/* Draw hint */}
      {canClickTop && topTile && (
        <motion.div
          className="mt-2"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="text-amber-300 text-xs font-medium bg-black/50 px-2 py-1 rounded">
            Al
          </span>
        </motion.div>
      )}
    </div>
  );
});

export default TurkishTile;
