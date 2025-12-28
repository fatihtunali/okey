'use client';

import { Tile as TileType } from '@/lib/game/types';
import { Tile, TileSlot } from './Tile';
import { cn } from '@/lib/utils';

interface PlayerRackProps {
  tiles: TileType[];
  okeyTile?: TileType | null;
  selectedTileId?: string | null;
  onTileSelect?: (tile: TileType) => void;
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
  isCurrentPlayer = false,
  canInteract = true,
  showSlots = false,
  className,
}: PlayerRackProps) {
  // Split tiles into two rows like a real okey rack
  const topRow = tiles.slice(0, Math.ceil(tiles.length / 2));
  const bottomRow = tiles.slice(Math.ceil(tiles.length / 2));

  return (
    <div
      className={cn(
        // Wooden rack appearance
        'relative rounded-2xl p-4',
        'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
        'border-4 border-amber-600',
        'shadow-2xl shadow-black/50',
        // Current player highlight
        isCurrentPlayer && 'ring-4 ring-green-500/50 ring-offset-4 ring-offset-transparent',
        className
      )}
    >
      {/* Wood grain texture overlay */}
      <div className="absolute inset-0 opacity-10 rounded-xl pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Inner felt-like surface */}
      <div className="relative bg-amber-950/40 rounded-xl p-3 space-y-2">
        {/* Tile grooves (visual guides) */}
        <div className="absolute inset-3 pointer-events-none">
          <div className="h-1/2 border-b border-amber-700/30" />
        </div>

        {/* Top row */}
        <div className="relative flex gap-1.5 justify-center min-h-[80px] items-end pb-1">
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
        <div className="relative flex gap-1.5 justify-center min-h-[80px] items-start pt-1">
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

      {/* Rack edge highlight */}
      <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-b from-amber-500/30 to-transparent rounded-t-xl" />
    </div>
  );
}

// Compact opponent rack - shows tile count
interface OpponentRackProps {
  tileCount: number;
  playerName: string;
  playerAvatar?: string;
  isCurrentTurn?: boolean;
  isAI?: boolean;
  position: 'left' | 'top' | 'right';
  thinkingText?: string;
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
  className,
}: OpponentRackProps) {
  const isVertical = position === 'left' || position === 'right';

  // Calculate how many mini tiles to show (max 8)
  const visibleTiles = Math.min(tileCount, 8);
  const extraTiles = Math.max(0, tileCount - 8);

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
          'bg-gradient-to-br from-stone-800/90 to-stone-900/90',
          'border border-stone-700/50',
          'backdrop-blur-sm shadow-lg',
          isCurrentTurn && 'ring-2 ring-green-400 border-green-500/50',
          isVertical && 'flex-col px-3 py-4'
        )}
      >
        {/* Avatar */}
        <div className={cn(
          'relative w-12 h-12 rounded-full overflow-hidden',
          'bg-gradient-to-br from-amber-400 to-amber-600',
          'flex items-center justify-center',
          'text-white font-bold text-lg shadow-inner',
          'border-2 border-amber-500/50'
        )}>
          {playerAvatar ? (
            <img src={playerAvatar} alt={playerName} className="w-full h-full object-cover" />
          ) : (
            playerName.charAt(0).toUpperCase()
          )}

          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-stone-800" />
        </div>

        {/* Name and status */}
        <div className={cn('text-center', isVertical ? 'mt-1' : '')}>
          <div className="text-white font-semibold text-sm truncate max-w-[100px]">
            {playerName}
          </div>
          <div className={cn(
            'text-xs font-medium',
            isCurrentTurn ? 'text-green-400' : 'text-amber-400/70'
          )}>
            {isCurrentTurn && thinkingText ? (
              <span className="animate-pulse">{thinkingText}</span>
            ) : (
              `${tileCount} taş`
            )}
          </div>
        </div>
      </div>

      {/* Mini tile rack */}
      <div
        className={cn(
          'flex gap-0.5 p-2 rounded-lg',
          'bg-gradient-to-br from-amber-800/80 to-amber-900/80',
          'border border-amber-700/50',
          'shadow-inner',
          isVertical && 'flex-wrap justify-center max-w-[80px]'
        )}
      >
        {/* Mini face-down tiles */}
        {Array.from({ length: visibleTiles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded bg-gradient-to-br from-amber-700 to-amber-800',
              'border border-amber-600/30',
              'shadow-sm',
              isVertical ? 'w-5 h-4' : 'w-5 h-7'
            )}
          />
        ))}

        {/* Extra count badge */}
        {extraTiles > 0 && (
          <div className={cn(
            'flex items-center justify-center',
            'text-amber-300 text-xs font-bold',
            isVertical ? 'w-5 h-4' : 'w-6 h-7'
          )}>
            +{extraTiles}
          </div>
        )}
      </div>
    </div>
  );
}
