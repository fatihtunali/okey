'use client';

import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TurkishTile } from './TurkishTile';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// PREMIUM OKEY GAME BOARD
// Inspired by 101 Okey Plus - Green felt table
// Mobile-first responsive design
// ============================================

interface GameBoardProps {
  game: GameState;
  currentPlayerId: string;
  rackLayout: (string | null)[];
  selectedTileId: string | null;
  onTileSelect: (tile: TileType) => void;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
  onDiscardById?: (tileId: string) => void;
  onDeclareWin: () => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  timeRemaining?: number;
  isProcessingAI?: boolean;
}

// ============================================
// OPPONENT AVATAR - Premium circular design
// ============================================
interface OpponentAvatarProps {
  player: { name: string; isAI: boolean; tiles: TileType[] };
  isCurrentTurn: boolean;
  isThinking?: boolean;
  position: 'left' | 'top' | 'right';
  discardedTile?: TileType | null;
  okeyTile?: TileType | null;
  canPickUp?: boolean;
  onPickUp?: () => void;
}

function OpponentAvatar({
  player,
  isCurrentTurn,
  isThinking,
  position,
  discardedTile,
  okeyTile,
  canPickUp,
  onPickUp,
}: OpponentAvatarProps) {
  const isVertical = position === 'left' || position === 'right';

  return (
    <div className={cn(
      'flex items-center gap-1 sm:gap-2',
      isVertical ? 'flex-col' : 'flex-row',
      position === 'right' && !isVertical && 'flex-row-reverse',
    )}>
      {/* Avatar circle */}
      <div className="relative">
        <motion.div
          className={cn(
            'w-10 h-10 sm:w-14 sm:h-14 rounded-full',
            'bg-gradient-to-br from-stone-700 to-stone-900',
            'border-2 sm:border-3 flex items-center justify-center',
            'shadow-lg',
            isCurrentTurn
              ? 'border-green-400 ring-2 ring-green-400/50'
              : 'border-amber-600/50'
          )}
          animate={isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-lg sm:text-3xl">
            {player.isAI ? '🤖' : '👤'}
          </span>
        </motion.div>

        {/* Turn indicator */}
        {isCurrentTurn && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
          </div>
        )}

        {/* Tile count badge */}
        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-amber-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-amber-400">
          {player.tiles.length}
        </div>
      </div>

      {/* Name and status */}
      <div className={cn(
        'text-center',
        isVertical ? 'w-full' : ''
      )}>
        <div className={cn(
          'text-[10px] sm:text-sm font-bold truncate max-w-[60px] sm:max-w-[80px]',
          isCurrentTurn ? 'text-green-400' : 'text-white'
        )}>
          {player.name}
        </div>
        {isThinking && (
          <div className="text-[8px] sm:text-[10px] text-yellow-400 animate-pulse">
            Düşünüyor...
          </div>
        )}
      </div>

      {/* Discarded tile - shown for all opponents */}
      <motion.button
        onClick={canPickUp ? onPickUp : undefined}
        disabled={!canPickUp}
        className={cn(
          'w-8 h-11 sm:w-12 sm:h-16 rounded-lg',
          'bg-stone-800/80 border-2 flex items-center justify-center',
          canPickUp
            ? 'border-green-400 cursor-pointer shadow-lg shadow-green-500/30'
            : 'border-stone-600/50',
          'transition-all'
        )}
        whileHover={canPickUp ? { scale: 1.1 } : {}}
        whileTap={canPickUp ? { scale: 0.95 } : {}}
      >
        {discardedTile ? (
          <div className="transform scale-50 sm:scale-75">
            <TurkishTile tile={discardedTile} okeyTile={okeyTile} size="sm" />
          </div>
        ) : (
          <span className="text-stone-500 text-[8px] sm:text-[10px]">Boş</span>
        )}
      </motion.button>
      {canPickUp && discardedTile && (
        <motion.div
          className="text-[8px] sm:text-[10px] text-green-400 font-bold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Al
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// PLAYER RACK - Premium wooden design
// ============================================
interface PlayerRackProps {
  tiles: TileType[];
  rackLayout: (string | null)[];
  okeyTile?: TileType | null;
  selectedTileId: string | null;
  onTileSelect: (tile: TileType) => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  canSelect: boolean;
  canDiscard?: boolean;
  onDiscardTile?: (tileId: string) => void;
  leftOpponentDiscard?: TileType | null;
  canPickFromLeft?: boolean;
  onPickFromLeft?: () => void;
}

function PlayerRack({
  tiles,
  rackLayout,
  okeyTile,
  selectedTileId,
  onTileSelect,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  canSelect,
  canDiscard,
  onDiscardTile,
  leftOpponentDiscard,
  canPickFromLeft,
  onPickFromLeft,
}: PlayerRackProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverDiscard, setDragOverDiscard] = useState(false);

  const tileMap = tiles.reduce((acc, tile) => {
    acc[tile.id] = tile;
    return acc;
  }, {} as Record<string, TileType>);

  const handleDragStart = (index: number, tileId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.setData('tileId', tileId);
    e.dataTransfer.setData('source', 'rack');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    const source = e.dataTransfer.getData('source');

    if (source === 'rack') {
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      if (fromIndex !== toIndex && onTileMove) {
        onTileMove(fromIndex, toIndex);
      }
    }
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDiscardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDiscard(false);
    const source = e.dataTransfer.getData('source');
    const tileId = e.dataTransfer.getData('tileId');

    if (source === 'rack' && tileId && canDiscard && onDiscardTile) {
      onDiscardTile(tileId);
    }
  };

  const handleDoubleClick = (tile: TileType) => {
    if (canDiscard && onDiscardTile) {
      onDiscardTile(tile.id);
    }
  };

  // Detect if mobile (will be checked via CSS, but also for slot count)
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;

  const renderSlot = (index: number, row: 'top' | 'bottom') => {
    const slotTileId = rackLayout[index];
    const tile = slotTileId ? tileMap[slotTileId] : null;
    const isDragOver = dragOverIndex === index;

    if (tile) {
      return (
        <motion.div
          key={index}
          layout
          className="flex-shrink-0 touch-manipulation"
        >
          <TurkishTile
            tile={tile}
            okeyTile={okeyTile}
            isSelected={selectedTileId === tile.id}
            size="xl"
            onClick={canSelect ? () => onTileSelect(tile) : undefined}
            onDoubleClick={canDiscard ? () => handleDoubleClick(tile) : undefined}
            draggable
            onDragStart={handleDragStart(index, tile.id)}
          />
        </motion.div>
      );
    }

    return (
      <div
        key={index}
        className={cn(
          'w-[11vw] h-[14vw] sm:w-16 sm:h-20',
          'rounded-md border-2 border-dashed flex-shrink-0',
          'transition-all duration-200',
          isDragOver
            ? 'border-amber-400 bg-amber-500/30 scale-105'
            : 'border-amber-700/40 bg-amber-900/30'
        )}
        onDrop={handleDrop(index)}
        onDragOver={handleDragOver(index)}
        onDragLeave={handleDragLeave}
      />
    );
  };

  // Calculate slots based on actual tiles
  // Mobile: max 8 per row for larger tiles, Desktop: up to 15
  const totalTiles = tiles.length;
  const maxSlotsPerRow = isMobileView ? 8 : 15;
  const minSlots = Math.max(6, Math.ceil(totalTiles / 2) + 1);
  const slotsPerRow = Math.min(maxSlotsPerRow, Math.max(minSlots, 6));
  const topRow = Array.from({ length: slotsPerRow }, (_, i) => i);
  const bottomRow = Array.from({ length: slotsPerRow }, (_, i) => i + slotsPerRow);

  return (
    <div className="w-full flex flex-col items-center px-2 sm:px-4">
      {/* Sort buttons row - mobile optimized */}
      <div className="flex justify-center gap-2 mb-2">
        {/* Pick from left */}
        {canPickFromLeft && leftOpponentDiscard && (
          <motion.button
            onClick={onPickFromLeft}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-lg',
              'bg-green-600 text-white text-xs sm:text-sm font-bold',
              'shadow-lg'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">Al</span>
          </motion.button>
        )}

        <button
          onClick={onSortByGroups}
          className={cn(
            'flex items-center gap-1 px-3 py-2 rounded-lg',
            'bg-gradient-to-b from-blue-600 to-blue-700',
            'border border-blue-400',
            'text-white text-xs sm:text-sm font-bold',
            'shadow-lg active:scale-95 transition-transform'
          )}
        >
          <span>🃏</span>
          <span className="hidden sm:inline">Çift Diz</span>
        </button>

        <button
          onClick={onSortByRuns}
          className={cn(
            'flex items-center gap-1 px-3 py-2 rounded-lg',
            'bg-gradient-to-b from-blue-600 to-blue-700',
            'border border-blue-400',
            'text-white text-xs sm:text-sm font-bold',
            'shadow-lg active:scale-95 transition-transform'
          )}
        >
          <span>📊</span>
          <span className="hidden sm:inline">Seri Diz</span>
        </button>

        {/* Double-click hint when can discard */}
        {canDiscard && (
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-700/50 text-stone-300 text-xs">
            <span>💡</span>
            <span className="hidden sm:inline">Çift tıkla at</span>
          </div>
        )}
      </div>

      {/* Rack with discard zone on right */}
      <div className="flex items-stretch gap-2 sm:gap-3">
        {/* Rack container - Premium wood design */}
        <div className={cn(
          'relative rounded-xl overflow-hidden',
          'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800',
          'border-4 border-amber-500',
          'shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.4)]'
        )}>
          {/* Wood grain texture */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 8px,
                rgba(0,0,0,0.1) 8px,
                rgba(0,0,0,0.1) 10px
              )`
            }}
          />

          {/* Tiles container */}
          <div className="relative p-1.5 sm:p-3">
            {/* Top row */}
            <div className="flex gap-[2px] sm:gap-1 justify-center mb-1 overflow-x-auto scrollbar-hide">
              {topRow.map((i) => renderSlot(i, 'top'))}
            </div>

            {/* Divider with ornament */}
            <div className="relative h-0.5 sm:h-1 my-0.5 sm:my-1">
              <div className="absolute inset-0 bg-amber-900/60 rounded" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rotate-45 border border-amber-400" />
            </div>

            {/* Bottom row */}
            <div className="flex gap-[2px] sm:gap-1 justify-center overflow-x-auto scrollbar-hide">
              {bottomRow.map((i) => renderSlot(i, 'bottom'))}
            </div>
          </div>
        </div>

        {/* Discard drop zone on the right */}
        <motion.div
          className={cn(
            'w-[14vw] sm:w-24 flex flex-col items-center justify-center rounded-xl',
            'border-2 sm:border-3 border-dashed transition-all',
            dragOverDiscard
              ? 'bg-red-500/40 border-red-400 scale-105'
              : canDiscard
                ? 'bg-red-900/40 border-red-500/60'
                : 'bg-stone-800/40 border-stone-600/40',
          )}
          onDrop={handleDiscardDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (canDiscard) setDragOverDiscard(true);
          }}
          onDragLeave={() => setDragOverDiscard(false)}
          animate={dragOverDiscard ? { scale: 1.05 } : { scale: 1 }}
        >
          <span className="text-2xl sm:text-4xl mb-0.5 sm:mb-1">🗑️</span>
          <span className={cn(
            'text-[10px] sm:text-sm font-bold text-center whitespace-pre-line',
            canDiscard ? 'text-red-300' : 'text-stone-500'
          )}>
            {canDiscard ? 'At' : 'At'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// CENTER TABLE AREA - Green felt design
// ============================================
interface CenterAreaProps {
  tileBagCount: number;
  indicatorTile?: TileType | null;
  okeyTile?: TileType | null;
  canDraw: boolean;
  onDrawFromPile: () => void;
  lastDiscardedTile?: TileType | null;
  canPickDiscard?: boolean;
  onPickDiscard?: () => void;
}

function CenterArea({
  tileBagCount,
  indicatorTile,
  okeyTile,
  canDraw,
  onDrawFromPile,
  lastDiscardedTile,
  canPickDiscard,
  onPickDiscard,
}: CenterAreaProps) {
  return (
    <div className="flex-1 flex items-center justify-center gap-2 sm:gap-8">
      {/* Draw pile */}
      <motion.button
        onClick={onDrawFromPile}
        disabled={!canDraw}
        className={cn(
          'flex flex-col items-center',
          canDraw && 'cursor-pointer'
        )}
        whileHover={canDraw ? { scale: 1.05, y: -4 } : {}}
        whileTap={canDraw ? { scale: 0.95 } : {}}
      >
        {/* Stacked tiles */}
        <div className="relative">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className={cn(
                'w-10 h-14 sm:w-16 sm:h-20 rounded-lg',
                i === 0 ? 'relative' : 'absolute',
                'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900',
                'border-2',
                canDraw && i === 0 ? 'border-green-400' : 'border-amber-600',
                'shadow-lg'
              )}
              style={i > 0 ? {
                bottom: i * 2,
                right: i * 1.5,
                zIndex: -i
              } : {}}
            >
              {i === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-amber-400 font-bold text-[10px] sm:text-sm">OKEY</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Count */}
        <div className="mt-1.5 sm:mt-2 bg-stone-900/80 text-amber-300 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-600/50">
          {tileBagCount}
        </div>

        {canDraw && (
          <motion.div
            className="mt-0.5 sm:mt-1 text-green-400 text-[10px] sm:text-xs font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Çek
          </motion.div>
        )}
      </motion.button>

      {/* Indicator tile with stand */}
      {indicatorTile && (
        <div className="flex flex-col items-center">
          <div className="text-[8px] sm:text-xs text-amber-300/80 font-medium mb-0.5 sm:mb-1">
            GÖSTERGE
          </div>

          {/* Tile on stand */}
          <div className="relative">
            <TurkishTile tile={indicatorTile} size="md" />
            {/* Wooden stand */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-1.5 sm:h-2 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b border-x border-b border-amber-600" />
          </div>

          {/* Okey info */}
          {okeyTile && (
            <div className={cn(
              'mt-1.5 sm:mt-2 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg',
              'bg-stone-900/80 border border-amber-500/30'
            )}>
              <span className="text-amber-300 text-[8px] sm:text-xs">Okey:</span>
              <span className={cn(
                'font-bold text-xs sm:text-sm',
                okeyTile.color === 'red' && 'text-red-400',
                okeyTile.color === 'blue' && 'text-blue-400',
                okeyTile.color === 'yellow' && 'text-amber-400',
                okeyTile.color === 'black' && 'text-stone-300',
              )}>
                {okeyTile.number}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Discard pile - shows last discarded tile prominently */}
      <motion.button
        onClick={canPickDiscard ? onPickDiscard : undefined}
        disabled={!canPickDiscard}
        className={cn(
          'flex flex-col items-center'
        )}
        whileHover={canPickDiscard ? { scale: 1.05 } : {}}
        whileTap={canPickDiscard ? { scale: 0.95 } : {}}
      >
        <div className="text-[8px] sm:text-xs text-amber-300/80 font-medium mb-0.5 sm:mb-1">
          ATILAN
        </div>
        <div className={cn(
          'w-10 h-14 sm:w-16 sm:h-20 rounded-lg',
          'flex items-center justify-center',
          'bg-stone-800/80 border-2',
          lastDiscardedTile
            ? canPickDiscard
              ? 'border-green-400 shadow-lg shadow-green-500/30'
              : 'border-amber-600'
            : 'border-stone-600/50',
          canPickDiscard && 'cursor-pointer'
        )}>
          {lastDiscardedTile ? (
            <TurkishTile tile={lastDiscardedTile} okeyTile={okeyTile} size="sm" />
          ) : (
            <span className="text-stone-500 text-[10px] sm:text-xs">Boş</span>
          )}
        </div>
        {canPickDiscard && lastDiscardedTile && (
          <motion.div
            className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-green-400 font-bold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            Al
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

// ============================================
// MAIN GAME BOARD - Premium Design
// ============================================
export const TurkishGameBoard = memo(function TurkishGameBoard({
  game,
  currentPlayerId,
  rackLayout,
  selectedTileId,
  onTileSelect,
  onDrawFromPile,
  onDrawFromDiscard,
  onDiscard,
  onDiscardById,
  onDeclareWin,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  timeRemaining = 30,
  isProcessingAI = false,
}: GameBoardProps) {
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);

  // Get opponents (counterclockwise order)
  const opponents = useMemo(() => {
    const result: { player: typeof game.players[0]; position: 'left' | 'top' | 'right'; index: number }[] = [];
    const positions: ('right' | 'top' | 'left')[] = ['right', 'top', 'left'];

    for (let i = 1; i < game.players.length && result.length < 3; i++) {
      const idx = (currentPlayerIndex + i) % game.players.length;
      result.push({
        player: game.players[idx],
        position: positions[result.length],
        index: idx,
      });
    }
    return result;
  }, [game.players, currentPlayerIndex]);

  const isMyTurn = game.currentTurn === currentPlayerIndex;
  const canDraw = isMyTurn && game.turnPhase === 'draw' && !isProcessingAI;
  const canDiscard = isMyTurn && game.turnPhase === 'discard' && selectedTileId && !isProcessingAI;

  const timerPercentage = (timeRemaining / (game.turnTimeLimit || 30)) * 100;
  const isTimeLow = timeRemaining <= 10;

  const leftOpp = opponents.find(o => o.position === 'left');
  const topOpp = opponents.find(o => o.position === 'top');
  const rightOpp = opponents.find(o => o.position === 'right');

  const lastDiscardedTile = game.discardPile.length > 0
    ? game.discardPile[game.discardPile.length - 1]
    : null;

  const canPickFromLeftOpponent = canDraw && lastDiscardedTile !== null;

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden bg-stone-950">
      {/* Premium wood frame border */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-amber-800 to-amber-900" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-amber-800 to-amber-900" />
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-amber-800 to-amber-900" />
        <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-amber-800 to-amber-900" />
      </div>

      {/* Top bar - Actions and timer */}
      <div className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 bg-gradient-to-b from-stone-900 to-stone-900/90 border-b border-amber-700/30">
        {/* Left - Exit and info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="p-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Chips display */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-800 px-3 py-1.5 rounded-full border border-amber-600/30">
            <span className="text-yellow-400">🪙</span>
            <span className="text-amber-300 font-bold text-sm">5,000</span>
          </div>
        </div>

        {/* Center - Timer and turn info */}
        <div className="flex flex-col items-center">
          <div className={cn(
            'text-xs sm:text-sm font-bold mb-1',
            isMyTurn ? 'text-green-400' : 'text-white'
          )}>
            {isMyTurn ? 'Senin Sıran!' : (
              game.players[game.currentTurn]?.isAI
                ? `${game.players[game.currentTurn]?.name} oynuyor...`
                : 'Rakip oynuyor...'
            )}
          </div>

          {/* Timer bar */}
          <div className="w-24 sm:w-32 h-1.5 bg-stone-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isTimeLow ? 'bg-red-500' : 'bg-green-500'
              )}
              initial={{ width: '100%' }}
              animate={{ width: `${timerPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className={cn(
            'text-xs mt-0.5 font-mono',
            isTimeLow ? 'text-red-400' : 'text-stone-400'
          )}>
            {timeRemaining}s
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {canDraw && (
            <motion.button
              onClick={onDrawFromPile}
              className={cn(
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm',
                'bg-gradient-to-b from-green-500 to-green-600',
                'border border-green-400 text-white',
                'shadow-lg shadow-green-500/30'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Çek
            </motion.button>
          )}

          {canDiscard && currentPlayer && currentPlayer.tiles.length === 15 && (
            <motion.button
              onClick={onDeclareWin}
              className={cn(
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm',
                'bg-gradient-to-b from-amber-500 to-amber-600',
                'border border-amber-400 text-stone-900',
                'shadow-lg shadow-amber-500/30'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Bitir! 🏆
            </motion.button>
          )}
        </div>
      </div>

      {/* Main game area - Green felt table */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {/* Green felt background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at center, #1a5f3c 0%, #0d3d24 50%, #082518 100%)
            `
          }}
        >
          {/* Felt texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Table layout */}
        <div className="relative h-full flex flex-col p-1 sm:p-4">
          {/* Top opponent */}
          <div className="flex justify-center py-1 sm:py-2">
            {topOpp && (
              <OpponentAvatar
                player={topOpp.player}
                isCurrentTurn={game.currentTurn === topOpp.index}
                isThinking={isProcessingAI && game.currentTurn === topOpp.index}
                position="top"
                okeyTile={game.okeyTile}
                discardedTile={lastDiscardedTile}
              />
            )}
          </div>

          {/* Middle row - Left opponent, Center, Right opponent */}
          <div className="flex-1 flex items-center min-h-0">
            {/* Left opponent */}
            <div className="flex-shrink-0 w-14 sm:w-28">
              {leftOpp && (
                <OpponentAvatar
                  player={leftOpp.player}
                  isCurrentTurn={game.currentTurn === leftOpp.index}
                  isThinking={isProcessingAI && game.currentTurn === leftOpp.index}
                  position="left"
                  okeyTile={game.okeyTile}
                  discardedTile={lastDiscardedTile}
                  canPickUp={canPickFromLeftOpponent}
                  onPickUp={onDrawFromDiscard}
                />
              )}
            </div>

            {/* Center area */}
            <CenterArea
              tileBagCount={game.tileBag.length}
              indicatorTile={game.indicatorTile}
              okeyTile={game.okeyTile}
              canDraw={canDraw}
              onDrawFromPile={onDrawFromPile}
              lastDiscardedTile={lastDiscardedTile}
              canPickDiscard={canPickFromLeftOpponent}
              onPickDiscard={onDrawFromDiscard}
            />

            {/* Right opponent */}
            <div className="flex-shrink-0 w-14 sm:w-28">
              {rightOpp && (
                <OpponentAvatar
                  player={rightOpp.player}
                  isCurrentTurn={game.currentTurn === rightOpp.index}
                  isThinking={isProcessingAI && game.currentTurn === rightOpp.index}
                  position="right"
                  okeyTile={game.okeyTile}
                  discardedTile={lastDiscardedTile}
                />
              )}
            </div>
          </div>

          {/* Current player info bar */}
          <div className="flex justify-center py-1 sm:py-2">
            <div className="flex items-center gap-2 sm:gap-3 bg-stone-900/80 px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-amber-500/30">
              <span className="text-lg sm:text-2xl">👤</span>
              <div>
                <div className="text-amber-300 font-bold text-xs sm:text-sm">
                  {currentPlayer?.name || 'Sen'}
                </div>
                <div className="text-stone-400 text-[10px] sm:text-xs">
                  {currentPlayer?.tiles.length || 0} taş
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Player's rack */}
      <div className="relative z-20 bg-gradient-to-t from-stone-900 via-stone-900/95 to-stone-900/80 py-2 sm:py-3">
        <PlayerRack
          tiles={currentPlayer?.tiles || []}
          rackLayout={rackLayout}
          okeyTile={game.okeyTile}
          selectedTileId={selectedTileId}
          onTileSelect={onTileSelect}
          onTileMove={onTileMove}
          onSortByGroups={onSortByGroups}
          onSortByRuns={onSortByRuns}
          canSelect={game.turnPhase === 'discard'}
          canDiscard={isMyTurn && game.turnPhase === 'discard' && !isProcessingAI}
          onDiscardTile={onDiscardById}
          leftOpponentDiscard={lastDiscardedTile}
          canPickFromLeft={canPickFromLeftOpponent}
          onPickFromLeft={onDrawFromDiscard}
        />
      </div>

    </div>
  );
});

export default TurkishGameBoard;
