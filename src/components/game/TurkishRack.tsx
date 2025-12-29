'use client';

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TurkishTile, TileSlot } from './TurkishTile';
import type { Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH PLAYER RACK - Authentic Wooden Design
// Inspired by traditional okey racks with
// Ottoman decorative elements
// ============================================

interface PlayerRackProps {
  tiles: TileType[];
  rackLayout: (string | null)[];
  okeyTile?: TileType | null;
  selectedTileId?: string | null;
  onTileSelect?: (tile: TileType) => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  isCurrentPlayer?: boolean;
  canSelect?: boolean;
  canRearrange?: boolean;
  className?: string;
}

export const TurkishPlayerRack = memo(function TurkishPlayerRack({
  tiles,
  rackLayout,
  okeyTile,
  selectedTileId,
  onTileSelect,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  isCurrentPlayer = false,
  canSelect = true,
  canRearrange = true,
  className,
}: PlayerRackProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Create tile lookup map
  const tileMap = tiles.reduce((acc, tile) => {
    acc[tile.id] = tile;
    return acc;
  }, {} as Record<string, TileType>);

  // Drag handlers
  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    if (!canRearrange) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, [canRearrange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex && onTileMove) {
      onTileMove(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onTileMove]);

  // Render a single slot
  const renderSlot = (index: number) => {
    const tileId = rackLayout[index];
    const tile = tileId ? tileMap[tileId] : null;
    const isDragging = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    if (tile) {
      return (
        <motion.div
          key={index}
          className={cn(
            'relative transition-transform',
            isDragging && 'opacity-50 scale-95',
            isDragOver && 'scale-110'
          )}
          layout
        >
          <TurkishTile
            tile={tile}
            okeyTile={okeyTile}
            isSelected={selectedTileId === tile.id}
            size="lg"
            onClick={canSelect ? () => onTileSelect?.(tile) : undefined}
            draggable={canRearrange}
            onDragStart={handleDragStart(index)}
            onDragEnd={handleDragEnd}
          />
        </motion.div>
      );
    }

    return (
      <TileSlot
        key={index}
        size="lg"
        isHighlighted={isDragOver}
        onDrop={handleDrop(index)}
        onDragOver={handleDragOver(index)}
        onDragLeave={handleDragLeave}
      />
    );
  };

  // Split into two rows
  const topRow = Array.from({ length: 15 }, (_, i) => i);
  const bottomRow = Array.from({ length: 15 }, (_, i) => i + 15);

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Left sort button - Groups (Per) */}
      <motion.button
        onClick={onSortByGroups}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-20 rounded-xl',
          'bg-gradient-to-b from-amber-700 to-amber-900',
          'border-2 border-amber-600',
          'text-amber-200 hover:text-white',
          'shadow-lg hover:shadow-xl',
          'transition-all'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Renklere göre sırala (Per)"
      >
        <div className="flex gap-0.5 mb-1">
          <div className="w-2 h-3 bg-red-500 rounded-sm" />
          <div className="w-2 h-3 bg-blue-500 rounded-sm" />
          <div className="w-2 h-3 bg-amber-500 rounded-sm" />
        </div>
        <span className="text-[10px] font-bold">PER</span>
      </motion.button>

      {/* Main rack - Wooden design */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden',
          'bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900',
          'border-4 border-amber-600',
          'shadow-2xl',
          isCurrentPlayer && 'ring-4 ring-green-500/50 active-turn-pulse'
        )}
      >
        {/* Decorative top edge */}
        <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Ottoman pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none ottoman-pattern" />

        {/* Rack content */}
        <div className="p-3 space-y-2">
          {/* Top row - 15 slots */}
          <div className="flex gap-1 justify-center">
            {topRow.map(renderSlot)}
          </div>

          {/* Divider with decorative element */}
          <div className="relative h-1 bg-amber-900/50 rounded-full mx-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-3 bg-amber-600 rounded-full border border-amber-500" />
            </div>
          </div>

          {/* Bottom row - 15 slots */}
          <div className="flex gap-1 justify-center">
            {bottomRow.map(renderSlot)}
          </div>
        </div>

        {/* Decorative bottom edge */}
        <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Wood grain texture overlay */}
        <div className="absolute inset-0 pointer-events-none wood-texture" />
      </div>

      {/* Right sort button - Runs (Seri) */}
      <motion.button
        onClick={onSortByRuns}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-20 rounded-xl',
          'bg-gradient-to-b from-amber-700 to-amber-900',
          'border-2 border-amber-600',
          'text-amber-200 hover:text-white',
          'shadow-lg hover:shadow-xl',
          'transition-all'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Sayılara göre sırala (Seri)"
      >
        <div className="flex gap-0.5 mb-1">
          <div className="w-2 h-3 bg-red-500 rounded-sm text-[6px] text-white font-bold flex items-center justify-center">1</div>
          <div className="w-2 h-3 bg-red-500 rounded-sm text-[6px] text-white font-bold flex items-center justify-center">2</div>
          <div className="w-2 h-3 bg-red-500 rounded-sm text-[6px] text-white font-bold flex items-center justify-center">3</div>
        </div>
        <span className="text-[10px] font-bold">SERİ</span>
      </motion.button>
    </div>
  );
});

