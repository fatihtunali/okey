'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TurkishTile } from './TurkishTile';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH OKEY GAME BOARD - 101 Okey Plus Style
// Clean, functional horizontal layout
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

// ============================================
// OPPONENT SIDE BAR - Simple vertical bar
// ============================================
interface OpponentBarProps {
  player: { name: string; isAI: boolean; tiles: TileType[] };
  isCurrentTurn: boolean;
  isThinking?: boolean;
  position: 'left' | 'right';
  lastDiscard?: TileType | null;
  okeyTile?: TileType | null;
}

function OpponentBar({
  player,
  isCurrentTurn,
  isThinking,
  position,
  lastDiscard,
  okeyTile,
}: OpponentBarProps) {
  return (
    <div className={cn(
      'flex flex-col items-center h-full py-4',
      'w-20 md:w-24',
    )}>
      {/* Player avatar and name */}
      <div className={cn(
        'relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden mb-2',
        'bg-gradient-to-b from-gray-700 to-gray-900',
        'border-2',
        isCurrentTurn ? 'border-green-400' : 'border-gray-600'
      )}>
        {/* Avatar placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-2xl">
            {player.isAI ? '🤖' : '👤'}
          </span>
        </div>
        {/* Turn indicator */}
        {isCurrentTurn && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Player name */}
      <div className={cn(
        'px-2 py-1 rounded text-xs font-bold text-center truncate w-full',
        'bg-gray-800/80',
        isCurrentTurn ? 'text-green-400' : 'text-white'
      )}>
        {player.name}
      </div>

      {/* Tile count */}
      <div className="text-xs text-gray-400 mt-1">
        {player.tiles.length} taş
      </div>

      {/* Thinking indicator */}
      {isThinking && (
        <div className="mt-2 text-xs text-yellow-400 animate-pulse">
          Düşünüyor...
        </div>
      )}

      {/* Discard area - vertical bar */}
      <div className={cn(
        'flex-1 w-10 md:w-12 mt-4 rounded-lg',
        'bg-gray-900/60 border border-gray-700',
        'flex flex-col items-center justify-end pb-2'
      )}>
        {lastDiscard && (
          <div className="transform scale-75">
            <TurkishTile tile={lastDiscard} okeyTile={okeyTile} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PLAYER RACK - Golden wooden rack with 2 rows
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
}: PlayerRackProps) {
  const tileMap = tiles.reduce((acc, tile) => {
    acc[tile.id] = tile;
    return acc;
  }, {} as Record<string, TileType>);

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex && onTileMove) {
      onTileMove(fromIndex, toIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const renderSlot = (index: number) => {
    const tileId = rackLayout[index];
    const tile = tileId ? tileMap[tileId] : null;

    if (tile) {
      return (
        <motion.div
          key={index}
          layout
          className="flex-shrink-0"
        >
          <TurkishTile
            tile={tile}
            okeyTile={okeyTile}
            isSelected={selectedTileId === tile.id}
            size="lg"
            onClick={canSelect ? () => onTileSelect(tile) : undefined}
            draggable
            onDragStart={handleDragStart(index)}
          />
        </motion.div>
      );
    }

    return (
      <div
        key={index}
        className="w-14 h-[72px] rounded border border-amber-700/30 bg-amber-900/20 flex-shrink-0"
        onDrop={handleDrop(index)}
        onDragOver={handleDragOver}
      />
    );
  };

  const topRow = Array.from({ length: 15 }, (_, i) => i);
  const bottomRow = Array.from({ length: 15 }, (_, i) => i + 15);

  return (
    <div className="flex items-center gap-2">
      {/* Left button - ÇİFT DİZ (Sort by groups/pairs) */}
      <button
        onClick={onSortByGroups}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-24 md:w-16 md:h-28 rounded-lg',
          'bg-gradient-to-b from-blue-800 to-blue-900',
          'border-2 border-blue-600',
          'text-white hover:from-blue-700 hover:to-blue-800',
          'transition-all shadow-lg'
        )}
      >
        <span className="text-lg md:text-xl">🃏</span>
        <span className="text-[10px] md:text-xs font-bold mt-1">ÇİFT</span>
        <span className="text-[10px] md:text-xs font-bold">DİZ</span>
      </button>

      {/* Main rack */}
      <div className={cn(
        'flex-1 rounded-lg overflow-hidden',
        'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700',
        'border-4 border-amber-400',
        'shadow-2xl'
      )}>
        {/* Wood grain effect */}
        <div className="relative p-2">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 12px)'
            }}
          />

          {/* Top row */}
          <div className="flex gap-0.5 justify-center mb-1 overflow-x-auto">
            {topRow.map(renderSlot)}
          </div>

          {/* Divider */}
          <div className="h-1 bg-amber-800/50 rounded my-1" />

          {/* Bottom row */}
          <div className="flex gap-0.5 justify-center overflow-x-auto">
            {bottomRow.map(renderSlot)}
          </div>
        </div>
      </div>

      {/* Right button - SERİ DİZ (Sort by runs) */}
      <button
        onClick={onSortByRuns}
        className={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-24 md:w-16 md:h-28 rounded-lg',
          'bg-gradient-to-b from-blue-800 to-blue-900',
          'border-2 border-blue-600',
          'text-white hover:from-blue-700 hover:to-blue-800',
          'transition-all shadow-lg'
        )}
      >
        <span className="text-lg md:text-xl">📊</span>
        <span className="text-[10px] md:text-xs font-bold mt-1">SERİ</span>
        <span className="text-[10px] md:text-xs font-bold">DİZ</span>
      </button>
    </div>
  );
}

