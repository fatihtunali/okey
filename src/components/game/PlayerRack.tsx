'use client';

import { useState } from 'react';
import { Tile as TileType } from '@/lib/game/types';
import { Tile, TileSlot } from './Tile';
import { cn } from '@/lib/utils';

interface PlayerRackProps {
  tiles: TileType[];  // All tiles the player has
  rackLayout: (string | null)[];  // 30 slots with tile IDs or null
  okeyTile?: TileType | null;
  selectedTileId?: string | null;
  onTileSelect?: (tile: TileType) => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  isCurrentPlayer?: boolean;
  canSelect?: boolean;  // Can select tiles for discarding (only on your turn)
  canRearrange?: boolean;  // Can drag/drop to rearrange (always allowed)
  className?: string;
}

// Fixed rack size: 15 slots per row (total 30 slots for up to 15 tiles with gaps)
const SLOTS_PER_ROW = 15;

export function PlayerRack({
  tiles,
  rackLayout,
  okeyTile,
  selectedTileId,
  onTileSelect,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  isCurrentPlayer = false,
  canSelect = false,
  canRearrange = true,
  className,
}: PlayerRackProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Create a map of tile ID to tile object for quick lookup
  const tileMap = new Map(tiles.map(tile => [tile.id, tile]));

  // Convert rackLayout (tile IDs) to actual tiles
  const rackSlots: (TileType | null)[] = rackLayout.map(tileId =>
    tileId ? tileMap.get(tileId) || null : null
  );

  // Split into two rows
  const topRow = rackSlots.slice(0, SLOTS_PER_ROW);
  const bottomRow = rackSlots.slice(SLOTS_PER_ROW);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex && onTileMove) {
      onTileMove(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderSlot = (tile: TileType | null, index: number, rowOffset: number) => {
    const absoluteIndex = rowOffset + index;
    const isBeingDragged = draggedIndex === absoluteIndex;
    const isDragOver = dragOverIndex === absoluteIndex;

    if (tile) {
      return (
        <div
          key={`slot-${absoluteIndex}`}
          draggable={canRearrange}
          onDragStart={() => canRearrange && handleDragStart(absoluteIndex)}
          onDragOver={(e) => canRearrange && handleDragOver(e, absoluteIndex)}
          onDrop={(e) => canRearrange && handleDrop(e, absoluteIndex)}
          onDragEnd={handleDragEnd}
          className={cn(
            'transition-all duration-150 cursor-grab active:cursor-grabbing',
            isBeingDragged && 'opacity-50 scale-95',
            isDragOver && 'scale-110'
          )}
        >
          <Tile
            tile={tile}
            okeyTile={okeyTile}
            isSelected={selectedTileId === tile.id}
            onClick={() => canSelect && onTileSelect?.(tile)}
            size="lg"
          />
        </div>
      );
    }

    // Empty slot
    return (
      <div
        key={`empty-${absoluteIndex}`}
        onDragOver={(e) => canRearrange && handleDragOver(e, absoluteIndex)}
        onDrop={(e) => canRearrange && handleDrop(e, absoluteIndex)}
        className={cn(
          'w-14 h-[72px] rounded-lg',
          'bg-amber-900/30',
          'border border-amber-700/30',
          'transition-all duration-150',
          isDragOver && 'bg-amber-600/50 border-amber-400 scale-105'
        )}
      />
    );
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Left Sort Button - Book style like Zynga */}
      <button
        onClick={onSortByGroups}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-28 rounded-lg',
          'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900',
          'border-2 border-stone-600',
          'text-white font-bold',
          'shadow-xl',
          'hover:from-stone-600 hover:to-stone-800',
          'active:scale-95 transition-all',
          'cursor-pointer'
        )}
      >
        <span className="text-xl font-black">5/5</span>
        <span className="text-[10px] font-bold mt-1 text-stone-300">SORT</span>
      </button>

      {/* Tile Rack - Brown wooden style */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden',
          'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
          'border-4 border-amber-600',
          'shadow-2xl',
          'p-2',
          isCurrentPlayer && 'ring-4 ring-green-400/70 ring-offset-2 ring-offset-emerald-950'
        )}
      >
        {/* Wood grain texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Inner surface with slots */}
        <div className="relative bg-amber-950/40 rounded-lg p-2 space-y-1">
          {/* Top row */}
          <div className="flex gap-0.5 justify-start min-h-[76px] items-end">
            {topRow.map((tile, i) => renderSlot(tile, i, 0))}
          </div>

          {/* Divider line */}
          <div className="h-px bg-amber-700/50 mx-2" />

          {/* Bottom row */}
          <div className="flex gap-0.5 justify-start min-h-[76px] items-start">
            {bottomRow.map((tile, i) => renderSlot(tile, i, SLOTS_PER_ROW))}
          </div>
        </div>
      </div>

      {/* Right Sort Button - Book style */}
      <button
        onClick={onSortByRuns}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-28 rounded-lg',
          'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900',
          'border-2 border-stone-600',
          'text-white font-bold',
          'shadow-xl',
          'hover:from-stone-600 hover:to-stone-800',
          'active:scale-95 transition-all',
          'cursor-pointer'
        )}
      >
        <span className="text-sm font-black">1/2/3</span>
        <span className="text-[10px] font-bold mt-1 text-stone-300">SORT</span>
      </button>
    </div>
  );
}

