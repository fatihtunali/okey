'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TurkishTile } from './TurkishTile';
import { TurkishPlayerRack } from './TurkishRack';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH GAME BOARD - 4-Sided Table Layout
// Each player discards to their RIGHT side
// Next player can pick up from their LEFT
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
  onDeclareWin: () => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  timeRemaining?: number;
  isProcessingAI?: boolean;
}

// Opponent display with their discard on right side
function OpponentSide({
  player,
  isCurrentTurn,
  isThinking,
  position,
  lastDiscardedTile,
  okeyTile,
  canPickUp,
  onPickUp,
}: {
  player: { name: string; tiles: TileType[]; isAI: boolean };
  isCurrentTurn: boolean;
  isThinking: boolean;
  position: 'top' | 'left' | 'right';
  lastDiscardedTile?: TileType | null;
  okeyTile?: TileType | null;
  canPickUp: boolean;
  onPickUp: () => void;
}) {
  const tileCount = player.tiles.length;
  const isVertical = position === 'left' || position === 'right';

  return (
    <div className={cn(
      'flex items-center gap-1',
      isVertical ? 'flex-col' : 'flex-row',
    )}>
      {/* Player badge */}
      <div className={cn(
        'flex items-center gap-1 px-1.5 py-1 rounded-md',
        'bg-stone-800/90 border',
        isCurrentTurn ? 'border-green-500 ring-1 ring-green-400' : 'border-stone-600',
        isVertical && 'flex-col px-1 py-1.5'
      )}>
        <div className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
          'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
        )}>
          {player.isAI ? '🤖' : player.name[0]?.toUpperCase()}
        </div>
        <div className="text-center">
          <div className="text-[9px] text-white font-medium truncate max-w-[50px]">
            {player.name}
          </div>
          <div className={cn(
            'text-[8px] font-bold',
            isCurrentTurn ? 'text-green-400' : 'text-stone-400'
          )}>
            {isThinking ? '...' : `${tileCount}`}
          </div>
        </div>
      </div>

      {/* Tile backs (opponent's rack) */}
      <div className={cn(
        'flex gap-px p-0.5 rounded bg-amber-800/60 border border-amber-700/50',
        isVertical ? 'flex-col' : 'flex-row'
      )}>
        {Array.from({ length: Math.min(tileCount, isVertical ? 6 : 10) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm bg-gradient-to-br from-amber-600 to-amber-700 border border-amber-500/30',
              isVertical ? 'w-3 h-4' : 'w-2.5 h-3.5'
            )}
          />
        ))}
        {tileCount > (isVertical ? 6 : 10) && (
          <div className={cn(
            'flex items-center justify-center text-[7px] font-bold text-amber-300',
            isVertical ? 'w-3 h-4' : 'w-2.5 h-3.5'
          )}>
            +{tileCount - (isVertical ? 6 : 10)}
          </div>
        )}
      </div>

      {/* Discarded tile (on player's right = next player's left) */}
      {lastDiscardedTile && (
        <button
          onClick={onPickUp}
          disabled={!canPickUp}
          className={cn(
            'relative p-0.5 rounded bg-green-800/50 border border-green-600/50',
            canPickUp && 'cursor-pointer ring-2 ring-green-400 animate-pulse'
          )}
        >
          <div className="scale-75 origin-center">
            <TurkishTile tile={lastDiscardedTile} okeyTile={okeyTile} size="sm" />
          </div>
          {canPickUp && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </button>
      )}
    </div>
  );
}

