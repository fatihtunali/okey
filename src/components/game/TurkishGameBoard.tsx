'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TurkishTile, TileStack, IndicatorTile, DiscardPile } from './TurkishTile';
import { TurkishPlayerRack, TurkishOpponentRack } from './TurkishRack';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH GAME BOARD - Kahvehane Experience
// Authentic Turkish coffeehouse atmosphere with
// felt table, brass accents, and warm lighting
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
    const positions: ('top' | 'left' | 'right')[] = ['top', 'left', 'right'];
    const result: { player: typeof game.players[0]; position: 'top' | 'left' | 'right' }[] = [];

    let posIndex = 0;
    for (let i = 0; i < game.players.length; i++) {
      const playerIndex = (currentPlayerIndex + 1 + i) % game.players.length;
      if (playerIndex !== currentPlayerIndex) {
        result.push({
          player: game.players[playerIndex],
          position: positions[posIndex] || 'top',
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
    <div className="relative w-full min-h-[700px] flex flex-col">
      {/* Ambient lighting overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-amber-900/30 pointer-events-none z-10" />

      {/* ============================================
          TIMER BAR - Top of screen
          ============================================ */}
      <div className="relative h-2 bg-stone-900/80 rounded-full overflow-hidden mx-4 mt-2 mb-4">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
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
        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-xs font-bold',
              isTimeCritical ? 'text-red-300' : 'text-white/80'
            )}
          >
            {isMyTurn ? `${timeRemaining}s` : ''}
          </span>
        </div>
      </div>

      {/* ============================================
          MAIN GAME TABLE
          ============================================ */}
      <div className="flex-1 relative px-4">
        {/* Felt table surface */}
        <div
          className={cn(
            'absolute inset-4 rounded-3xl overflow-hidden',
            'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950',
            'border-8 border-amber-800',
            'shadow-2xl'
          )}
        >
          {/* Inner border - brass rim */}
          <div className="absolute inset-0 rounded-2xl border-4 border-amber-600/30" />

          {/* Felt texture */}
          <div className="absolute inset-0 felt-texture opacity-50" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 ottoman-pattern opacity-10" />
        </div>

        {/* ============================================
            OPPONENT POSITIONS
            ============================================ */}

        {/* Top opponent */}
        {topOpponent && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
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
          </div>
        )}

        {/* Left opponent */}
        {leftOpponent && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20">
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
          </div>
        )}

        {/* Right opponent */}
        {rightOpponent && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
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
          </div>
        )}

        {/* ============================================
            CENTER TABLE - Draw pile, Indicator, Discard
            ============================================ */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-8">
            {/* Draw pile */}
            <TileStack
              count={game.tileBag.length}
              size="lg"
              onClick={onDrawFromPile}
              canClick={canDraw}
            />

            {/* Indicator tile */}
            {game.indicatorTile && game.okeyTile && (
              <IndicatorTile
                tile={game.indicatorTile}
                okeyTile={game.okeyTile}
              />
            )}

            {/* Discard pile */}
            <DiscardPile
              tiles={game.discardPile}
              okeyTile={game.okeyTile}
              onClickTop={onDrawFromDiscard}
              canClickTop={canDraw && game.discardPile.length > 0}
            />
          </div>
        </div>

        {/* ============================================
            TURKISH TEA DECORATION (Atmosphere)
            ============================================ */}
        <div className="absolute bottom-8 right-8 z-0 opacity-40 pointer-events-none">
          <div className="relative">
            {/* Tea glass */}
            <div className="w-6 h-10 bg-gradient-to-b from-amber-600/60 to-amber-800/60 rounded-b-lg border-2 border-amber-500/30" />
            {/* Tea saucer */}
            <div className="w-10 h-2 bg-amber-700/40 rounded-full -mt-1 mx-auto" />
            {/* Steam effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white/30 tea-steam">~</div>
          </div>
        </div>
      </div>

      {/* ============================================
          ACTION BUTTONS & PLAYER RACK (Bottom)
          ============================================ */}
      <div className="relative z-20 px-4 pb-4 space-y-4">
        {/* Turn indicator and action buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Turn indicator */}
          <AnimatePresence mode="wait">
            {isMyTurn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'px-4 py-2 rounded-full font-bold',
                  'bg-gradient-to-r from-green-600 to-green-500',
                  'text-white shadow-lg',
                  'border-2 border-green-400'
                )}
              >
                {game.turnPhase === 'draw' ? '🃏 Taş Çekin' : '📤 Taş Atın'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Discard button */}
          <motion.button
            onClick={onDiscard}
            disabled={!canDiscard}
            className={cn(
              'px-6 py-3 rounded-xl font-bold text-lg',
              'transition-all duration-200',
              canDiscard
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-red-400'
                : 'bg-stone-700 text-stone-400 cursor-not-allowed border-2 border-stone-600'
            )}
            whileHover={canDiscard ? { scale: 1.05 } : {}}
            whileTap={canDiscard ? { scale: 0.95 } : {}}
          >
            TAŞI AT
          </motion.button>

          {/* Win button */}
          <motion.button
            onClick={onDeclareWin}
            disabled={!canDiscard}
            className={cn(
              'px-6 py-3 rounded-xl font-bold text-lg',
              'transition-all duration-200',
              canDiscard
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-amber-400'
                : 'bg-stone-700 text-stone-400 cursor-not-allowed border-2 border-stone-600'
            )}
            whileHover={canDiscard ? { scale: 1.05 } : {}}
            whileTap={canDiscard ? { scale: 0.95 } : {}}
          >
            BİTİR
          </motion.button>
        </div>

        {/* Player info bar */}
        <div className="flex items-center justify-center gap-4">
          {/* Avatar and name */}
          <div className="flex items-center gap-3 px-4 py-2 bg-stone-900/80 rounded-xl backdrop-blur-sm border border-amber-600/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold border-2 border-amber-400">
              {currentPlayer?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="text-amber-200 font-medium">{currentPlayer?.name}</div>
              <div className="text-amber-400/70 text-sm">{currentPlayer?.tiles.length} taş</div>
            </div>
          </div>

          {/* Okey info badge */}
          {game.okeyTile && (
            <div className="flex items-center gap-2 px-4 py-2 bg-stone-900/80 rounded-xl backdrop-blur-sm border border-amber-600/30">
              <span className="text-amber-300 text-sm">Okey:</span>
              <TurkishTile tile={game.okeyTile} size="sm" />
            </div>
          )}
        </div>

        {/* Player's rack */}
        <TurkishPlayerRack
          tiles={currentPlayer?.tiles || []}
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
            <div className="bg-stone-900/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-amber-500/30">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"
                />
                <span className="text-amber-200 font-medium">Rakip düşünüyor...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TurkishGameBoard;