// Compact opponent rack - shows tile count (Zynga style)
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

export function OpponentRack({
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

  // Calculate how many mini tiles to show (max 10)
  const visibleTiles = Math.min(tileCount, 10);
  const extraTiles = Math.max(0, tileCount - 10);

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        isVertical && 'flex-col',
        position === 'right' && 'flex-row-reverse',
        className
      )}
    >
      {/* Player info card */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-4 py-3',
          'bg-gradient-to-br from-gray-800 to-gray-900',
          'border-2 border-gray-700',
          'shadow-xl',
          isCurrentTurn && 'ring-3 ring-green-400 border-green-500',
          isVertical && 'flex-col px-3 py-4'
        )}
      >
        {/* Avatar */}
        <div className={cn(
          'relative w-14 h-14 rounded-full overflow-hidden',
          'bg-gradient-to-br from-blue-400 to-blue-600',
          'flex items-center justify-center',
          'text-white font-bold text-xl',
          'border-3 border-blue-300',
          'shadow-lg'
        )}>
          {playerAvatar ? (
            <img src={playerAvatar} alt={playerName} className="w-full h-full object-cover" />
          ) : (
            playerName.charAt(0).toUpperCase()
          )}

          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
        </div>

        {/* Name and status */}
        <div className={cn('text-center', isVertical ? 'mt-1' : '')}>
          <div className="text-white font-bold text-sm truncate max-w-[100px]">
            {playerName}
          </div>
          <div className={cn(
            'text-xs font-bold mt-1',
            isCurrentTurn ? 'text-green-400' : 'text-gray-400'
          )}>
            {isCurrentTurn && thinkingText ? (
              <span className="animate-pulse">{thinkingText}</span>
            ) : (
              `${tileCount} taş`
            )}
          </div>
        </div>

        {/* Score badge */}
        <div className="bg-gray-700 text-white text-sm font-bold px-3 py-1 rounded-lg">
          {score}
        </div>
      </div>

      {/* Mini tile rack */}
      <div
        className={cn(
          'flex gap-0.5 p-2 rounded-lg',
          'bg-gradient-to-b from-amber-600 to-amber-700',
          'border-2 border-amber-500',
          'shadow-lg',
          isVertical && 'flex-wrap justify-center max-w-[90px]'
        )}
      >
        {/* Mini face-down tiles */}
        {Array.from({ length: visibleTiles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-md',
              'bg-gradient-to-b from-sky-500 to-sky-600',
              'border border-sky-400',
              'shadow-sm',
              isVertical ? 'w-5 h-6' : 'w-6 h-8'
            )}
          />
        ))}

        {/* Extra count badge */}
        {extraTiles > 0 && (
          <div className={cn(
            'flex items-center justify-center',
            'text-white text-xs font-bold',
            isVertical ? 'w-5 h-6' : 'w-6 h-8'
          )}>
            +{extraTiles}
          </div>
        )}
      </div>
    </div>
  );
}