export const TurkishGameBoard = memo(function TurkishGameBoard({
  game,
  currentPlayerId,
  rackLayout,
  selectedTileId,
  onTileSelect,
  onDrawFromPile,
  onDrawFromDiscard,
  onDiscard,
  onDeclareWin,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  timeRemaining = 30,
  isProcessingAI = false,
}: GameBoardProps) {
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);

  // Get opponents in order: left, top, right (counter-clockwise from player's perspective)
  const opponents = useMemo(() => {
    const positions: ('left' | 'top' | 'right')[] = ['left', 'top', 'right'];
    const result: { player: typeof game.players[0]; position: 'left' | 'top' | 'right'; index: number }[] = [];

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

  // Get the last discarded tile (from the previous player)
  // In real okey, previous player's discard is on current player's left
  const previousPlayerIndex = (currentPlayerIndex - 1 + game.players.length) % game.players.length;
  const lastDiscardedTile = game.discardPile.length > 0 ? game.discardPile[game.discardPile.length - 1] : null;

  // Current player can only pick from previous player's discard (on their left)
  const canPickFromLeft = canDraw && lastDiscardedTile;

  return (
    <div className="w-full h-full min-h-screen bg-emerald-900 flex flex-col">
      {/* Timer bar */}
      <div className="h-1 bg-stone-900 flex-shrink-0">
        <div
          className={cn(
            'h-full transition-all duration-1000',
            isTimeLow ? 'bg-red-500' : 'bg-green-500'
          )}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Game table - CSS Grid for 4-sided layout */}
      <div className="flex-1 grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] p-1 gap-1 min-h-0">

        {/* Top-left corner - Top player's discard area */}
        <div className="flex items-end justify-end p-1">
          {/* This is where top player discards (their right = left player's pickup) */}
        </div>

        {/* TOP player */}
        <div className="flex justify-center items-start pt-1">
          {topOpp && (
            <OpponentSide
              player={topOpp.player}
              isCurrentTurn={game.currentTurn === topOpp.index}
              isThinking={isProcessingAI && game.currentTurn === topOpp.index}
              position="top"
              lastDiscardedTile={null} // Top player's discard shown separately
              okeyTile={game.okeyTile}
              canPickUp={false}
              onPickUp={() => {}}
            />
          )}
        </div>

        {/* Top-right corner - Right player can pick up top's discard */}
        <div className="flex items-end justify-start p-1">
          {/* Top player's discarded tile (right player can pick up) */}
        </div>

        {/* LEFT player */}
        <div className="flex items-center justify-start pl-1">
          {leftOpp && (
            <OpponentSide
              player={leftOpp.player}
              isCurrentTurn={game.currentTurn === leftOpp.index}
              isThinking={isProcessingAI && game.currentTurn === leftOpp.index}
              position="left"
              lastDiscardedTile={null}
              okeyTile={game.okeyTile}
              canPickUp={false}
              onPickUp={() => {}}
            />
          )}
        </div>

        {/* CENTER - Draw pile and indicator only */}
        <div className="relative flex items-center justify-center">
          <div className={cn(
            'relative rounded-lg p-3',
            'bg-gradient-to-br from-green-700 via-green-800 to-green-900',
            'border-2 border-amber-700 shadow-lg',
          )}>
            <div className="flex items-center justify-center gap-4">
              {/* Draw pile */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-amber-300 font-bold mb-1">DESTE</span>
                <button
                  onClick={onDrawFromPile}
                  disabled={!canDraw}
                  className={cn(
                    'relative',
                    canDraw && 'cursor-pointer hover:scale-105 transition-transform'
                  )}
                >
                  <div className="w-10 h-12 rounded bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500 shadow-md flex items-center justify-center">
                    <span className="text-xs text-amber-200 font-bold">{game.tileBag.length}</span>
                  </div>
                  {canDraw && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>

              {/* Indicator */}
              {game.indicatorTile && (
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-amber-300 font-bold mb-1">GÖSTERGE</span>
                  <TurkishTile tile={game.indicatorTile} size="md" />
                </div>
              )}
            </div>

            {/* Status */}
            {isProcessingAI && !isMyTurn && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                  Rakip düşünüyor...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT player */}
        <div className="flex items-center justify-end pr-1">
          {rightOpp && (
            <OpponentSide
              player={rightOpp.player}
              isCurrentTurn={game.currentTurn === rightOpp.index}
              isThinking={isProcessingAI && game.currentTurn === rightOpp.index}
              position="right"
              lastDiscardedTile={null}
              okeyTile={game.okeyTile}
              canPickUp={false}
              onPickUp={() => {}}
            />
          )}
        </div>

        {/* Bottom-left - Previous player's discard (I can pick up) */}
        <div className="flex items-start justify-end p-1">
          {lastDiscardedTile && (
            <button
              onClick={onDrawFromDiscard}
              disabled={!canPickFromLeft}
              className={cn(
                'flex flex-col items-center p-1 rounded',
                'bg-green-800/50 border border-green-600/30',
                canPickFromLeft && 'ring-2 ring-green-400 cursor-pointer hover:scale-105 transition-transform'
              )}
            >
              <span className="text-[7px] text-green-300 font-bold mb-0.5">AL</span>
              <div className="scale-75 origin-top">
                <TurkishTile tile={lastDiscardedTile} okeyTile={game.okeyTile} size="sm" />
              </div>
            </button>
          )}
        </div>

        {/* BOTTOM - Current player */}
        <div className="flex flex-col items-center gap-1 pb-1">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canDraw && (
              <button
                onClick={onDrawFromPile}
                className="px-3 py-1.5 text-xs font-bold rounded bg-green-600 hover:bg-green-500 text-white shadow"
              >
                Desteden Çek
              </button>
            )}
            {canDiscard && (
              <>
                <button
                  onClick={onDiscard}
                  className="px-3 py-1.5 text-xs font-bold rounded bg-red-600 hover:bg-red-500 text-white shadow"
                >
                  Taşı At
                </button>
                {currentPlayer && currentPlayer.tiles.length === 15 && (
                  <button
                    onClick={onDeclareWin}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white shadow animate-pulse"
                  >
                    Bitir!
                  </button>
                )}
              </>
            )}
          </div>

          {/* Player info */}
          {currentPlayer && (
            <div className="flex items-center gap-2 px-2 py-1 bg-stone-800/80 rounded-md">
              <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                {currentPlayer.name[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-amber-200 font-medium">{currentPlayer.name}</span>
              <span className={cn(
                'text-[10px] font-bold',
                isMyTurn ? 'text-green-400' : 'text-stone-400'
              )}>
                {isMyTurn ? (canDraw ? 'Taş çek' : 'Taş at') : 'Bekle'}
              </span>
              {game.okeyTile && (
                <span className={cn(
                  'text-[10px] font-bold px-1 rounded bg-stone-700',
                  game.okeyTile.color === 'red' && 'text-red-400',
                  game.okeyTile.color === 'blue' && 'text-blue-400',
                  game.okeyTile.color === 'yellow' && 'text-amber-400',
                  game.okeyTile.color === 'black' && 'text-gray-300',
                )}>
                  Okey: {game.okeyTile.number}
                </span>
              )}
            </div>
          )}

          {/* Player rack */}
          {currentPlayer && (
            <div className="w-full overflow-x-auto">
              <div className="flex justify-center">
                <div className="transform scale-[0.55] sm:scale-70 md:scale-85 lg:scale-100 origin-top">
                  <TurkishPlayerRack
                    tiles={currentPlayer.tiles}
                    rackLayout={rackLayout}
                    okeyTile={game.okeyTile}
                    selectedTileId={selectedTileId}
                    onTileSelect={onTileSelect}
                    onTileMove={onTileMove}
                    onSortByGroups={onSortByGroups}
                    onSortByRuns={onSortByRuns}
                    isCurrentPlayer={isMyTurn}
                    canSelect={game.turnPhase === 'discard'}
                    canRearrange={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom-right - My discard area (next player picks from here) */}
        <div className="flex items-start justify-start p-1">
          {/* After I discard, my tile goes here */}
          <div className="w-8 h-10 rounded border border-dashed border-amber-600/30 flex items-center justify-center">
            <span className="text-[7px] text-amber-500/50">AT</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TurkishGameBoard;
