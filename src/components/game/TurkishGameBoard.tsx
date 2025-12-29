'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TurkishTile, TileStack, IndicatorTile, DiscardPile } from './TurkishTile';
import { TurkishPlayerRack, TurkishOpponentRack } from './TurkishRack';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH GAME BOARD - Kahvehane Experience
// Mobile-responsive design with CSS Grid layout
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
  // Find current player and their tiles
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);

  // Calculate opponent positions (relative to current player)
  const opponents = useMemo(() => {
    const positions: ('top' | 'left' | 'right')[] = ['left', 'top', 'right'];
    const result: { player: typeof game.players[0]; position: 'top' | 'left' | 'right' }[] = [];

    let posIndex = 0;
    for (let i = 1; i < game.players.length; i++) {
      const playerIndex = (currentPlayerIndex + i) % game.players.length;
      if (playerIndex !== currentPlayerIndex && posIndex < 3) {
        result.push({
          player: game.players[playerIndex],
          position: positions[posIndex],
        });
        posIndex++;
      }
    }

    return result;
  }, [game.players, currentPlayerIndex]);

  // Game state checks
  const isMyTurn = game.currentTurn === currentPlayerIndex;
  const canDraw = isMyTurn && game.turnPhase === 'draw' && !isProcessingAI;
  const canDiscard = isMyTurn && game.turnPhase === 'discard' && selectedTileId && !isProcessingAI;

  // Timer calculations
  const timerPercentage = (timeRemaining / (game.turnTimeLimit || 30)) * 100;
  const isTimeLow = timeRemaining <= 10;
  const isTimeCritical = timeRemaining <= 5;

  // Get opponent at specific position
  const getOpponent = (pos: 'left' | 'top' | 'right') =>
    opponents.find(o => o.position === pos);

  const leftOpponent = getOpponent('left');
  const topOpponent = getOpponent('top');
  const rightOpponent = getOpponent('right');

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col overflow-hidden">
      {/* ============================================
          TIMER BAR - Top of screen
          ============================================ */}
      <div className="h-1.5 sm:h-2 bg-stone-900/80 flex-shrink-0">
        <motion.div
          className={cn(
            'h-full rounded-r-full',
            isTimeCritical
              ? 'bg-gradient-to-r from-red-600 to-red-400'
              : isTimeLow
              ? 'bg-gradient-to-r from-orange-600 to-yellow-400'
              : 'bg-gradient-to-r from-green-600 to-emerald-400'
          )}
          initial={false}
          animate={{ width: `${timerPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* ============================================
          MAIN GAME AREA - CSS Grid Layout
          ============================================ */}
      <div className="flex-1 grid grid-rows-[auto_1fr_auto] p-1.5 sm:p-3 md:p-4 gap-1.5 sm:gap-3 overflow-hidden">

        {/* ============================================
            TOP OPPONENT ROW
            ============================================ */}
        <div className="flex justify-center">
          {topOpponent && (
            <TurkishOpponentRack
              tileCount={topOpponent.player.tiles.length}
              playerName={topOpponent.player.name}
              isCurrentTurn={game.currentTurn === game.players.indexOf(topOpponent.player)}
              isAI={topOpponent.player.isAI}
              position="top"
              thinkingText={
                isProcessingAI && game.currentTurn === game.players.indexOf(topOpponent.player)
                  ? 'Düşünüyor...'
                  : undefined
              }
            />
          )}
        </div>

        {/* ============================================
            MIDDLE ROW: Left - Center Table - Right
            ============================================ */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4">
          {/* Left opponent */}
          <div className="flex-shrink-0">
            {leftOpponent && (
              <TurkishOpponentRack
                tileCount={leftOpponent.player.tiles.length}
                playerName={leftOpponent.player.name}
                isCurrentTurn={game.currentTurn === game.players.indexOf(leftOpponent.player)}
                isAI={leftOpponent.player.isAI}
                position="left"
                thinkingText={
                  isProcessingAI && game.currentTurn === game.players.indexOf(leftOpponent.player)
                    ? 'Düşünüyor...'
                    : undefined
                }
              />
            )}
          </div>

          {/* Center table */}
          <div className={cn(
            'relative rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-4 md:p-6',
            'bg-gradient-to-b from-green-800 via-green-900 to-green-950',
            'border-2 sm:border-3 md:border-4 border-amber-700',
            'shadow-xl',
            'flex-shrink-0'
          )}>
            {/* Felt texture */}
            <div className="absolute inset-0 felt-texture opacity-30 rounded-lg sm:rounded-xl md:rounded-2xl" />

            {/* Table items */}
            <div className="relative flex items-start justify-center gap-2 sm:gap-4 md:gap-6">
              {/* Draw pile */}
              <div className="flex flex-col items-center">
                <div className="text-[7px] sm:text-[9px] md:text-xs text-amber-400 font-bold mb-0.5 sm:mb-1">DESTE</div>
                <div className="scale-[0.6] sm:scale-75 md:scale-100 origin-top">
                  <TileStack
                    count={game.tileBag.length}
                    size="md"
                    onClick={onDrawFromPile}
                    canClick={canDraw}
                  />
                </div>
              </div>

              {/* Indicator tile */}
              {game.indicatorTile && game.okeyTile && (
                <div className="scale-[0.6] sm:scale-75 md:scale-100 origin-top">
                  <IndicatorTile
                    tile={game.indicatorTile}
                    okeyTile={game.okeyTile}
                  />
                </div>
              )}

              {/* Discard pile */}
              <div className="scale-[0.6] sm:scale-75 md:scale-100 origin-top">
                <DiscardPile
                  tiles={game.discardPile}
                  okeyTile={game.okeyTile}
                  onClickTop={onDrawFromDiscard}
                  canClickTop={canDraw && game.discardPile.length > 0}
                />
              </div>
            </div>

            {/* Draw hint */}
            {canDraw && (
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-green-500 text-green-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold animate-bounce">
                  Taş Çek!
                </div>
              </div>
            )}

            {/* AI thinking indicator */}
            {isProcessingAI && !isMyTurn && (
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-amber-500 text-amber-950 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold animate-pulse">
                  Rakip düşünüyor...
                </div>
              </div>
            )}
          </div>

          {/* Right opponent */}
          <div className="flex-shrink-0">
            {rightOpponent && (
              <TurkishOpponentRack
                tileCount={rightOpponent.player.tiles.length}
                playerName={rightOpponent.player.name}
                isCurrentTurn={game.currentTurn === game.players.indexOf(rightOpponent.player)}
                isAI={rightOpponent.player.isAI}
                position="right"
                thinkingText={
                  isProcessingAI && game.currentTurn === game.players.indexOf(rightOpponent.player)
                    ? 'Düşünüyor...'
                    : undefined
                }
              />
            )}
          </div>
        </div>

        {/* ============================================
            BOTTOM - Current player area
            ============================================ */}
        <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3">
          {/* Action buttons */}
          <div className="flex justify-center gap-1.5 sm:gap-3 md:gap-4">
            {canDraw && (
              <button
                onClick={onDrawFromPile}
                className={cn(
                  'px-3 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-lg',
                  'bg-gradient-to-b from-green-500 to-green-700',
                  'hover:from-green-400 hover:to-green-600',
                  'text-white border sm:border-2 border-green-400',
                  'transition-all hover:scale-105 active:scale-95',
                  'shadow-lg'
                )}
              >
                Taş Çek
              </button>
            )}
            {canDiscard && (
              <button
                onClick={onDiscard}
                className={cn(
                  'px-3 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-lg',
                  'bg-gradient-to-b from-red-500 to-red-700',
                  'hover:from-red-400 hover:to-red-600',
                  'text-white border sm:border-2 border-red-400',
                  'transition-all hover:scale-105 active:scale-95',
                  'shadow-lg'
                )}
              >
                TAŞI AT
              </button>
            )}
            {canDiscard && currentPlayer && currentPlayer.tiles.length === 15 && (
              <button
                onClick={onDeclareWin}
                className={cn(
                  'px-3 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-lg',
                  'bg-gradient-to-b from-amber-500 to-amber-700',
                  'hover:from-amber-400 hover:to-amber-600',
                  'text-white border sm:border-2 border-amber-400',
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
              <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 bg-stone-900/80 rounded-lg sm:rounded-xl px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-amber-600/30 backdrop-blur-sm">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base border sm:border-2 border-amber-400">
                  {currentPlayer.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-amber-200 font-medium text-xs sm:text-sm md:text-base">{currentPlayer.name}</div>
                  <div className={cn(
                    'text-[10px] sm:text-xs md:text-sm font-bold',
                    isMyTurn ? 'text-green-400' : 'text-amber-400/70'
                  )}>
                    {isMyTurn ? (canDraw ? 'Taş çek!' : 'Taş at!') : `${currentPlayer.tiles.length} taş`}
                  </div>
                </div>
                {game.okeyTile && (
                  <div className="flex items-center gap-1 bg-stone-800/80 text-amber-400 text-[10px] sm:text-xs md:text-sm font-bold px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                    <span>Okey:</span>
                    <span className={cn(
                      'font-black',
                      game.okeyTile.color === 'red' && 'text-red-500',
                      game.okeyTile.color === 'blue' && 'text-blue-500',
                      game.okeyTile.color === 'yellow' && 'text-amber-500',
                      game.okeyTile.color === 'black' && 'text-gray-300',
                    )}>
                      {game.okeyTile.number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Player's rack */}
          {currentPlayer && (
            <div className="flex justify-center overflow-x-auto pb-1 sm:pb-2">
              <div className="transform scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
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
          )}
        </div>
      </div>

      {/* ============================================
          AI THINKING OVERLAY
          ============================================ */}
      <AnimatePresence>
        {isProcessingAI && !isMyTurn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center z-30 pointer-events-none"
          >
            <div className="bg-stone-900/90 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-amber-500/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-amber-500 border-t-transparent rounded-full"
                />
                <span className="text-amber-200 font-medium text-sm sm:text-base">Rakip düşünüyor...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TurkishGameBoard;
