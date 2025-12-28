'use client';

import { useState } from 'react';
import { Tile as TileType } from '@/lib/game/types';
import { Tile, TileSlot } from './Tile';
import { cn } from '@/lib/utils';

interface PlayerRackProps {
  tiles: TileType[];
  okeyTile?: TileType | null;
  selectedTileId?: string | null;
  onTileSelect?: (tile: TileType) => void;
  onTileDoubleClick?: (tile: TileType) => void;
  isCurrentPlayer?: boolean;
  canInteract?: boolean;
  className?: string;
}

export function PlayerRack({
  tiles,
  okeyTile,
  selectedTileId,
  onTileSelect,
  onTileDoubleClick,
  isCurrentPlayer = false,
  canInteract = true,
  className,
}: PlayerRackProps) {
  // Two rows of tiles (like real Okey rack)
  const topRow = tiles.slice(0, Math.ceil(tiles.length / 2));
  const bottomRow = tiles.slice(Math.ceil(tiles.length / 2));

  // Fill empty slots to show rack structure
  const maxPerRow = 8;
  const topSlots = Math.max(0, maxPerRow - topRow.length);
  const bottomSlots = Math.max(0, maxPerRow - bottomRow.length);

  return (
    <div
      className={cn(
        'bg-gradient-to-b from-amber-700 to-amber-800 rounded-xl p-3 shadow-xl',
        'border-4 border-amber-600',
        isCurrentPlayer && 'ring-2 ring-green-400 ring-offset-2',
        className
      )}
    >
      {/* Rack wooden frame effect */}
      <div className="bg-amber-900/50 rounded-lg p-2 space-y-1">
        {/* Top row */}
        <div className="flex gap-1 justify-center">
          {topRow.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              okeyTile={okeyTile}
              isSelected={selectedTileId === tile.id}
              onClick={() => canInteract && onTileSelect?.(tile)}
              size="md"
            />
          ))}
          {/* Empty slots */}
          {Array.from({ length: topSlots }).map((_, i) => (
            <TileSlot key={`top-slot-${i}`} />
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex gap-1 justify-center">
          {bottomRow.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              okeyTile={okeyTile}
              isSelected={selectedTileId === tile.id}
              onClick={() => canInteract && onTileSelect?.(tile)}
              size="md"
            />
          ))}
          {/* Empty slots */}
          {Array.from({ length: bottomSlots }).map((_, i) => (
            <TileSlot key={`bottom-slot-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact rack for opponent display (shows face-down tiles)
interface OpponentRackProps {
  tileCount: number;
  playerName: string;
  playerAvatar?: string;
  isCurrentTurn?: boolean;
  position: 'left' | 'top' | 'right';
  className?: string;
}

export function OpponentRack({
  tileCount,
  playerName,
  playerAvatar,
  isCurrentTurn = false,
  position,
  className,
}: OpponentRackProps) {
  const isVertical = position === 'left' || position === 'right';

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isVertical && 'flex-col',
        position === 'right' && 'flex-row-reverse',
        className
      )}
    >
      {/* Player info */}
      <div
        className={cn(
          'flex items-center gap-2 bg-gray-800/80 rounded-lg px-3 py-2',
          isCurrentTurn && 'ring-2 ring-green-400 animate-pulse',
          isVertical && 'flex-col'
        )}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow">
          {playerAvatar ? (
            <img src={playerAvatar} alt={playerName} className="w-full h-full rounded-full" />
          ) : (
            playerName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Name and tile count */}
        <div className={cn('text-center', isVertical && 'mt-1')}>
          <div className="text-white text-sm font-medium truncate max-w-[80px]">
            {playerName}
          </div>
          <div className="text-amber-400 text-xs">
            {tileCount} taş
          </div>
        </div>
      </div>

      {/* Tiles (face down, compact) */}
      <div
        className={cn(
          'flex gap-0.5',
          isVertical && 'flex-col'
        )}
      >
        {/* Show mini face-down tiles */}
        {Array.from({ length: Math.min(tileCount, 8) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-gradient-to-br from-amber-800 to-amber-900 border border-amber-700 rounded',
              isVertical ? 'w-6 h-4' : 'w-4 h-6',
              'shadow-sm'
            )}
          />
        ))}
        {tileCount > 8 && (
          <div className={cn(
            'text-amber-400 text-xs flex items-center justify-center',
            isVertical ? 'w-6 h-4' : 'w-6 h-6'
          )}>
            +{tileCount - 8}
          </div>
        )}
      </div>
    </div>
  );
}
