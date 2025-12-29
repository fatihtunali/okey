'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TurkishTile } from './TurkishTile';
import { TurkishPlayerRack } from './TurkishRack';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH GAME BOARD - Real Okey Table Layout
// Top-down view with 4 wooden racks framing
// the green felt table surface
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

// Opponent rack - wooden holder with tile backs
function OpponentRack({
  player,
  tileCount,
  isCurrentTurn,
  isThinking,
  position,
}: {
  player: { name: string; isAI: boolean };
  tileCount: number;
  isCurrentTurn: boolean;
  isThinking: boolean;
  position: 'top' | 'left' | 'right';
}) {
  const isVertical = position === 'left' || position === 'right';
  const displayTiles = Math.min(tileCount, 15);

  return (
    <div className={cn(
      'flex flex-col items-center gap-1',
      isVertical && 'flex-row'
    )}>
      {/* Player name badge */}
      <div className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded text-[10px]',
        'bg-stone-800/90 border',
        isCurrentTurn ? 'border-green-500 text-green-400' : 'border-stone-600 text-stone-300'
      )}>
        <span className="font-bold truncate max-w-[60px]">{player.name}</span>
        {isThinking && <span className="animate-pulse">...</span>}
      </div>

      {/* Wooden rack with tile backs */}
      <div className={cn(
        'relative p-1 rounded',
        'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800',
        'border-2 border-amber-900',
        'shadow-lg',
        isCurrentTurn && 'ring-2 ring-green-400',
        isVertical ? 'flex-col' : 'flex-row'
      )}>
        {/* Wood grain texture */}
        <div className="absolute inset-0 opacity-20 rounded"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
          }}
        />

        {/* Tiles container */}
        <div className={cn(
          'relative flex gap-px',
          isVertical ? 'flex-col' : 'flex-row'
        )}>
          {Array.from({ length: displayTiles }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-sm shadow-sm',
                'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100',
                'border border-amber-200',
                isVertical ? 'w-4 h-5' : 'w-5 h-6'
              )}
            >
              {/* Tile back pattern */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-300/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Tile count indicator */}
        <div className={cn(
          'absolute text-[8px] font-bold text-amber-200 bg-amber-900/80 px-1 rounded',
          isVertical ? '-right-4 top-1/2 -translate-y-1/2' : '-bottom-4 left-1/2 -translate-x-1/2'
        )}>
          {tileCount}
        </div>
      </div>
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

  // Get opponents in order: left, top, right
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

  // Last discarded tile
  const lastDiscarded = game.discardPile.length > 0 ? game.discardPile[game.discardPile.length - 1] : null;

  return (
    <div className="w-full h-full min-h-screen bg-stone-800 flex flex-col p-2">
      {/* Timer bar */}
      <div className="h-1 bg-stone-900 rounded-full mb-2 flex-shrink-0">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            isTimeLow ? 'bg-red-500' : 'bg-green-500'
          )}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Main table container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-2xl aspect-square">

          {/* Green felt table surface */}
          <div className={cn(
            'absolute inset-8 sm:inset-12 md:inset-16',
            'bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900',
            'rounded-lg border-4 border-amber-800',
            'shadow-2xl'
          )}>
            {/* Felt texture */}
            <div className="absolute inset-0 opacity-30 rounded-lg"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }}
            />

            {/* Center content - Draw pile, Indicator, Discards */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                {/* Draw pile and Indicator */}
                <div className="flex items-end gap-3">
                  {/* Draw pile */}
                  <button
                    onClick={onDrawFromPile}
                    disabled={!canDraw}
                    className={cn(
                      'relative flex flex-col items-center',
                      canDraw && 'cursor-pointer hover:scale-105 transition-transform'
                    )}
                  >
                    <span className="text-[8px] text-amber-300 font-bold mb-1">DESTE</span>
                    <div className="relative">
                      {/* Stacked tiles effect */}
                      <div className="absolute -bottom-1 -right-1 w-10 h-12 bg-amber-800 rounded" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-10 h-12 bg-amber-700 rounded" />
                      <div className="w-10 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded border border-amber-300 flex items-center justify-center shadow-md">
                        <span className="text-amber-800 font-bold text-sm">{game.tileBag.length}</span>
                      </div>
                    </div>
                    {canDraw && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  {/* Indicator tile */}
                  {game.indicatorTile && (
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-amber-300 font-bold mb-1">GÖSTERGE</span>
                      <TurkishTile tile={game.indicatorTile} size="md" />
                    </div>
                  )}
                </div>

                {/* Discarded tiles area */}
                <div className="relative min-w-[80px] min-h-[50px] flex items-center justify-center">
                  {lastDiscarded ? (
                    <button
                      onClick={onDrawFromDiscard}
                      disabled={!canDraw}
                      className={cn(
                        'relative',
                        canDraw && 'cursor-pointer hover:scale-110 transition-transform ring-2 ring-green-400 rounded'
                      )}
                    >
                      <TurkishTile tile={lastDiscarded} okeyTile={game.okeyTile} size="md" />
                      {canDraw && (
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-green-400 font-bold whitespace-nowrap">
                          Tıkla al
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="text-[10px] text-emerald-600/50 italic">Atılan taşlar</div>
                  )}
                </div>

                {/* AI thinking indicator */}
                {isProcessingAI && !isMyTurn && (
                  <div className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    Rakip düşünüyor...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOP opponent rack */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            {topOpp && (
              <OpponentRack
                player={topOpp.player}
                tileCount={topOpp.player.tiles.length}
                isCurrentTurn={game.currentTurn === topOpp.index}
                isThinking={isProcessingAI && game.currentTurn === topOpp.index}
                position="top"
              />
            )}
          </div>

          {/* LEFT opponent rack */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            {leftOpp && (
              <OpponentRack
                player={leftOpp.player}
                tileCount={leftOpp.player.tiles.length}
                isCurrentTurn={game.currentTurn === leftOpp.index}
                isThinking={isProcessingAI && game.currentTurn === leftOpp.index}
                position="left"
              />
            )}
          </div>

          {/* RIGHT opponent rack */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {rightOpp && (
              <OpponentRack
                player={rightOpp.player}
                tileCount={rightOpp.player.tiles.length}
                isCurrentTurn={game.currentTurn === rightOpp.index}
                isThinking={isProcessingAI && game.currentTurn === rightOpp.index}
                position="right"
              />
            )}
          </div>

          {/* BOTTOM - Current player */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full px-4">
            {/* Action buttons */}
            <div className="flex justify-center gap-2 mb-1">
              {canDraw && (
                <button
                  onClick={onDrawFromPile}
                  className="px-3 py-1 text-xs font-bold rounded bg-green-600 hover:bg-green-500 text-white shadow"
                >
                  Çek
                </button>
              )}
              {canDiscard && (
                <>
                  <button
                    onClick={onDiscard}
                    className="px-3 py-1 text-xs font-bold rounded bg-red-600 hover:bg-red-500 text-white shadow"
                  >
                    At
                  </button>
                  {currentPlayer && currentPlayer.tiles.length === 15 && (
                    <button
                      onClick={onDeclareWin}
                      className="px-3 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white shadow animate-pulse"
                    >
                      Bitir!
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Player info */}
            {currentPlayer && (
              <div className="flex justify-center mb-1">
                <div className="flex items-center gap-2 px-2 py-0.5 bg-stone-900/80 rounded text-[10px]">
                  <span className="text-amber-200 font-bold">{currentPlayer.name}</span>
                  <span className={isMyTurn ? 'text-green-400' : 'text-stone-400'}>
                    {isMyTurn ? (canDraw ? 'Taş çek' : 'Taş at') : 'Bekle'}
                  </span>
                  {game.okeyTile && (
                    <span className={cn(
                      'font-bold',
                      game.okeyTile.color === 'red' && 'text-red-400',
                      game.okeyTile.color === 'blue' && 'text-blue-400',
                      game.okeyTile.color === 'yellow' && 'text-amber-400',
                      game.okeyTile.color === 'black' && 'text-gray-300',
                    )}>
                      Okey: {game.okeyTile.number}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Player's rack */}
            {currentPlayer && (
              <div className="overflow-x-auto">
                <div className="flex justify-center">
                  <div className="transform scale-[0.5] sm:scale-[0.65] md:scale-[0.8] lg:scale-100 origin-top">
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
        </div>
      </div>

      {/* Exit button */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-2 left-2 px-2 py-1 text-xs bg-stone-900/80 text-amber-400 rounded hover:bg-stone-800"
      >
        ← Çıkış
      </button>
    </div>
  );
});

export default TurkishGameBoard;
