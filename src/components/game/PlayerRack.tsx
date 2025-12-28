'use client';

import { Tile as TileType } from '@/lib/game/types';
import { Tile, TileSlot } from './Tile';
import { cn } from '@/lib/utils';

interface PlayerRackProps {
  tiles: TileType[];
  okeyTile?: TileType | null;
  selectedTileId?: string | null;
  onTileSelect?: (tile: TileType) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  isCurrentPlayer?: boolean;
  canInteract?: boolean;
  showSlots?: boolean;
  className?: string;
}

export function PlayerRack({
  tiles,
  okeyTile,
  selectedTileId,
  onTileSelect,
  onSortByGroups,
  onSortByRuns,
  isCurrentPlayer = false,
  canInteract = true,
  showSlots = false,
  className,
}: PlayerRackProps) {
  // Split tiles into two rows like a real okey rack
  const topRow = tiles.slice(0, Math.ceil(tiles.length / 2));
  const bottomRow = tiles.slice(Math.ceil(tiles.length / 2));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Left Sort Button - Groups (same number) */}
      <button
        onClick={onSortByGroups}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-16 h-24 rounded-xl',
          'bg-gradient-to-b from-sky-500 to-sky-600',
          'border-2 border-sky-400',
          'text-white font-bold',
          'shadow-lg hover:shadow-xl',
          'hover:from-sky-400 hover:to-sky-500',
          'active:scale-95 transition-all',
          'cursor-pointer'
        )}
      >
        <span className="text-2xl">5/5</span>
        <span className="text-xs">SIRALA</span>
      </button>

      {/* Tile Rack */}
      <div
        className={cn(
          // Wooden rack appearance - Zynga style
          'relative rounded-xl',
          'bg-gradient-to-b from-amber-600 to-amber-700',
          'border-4 border-amber-500',
          'shadow-2xl',
          'p-3',
          // Current player highlight
          isCurrentPlayer && 'ring-4 ring-green-500/70'
        )}
      >
        {/* Inner surface */}
        <div className="relative bg-amber-800/50 rounded-lg p-2 space-y-1">
          {/* Top row */}
          <div className="relative flex gap-1 justify-center min-h-[76px] items-end">
            {topRow.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                okeyTile={okeyTile}
                isSelected={selectedTileId === tile.id}
                onClick={() => canInteract && onTileSelect?.(tile)}
                size="lg"
              />
            ))}
            {/* Show empty slots if less than 8 tiles and showSlots is true */}
            {showSlots && Array.from({ length: Math.max(0, 8 - topRow.length) }).map((_, i) => (
              <TileSlot key={`top-slot-${i}`} size="lg" />
            ))}
          </div>

          {/* Bottom row */}
          <div className="relative flex gap-1 justify-center min-h-[76px] items-start">
            {bottomRow.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                okeyTile={okeyTile}
                isSelected={selectedTileId === tile.id}
                onClick={() => canInteract && onTileSelect?.(tile)}
                size="lg"
              />
            ))}
            {/* Show empty slots if less than 8 tiles and showSlots is true */}
            {showSlots && Array.from({ length: Math.max(0, 8 - bottomRow.length) }).map((_, i) => (
              <TileSlot key={`bottom-slot-${i}`} size="lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sort Button - Runs (consecutive numbers) */}
      <button
        onClick={onSortByRuns}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-16 h-24 rounded-xl',
          'bg-gradient-to-b from-sky-500 to-sky-600',
          'border-2 border-sky-400',
          'text-white font-bold',
          'shadow-lg hover:shadow-xl',
          'hover:from-sky-400 hover:to-sky-500',
          'active:scale-95 transition-all',
          'cursor-pointer'
        )}
      >
        <span className="text-lg">1/2/3</span>
        <span className="text-xs">SIRALA</span>
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