// ============================================
// OPPONENT RACK - Compact uniform view for all positions
// Same size for left, top, right - mobile responsive
// ============================================

interface OpponentRackProps {
  tileCount: number;
  playerName: string;
  playerAvatar?: string;
  isCurrentTurn?: boolean;
  isAI?: boolean;
  position: 'left' | 'top' | 'right';
  thinkingText?: string;
  score?: number;
  className?: string;
}

export const TurkishOpponentRack = memo(function TurkishOpponentRack({
  tileCount,
  playerName,
  playerAvatar,
  isCurrentTurn = false,
  isAI = false,
  position,
  thinkingText,
  className,
}: OpponentRackProps) {
  const isVertical = position === 'left' || position === 'right';
  // Uniform tile count for all positions - show max 8 on mobile, 10 on larger screens
  const maxVisibleTiles = 8;
  const visibleTiles = Math.min(tileCount, maxVisibleTiles);
  const extraTiles = tileCount - visibleTiles;

  return (
    <div
      className={cn(
        'flex items-center gap-1 sm:gap-2',
        isVertical ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {/* Player info card - compact and uniform */}
      <div
        className={cn(
          'flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg',
          'bg-gray-800/90 border border-gray-700',
          isCurrentTurn && 'ring-1 sm:ring-2 ring-green-400 border-green-500',
          isVertical && 'flex-col'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-blue-400 to-blue-600',
            'text-white font-bold text-[8px] sm:text-[10px] md:text-xs'
          )}
        >
          {isAI ? '🤖' : playerAvatar ? (
            <img src={playerAvatar} alt={playerName} className="w-full h-full rounded-full object-cover" />
          ) : (
            playerName?.[0]?.toUpperCase() || '?'
          )}
        </div>

        {/* Name and status */}
        <div className="text-center">
          <div className="text-white font-bold text-[8px] sm:text-[10px] md:text-xs truncate max-w-[40px] sm:max-w-[60px] md:max-w-[80px]">
            {playerName}
          </div>
          <div className={cn(
            'text-[7px] sm:text-[8px] md:text-[10px] font-bold',
            isCurrentTurn ? 'text-green-400' : 'text-gray-400'
          )}>
            {thinkingText || `${tileCount} taş`}
          </div>
        </div>
      </div>

      {/* Mini tile rack - uniform size for all positions */}
      <div
        className={cn(
          'flex gap-px p-0.5 sm:p-1 rounded',
          'bg-amber-700/80 border border-amber-600',
          isVertical && 'flex-wrap justify-center max-w-[40px] sm:max-w-[50px] md:max-w-[60px]'
        )}
      >
        {Array.from({ length: visibleTiles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm',
              'bg-gradient-to-b from-sky-500 to-sky-600',
              'border border-sky-400/50',
              // Uniform size for all positions - just smaller on mobile
              'w-2 h-2.5 sm:w-2.5 sm:h-3 md:w-3 md:h-4'
            )}
          />
        ))}
        {extraTiles > 0 && (
          <div
            className={cn(
              'flex items-center justify-center rounded-sm',
              'bg-amber-600/50 text-amber-200 text-[6px] sm:text-[7px] md:text-[8px] font-bold',
              'w-2 h-2.5 sm:w-2.5 sm:h-3 md:w-3 md:h-4'
            )}
          >
            +{extraTiles}
          </div>
        )}
      </div>
    </div>
  );
});

export default TurkishPlayerRack;