// ============================================
// CENTER PLAY AREA
// ============================================
interface CenterAreaProps {
  tileBagCount: number;
  indicatorTile?: TileType | null;
  okeyTile?: TileType | null;
  discardPile: TileType[];
  canDraw: boolean;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
  topOpponent?: { player: { name: string; isAI: boolean; tiles: TileType[] }; isCurrentTurn: boolean; isThinking: boolean } | null;
}

function CenterArea({
  tileBagCount,
  indicatorTile,
  okeyTile,
  discardPile,
  canDraw,
  onDrawFromPile,
  onDrawFromDiscard,
  topOpponent,
}: CenterAreaProps) {
  const lastDiscarded = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top opponent (if exists) */}
      {topOpponent && (
        <div className="flex justify-center py-2">
          <div className={cn(
            'flex items-center gap-3 px-4 py-2 rounded-lg',
            'bg-gray-800/80 border',
            topOpponent.isCurrentTurn ? 'border-green-400' : 'border-gray-600'
          )}>
            <span className="text-xl">{topOpponent.player.isAI ? '🤖' : '👤'}</span>
            <div>
              <div className={cn(
                'font-bold text-sm',
                topOpponent.isCurrentTurn ? 'text-green-400' : 'text-white'
              )}>
                {topOpponent.player.name}
              </div>
              <div className="text-xs text-gray-400">
                {topOpponent.isThinking ? 'Düşünüyor...' : `${topOpponent.player.tiles.length} taş`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main play area */}
      <div className={cn(
        'flex-1 mx-4 rounded-xl',
        'bg-gradient-to-b from-cyan-800/40 to-cyan-900/40',
        'border-2 border-cyan-700/50',
        'relative overflow-hidden'
      )}>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-8">
            {/* Draw pile */}
            <motion.button
              onClick={onDrawFromPile}
              disabled={!canDraw}
              className={cn(
                'flex flex-col items-center',
                canDraw && 'cursor-pointer'
              )}
              whileHover={canDraw ? { scale: 1.05 } : {}}
              whileTap={canDraw ? { scale: 0.95 } : {}}
            >
              {/* Stacked tiles */}
              <div className="relative">
                <div className="absolute -bottom-1 -right-1 w-16 h-20 bg-cyan-900 rounded-lg border border-cyan-700" />
                <div className="absolute -bottom-0.5 -right-0.5 w-16 h-20 bg-cyan-800 rounded-lg border border-cyan-600" />
                <div className={cn(
                  'relative w-16 h-20 rounded-lg flex items-center justify-center',
                  'bg-gradient-to-br from-cyan-700 to-cyan-800',
                  'border-2',
                  canDraw ? 'border-green-400' : 'border-cyan-600'
                )}>
                  <span className="text-cyan-300 font-bold text-lg">OKEY</span>
                </div>
              </div>
              <div className="mt-2 bg-cyan-900 text-cyan-100 text-sm font-bold px-3 py-1 rounded-full">
                {tileBagCount}
              </div>
              {canDraw && (
                <span className="text-green-400 text-xs mt-1">Tıkla çek</span>
              )}
            </motion.button>

            {/* Discard pile */}
            <motion.button
              onClick={onDrawFromDiscard}
              disabled={!canDraw || !lastDiscarded}
              className={cn(
                'flex flex-col items-center',
                canDraw && lastDiscarded && 'cursor-pointer'
              )}
              whileHover={canDraw && lastDiscarded ? { scale: 1.05 } : {}}
              whileTap={canDraw && lastDiscarded ? { scale: 0.95 } : {}}
            >
              <div className={cn(
                'w-16 h-20 rounded-lg flex items-center justify-center',
                'bg-gradient-to-b from-gray-700/50 to-gray-800/50',
                'border-2 border-dashed',
                canDraw && lastDiscarded ? 'border-green-400' : 'border-gray-600'
              )}>
                {lastDiscarded ? (
                  <TurkishTile tile={lastDiscarded} okeyTile={okeyTile} size="md" />
                ) : (
                  <span className="text-gray-500 text-xs">Boş</span>
                )}
              </div>
              <div className="mt-2 bg-gray-700 text-gray-200 text-sm font-bold px-3 py-1 rounded-full">
                {discardPile.length}
              </div>
              {canDraw && lastDiscarded && (
                <span className="text-green-400 text-xs mt-1">Tıkla al</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right panel - Indicator and options */}
      <div className="absolute right-24 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
        {/* Indicator tile */}
        {indicatorTile && (
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Gösterge</div>
            <TurkishTile tile={indicatorTile} size="lg" />
            {okeyTile && (
              <div className={cn(
                'mt-1 text-xs font-bold',
                okeyTile.color === 'red' && 'text-red-400',
                okeyTile.color === 'blue' && 'text-blue-400',
                okeyTile.color === 'yellow' && 'text-amber-400',
                okeyTile.color === 'black' && 'text-gray-300',
              )}>
                Okey: {okeyTile.number}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN GAME BOARD
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
  onDeclareWin,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  timeRemaining = 30,
  isProcessingAI = false,
}: GameBoardProps) {
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);

  // Get opponents
  const opponents = useMemo(() => {
    const result: { player: typeof game.players[0]; position: 'left' | 'top' | 'right'; index: number }[] = [];
    const positions: ('left' | 'top' | 'right')[] = ['left', 'top', 'right'];

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

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 30%, #155e75 70%, #164e63 100%)'
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30">
        {/* Left - Exit and chips */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 border border-gray-600"
          >
            ← Çıkış
          </button>
          <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-lg">
            <span className="text-yellow-400">🪙</span>
            <span className="text-white font-bold">5,000</span>
          </div>
        </div>

        {/* Center - Player name and timer */}
        <div className="flex flex-col items-center">
          <div className="text-white font-bold text-sm">
            {currentPlayer?.name || 'Player'}
          </div>
          <div className="w-32 h-1.5 bg-gray-700 rounded-full mt-1">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isTimeLow ? 'bg-red-500' : 'bg-green-500'
              )}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {canDraw && (
            <button
              onClick={onDrawFromPile}
              className="px-4 py-1.5 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-500"
            >
              Çek
            </button>
          )}
          {canDiscard && (
            <>
              <button
                onClick={onDiscard}
                className="px-4 py-1.5 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                At
              </button>
              {currentPlayer && currentPlayer.tiles.length === 15 && (
                <button
                  onClick={onDeclareWin}
                  className="px-4 py-1.5 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 animate-pulse"
                >
                  Bitir!
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex min-h-0">
        {/* Left opponent */}
        <div className="flex-shrink-0">
          {leftOpp && (
            <OpponentBar
              player={leftOpp.player}
              isCurrentTurn={game.currentTurn === leftOpp.index}
              isThinking={isProcessingAI && game.currentTurn === leftOpp.index}
              position="left"
              okeyTile={game.okeyTile}
            />
          )}
        </div>

        {/* Center area */}
        <CenterArea
          tileBagCount={game.tileBag.length}
          indicatorTile={game.indicatorTile}
          okeyTile={game.okeyTile}
          discardPile={game.discardPile}
          canDraw={canDraw}
          onDrawFromPile={onDrawFromPile}
          onDrawFromDiscard={onDrawFromDiscard}
          topOpponent={topOpp ? {
            player: topOpp.player,
            isCurrentTurn: game.currentTurn === topOpp.index,
            isThinking: isProcessingAI && game.currentTurn === topOpp.index,
          } : null}
        />

        {/* Right opponent */}
        <div className="flex-shrink-0">
          {rightOpp && (
            <OpponentBar
              player={rightOpp.player}
              isCurrentTurn={game.currentTurn === rightOpp.index}
              isThinking={isProcessingAI && game.currentTurn === rightOpp.index}
              position="right"
              okeyTile={game.okeyTile}
            />
          )}
        </div>
      </div>

      {/* Bottom - Player's rack */}
      <div className="flex-shrink-0 p-2 bg-black/20">
        <div className="max-w-5xl mx-auto">
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
          />
        </div>
      </div>
    </div>
  );
});

export default TurkishGameBoard;
