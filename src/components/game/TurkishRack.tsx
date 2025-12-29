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
// OPPONENT RACK - Compact view for other players
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
  score = 0,
  className,
}: OpponentRackProps) {
  const isVertical = position === 'left' || position === 'right';
  const maxVisibleTiles = isVertical ? 7 : 10;
  const visibleTiles = Math.min(tileCount, maxVisibleTiles);
  const extraTiles = tileCount - visibleTiles;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3',
        isVertical ? 'flex-col' : 'flex-row',
        position === 'right' && 'flex-col-reverse',
        className
      )}
      animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {/* Player info card */}
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-xl',
          'bg-gradient-to-b from-amber-900/90 to-amber-950/90',
          'border border-amber-700/50',
          'backdrop-blur-sm shadow-lg',
          isCurrentTurn && 'ring-2 ring-green-500 active-turn-pulse'
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'bg-gradient-to-br from-amber-600 to-amber-800',
              'border-2 border-amber-500',
              'text-white font-bold text-sm'
            )}
          >
            {isAI ? '🤖' : playerAvatar ? (
              <img src={playerAvatar} alt={playerName} className="w-full h-full rounded-full object-cover" />
            ) : (
              playerName?.[0]?.toUpperCase() || '?'
            )}
          </div>
          {/* Online indicator */}
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-amber-900',
              isCurrentTurn ? 'bg-green-500' : 'bg-amber-500'
            )}
          />
        </div>

        {/* Name and status */}
        <div className="flex flex-col min-w-0">
          <span className="text-amber-200 font-medium text-sm truncate max-w-[80px]">
            {playerName}
          </span>
          <AnimatePresence mode="wait">
            {thinkingText ? (
              <motion.span
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-400 text-xs flex items-center gap-1"
              >
                <span className="animate-pulse">●</span>
                {thinkingText}
              </motion.span>
            ) : (
              <motion.span
                key="tiles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-amber-400/70 text-xs"
              >
                {tileCount} taş
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mini tile rack */}
      <div
        className={cn(
          'flex gap-0.5 p-2 rounded-lg',
          'bg-gradient-to-b from-amber-800/50 to-amber-900/50',
          'border border-amber-700/30',
          isVertical ? 'flex-col' : 'flex-row'
        )}
      >
        {Array.from({ length: visibleTiles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm',
              'bg-gradient-to-b from-amber-700 to-amber-800',
              'border border-amber-600/50',
              isVertical ? 'w-5 h-6' : 'w-4 h-5'
            )}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-amber-500/30 rotate-45" />
            </div>
          </div>
        ))}
        {extraTiles > 0 && (
          <div
            className={cn(
              'flex items-center justify-center rounded-sm',
              'bg-amber-600/30 text-amber-300 text-[10px] font-bold',
              isVertical ? 'w-5 h-6' : 'w-4 h-5'
            )}
          >
            +{extraTiles}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default TurkishPlayerRack;
