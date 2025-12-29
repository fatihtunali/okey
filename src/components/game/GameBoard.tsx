'use client';

import { GameState, Tile as TileType } from '@/lib/game/types';
import { PlayerRack } from './PlayerRack';
import { TileStack, IndicatorTile, DiscardPile } from './Tile';
import { cn } from '@/lib/utils';

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

// Compact opponent tile display - same size for all positions
function OpponentTiles({
  tileCount,
  playerName,
  isCurrentTurn,
  position,
  thinkingText,
}: {
  tileCount: number;
  playerName: string;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right';
  thinkingText?: string;
}) {
  const isVertical = position === 'left' || position === 'right';
  const visibleTiles = Math.min(tileCount, 14);

  return (
    <div className={cn(
      'flex items-center gap-1 sm:gap-2',
      isVertical ? 'flex-col' : 'flex-row',
      position === 'right' && !isVertical && 'flex-row-reverse'
    )}>
      {/* Player info */}
      <div className={cn(
        'flex items-center gap-1 sm:gap-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2',
        'bg-gray-800/90 border border-gray-700',
        isCurrentTurn && 'ring-2 ring-green-400 border-green-500',
        isVertical && 'flex-col'
      )}>
        <div className={cn(
          'w-6 h-6 sm:w-8 sm:h-8 rounded-full',
          'bg-gradient-to-br from-blue-400 to-blue-600',
          'flex items-center justify-center',
          'text-white font-bold text-xs sm:text-sm'
        )}>
          {playerName.charAt(0)}
        </div>
        <div className="text-center">
          <div className="text-white font-bold text-[10px] sm:text-xs truncate max-w-[60px] sm:max-w-[80px]">
            {playerName}
          </div>
          <div className={cn(
            'text-[8px] sm:text-[10px] font-bold',
            isCurrentTurn ? 'text-green-400' : 'text-gray-400'
          )}>
            {thinkingText || `${tileCount} taş`}
          </div>
        </div>
      </div>

      {/* Mini tiles */}
      <div className={cn(
        'flex gap-px sm:gap-0.5 p-1 sm:p-1.5 rounded',
        'bg-amber-700/80 border border-amber-600',
        isVertical && 'flex-wrap justify-center max-w-[50px] sm:max-w-[70px]'
      )}>
        {Array.from({ length: visibleTiles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm',
              'bg-gradient-to-b from-sky-500 to-sky-600',
              'border border-sky-400/50',
              isVertical
                ? 'w-2 h-3 sm:w-3 sm:h-4'
                : 'w-3 h-4 sm:w-4 sm:h-5'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function GameBoard({
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
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);
  const currentPlayer = game.players[currentPlayerIndex];

  // Calculate opponent positions relative to current player (always show as 4-player layout)
  const getOpponentPosition = (index: number): 'left' | 'top' | 'right' | null => {
    const relativeIndex = (index - currentPlayerIndex + game.players.length) % game.players.length;
    if (relativeIndex === 0) return null;

    if (game.players.length === 2) {
      return 'top';
    } else if (game.players.length === 3) {
      if (relativeIndex === 1) return 'left';
      if (relativeIndex === 2) return 'right';
    } else if (game.players.length === 4) {
      if (relativeIndex === 1) return 'left';
      if (relativeIndex === 2) return 'top';
      if (relativeIndex === 3) return 'right';
    }
    return null;
  };

  const isMyTurn = game.currentTurn === currentPlayerIndex;
  const canDraw = isMyTurn && game.turnPhase === 'draw';
  const canDiscard = isMyTurn && game.turnPhase === 'discard' && selectedTileId;

  // Get opponents by position
  const leftOpponent = game.players.find((_, i) => getOpponentPosition(i) === 'left');
  const topOpponent = game.players.find((_, i) => getOpponentPosition(i) === 'top');
  const rightOpponent = game.players.find((_, i) => getOpponentPosition(i) === 'right');

  const getOpponentIndex = (player: typeof leftOpponent) =>
    player ? game.players.findIndex(p => p.id === player.id) : -1;

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col">
      {/* Timer bar */}
      <div className="h-2 sm:h-3 bg-gray-900 flex-shrink-0">
        <div
          className={cn(
            'h-full transition-all duration-1000 rounded-r-full',
            timeRemaining > 10
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-red-400 to-red-500 animate-pulse'
          )}
          style={{ width: `${(timeRemaining / 30) * 100}%` }}
        />
      </div>

      {/* Game Area - CSS Grid Layout */}
      <div className="flex-1 grid grid-rows-[auto_1fr_auto] p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">

        {/* Top opponent */}
        <div className="flex justify-center">
          {topOpponent && (
            <OpponentTiles
              tileCount={topOpponent.tiles.length}
              playerName={topOpponent.name}
              isCurrentTurn={game.currentTurn === getOpponentIndex(topOpponent)}
              position="top"
              thinkingText={game.currentTurn === getOpponentIndex(topOpponent) && isProcessingAI ? "Düşünüyor..." : undefined}
            />
          )}
        </div>

        {/* Middle row: Left opponent - Center table - Right opponent */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {/* Left opponent */}
          <div className="flex-shrink-0">
            {leftOpponent && (
              <OpponentTiles
                tileCount={leftOpponent.tiles.length}
                playerName={leftOpponent.name}
                isCurrentTurn={game.currentTurn === getOpponentIndex(leftOpponent)}
                position="left"
                thinkingText={game.currentTurn === getOpponentIndex(leftOpponent) && isProcessingAI ? "Düşünüyor..." : undefined}
              />
            )}
          </div>

          {/* Center table */}
          <div className={cn(
            'relative rounded-xl p-3 sm:p-6',
            'bg-gradient-to-b from-green-800 via-green-900 to-green-950',
            'border-2 sm:border-4 border-green-700',
            'shadow-xl',
            'flex-shrink-0'
          )}>
            {/* Table items */}
            <div className="flex items-start justify-center gap-3 sm:gap-6">
              {/* Draw pile */}
              <div className="flex flex-col items-center">
                <div className="text-[8px] sm:text-xs text-amber-400 font-bold mb-1">DESTE</div>
                <TileStack
                  count={game.tileBag.length}
                  size="sm"
                  onClick={onDrawFromPile}
                  canClick={canDraw}
                />
              </div>

              {/* Indicator tile */}
              {game.indicatorTile && game.okeyTile && (
                <div className="scale-75 sm:scale-100 origin-top">
                  <IndicatorTile
                    tile={game.indicatorTile}
                    okeyTile={game.okeyTile}
                  />
                </div>
              )}

              {/* Discard pile */}
              <div className="scale-75 sm:scale-100 origin-top">
                <DiscardPile
                  tiles={game.discardPile}
                  okeyTile={game.okeyTile}
                  onClickTop={onDrawFromDiscard}
                  canClickTop={canDraw}
                />
              </div>
            </div>

            {/* Turn indicator */}
            {isProcessingAI && !isMyTurn && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-amber-500 text-amber-950 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold animate-pulse">
                  Rakip düşünüyor...
                </div>
              </div>
            )}

            {/* Draw hint */}
            {canDraw && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-green-500 text-green-950 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold animate-bounce">
                  Taş Çekin!
                </div>
              </div>
            )}
          </div>

          {/* Right opponent */}
          <div className="flex-shrink-0">
            {rightOpponent && (
              <OpponentTiles
                tileCount={rightOpponent.tiles.length}
                playerName={rightOpponent.name}
                isCurrentTurn={game.currentTurn === getOpponentIndex(rightOpponent)}
                position="right"
                thinkingText={game.currentTurn === getOpponentIndex(rightOpponent) && isProcessingAI ? "Düşünüyor..." : undefined}
              />
            )}
          </div>
        </div>

        {/* Bottom - Current player area */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Action buttons */}
          <div className="flex justify-center gap-2 sm:gap-4">
            {canDraw && (
              <button
                onClick={onDrawFromPile}
                className={cn(
                  'px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg',
                  'bg-gradient-to-b from-green-500 to-green-700',
                  'hover:from-green-400 hover:to-green-600',
                  'text-white border-2 border-green-400',
                  'transition-all hover:scale-105 active:scale-95',
                  'shadow-lg'
                )}
              >
                🎴 Taş Çek
              </button>
            )}
            {canDiscard && (
              <button
                onClick={onDiscard}
                className={cn(
                  'px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg',
                  'bg-gradient-to-b from-red-500 to-red-700',
                  'hover:from-red-400 hover:to-red-600',
                  'text-white border-2 border-red-400',
                  'transition-all hover:scale-105 active:scale-95',
                  'shadow-lg'
                )}
              >
                TAŞI AT
              </button>
            )}
            {canDiscard && currentPlayer.tiles.length === 15 && (
              <button
                onClick={onDeclareWin}
                className={cn(
                  'px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg',
                  'bg-gradient-to-b from-amber-500 to-amber-700',
                  'hover:from-amber-400 hover:to-amber-600',
                  'text-white border-2 border-amber-400',
                  'transition-all hover:scale-105 active:scale-95',
                  'shadow-lg animate-pulse'
                )}
              >
                BİTİR!
              </button>
            )}
          </div>

          {/* Player info bar */}
          {currentPlayer && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 sm:gap-4 bg-gray-800/90 rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 border border-gray-700">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm sm:text-xl border-2 border-amber-300">
                  {currentPlayer.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold text-sm sm:text-lg">{currentPlayer.name}</div>
                  <div className={cn(
                    'text-xs sm:text-sm font-bold',
                    isMyTurn ? 'text-green-400' : 'text-gray-500'
                  )}>
                    {isMyTurn ? (canDraw ? 'Taş çek!' : 'Taş at!') : 'Bekle...'}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-700/80 text-amber-400 text-sm sm:text-lg font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
                  <span>Okey:</span>
                  {game.okeyTile && (
                    <span className={cn(
                      'font-black',
                      game.okeyTile.color === 'red' && 'text-red-500',
                      game.okeyTile.color === 'blue' && 'text-blue-500',
                      game.okeyTile.color === 'yellow' && 'text-amber-500',
                      game.okeyTile.color === 'black' && 'text-gray-300',
                    )}>
                      {game.okeyTile.number}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Player rack */}
          {currentPlayer && (
            <div className="flex justify-center overflow-x-auto pb-2">
              <div className="transform scale-75 sm:scale-90 md:scale-100 origin-top">
                <PlayerRack
                  tiles={currentPlayer.tiles}
                  rackLayout={rackLayout}
                  okeyTile={game.okeyTile}
                  selectedTileId={selectedTileId}
                  onTileSelect={onTileSelect}
                  onTileMove={onTileMove}
                  onSortByGroups={onSortByGroups}
                  onSortByRuns={onSortByRuns}
                  isCurrentPlayer={isMyTurn}
                  canSelect={isMyTurn && game.turnPhase === 'discard'}
                  canRearrange={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
