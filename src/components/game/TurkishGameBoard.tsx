'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TurkishTile, TileSlot } from './TurkishTile';
import type { GameState, Tile as TileType } from '@/lib/game/types';

// ============================================
// TURKISH OKEY GAME BOARD - Premium 3D Design
// Realistic wooden table with depth and shadows
// Inspired by high-quality mobile game UIs
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
// 3D WOODEN RACK - Realistic istaka with depth
// ============================================
interface WoodenRack3DProps {
  tileCount: number;
  playerName: string;
  isCurrentTurn: boolean;
  isThinking?: boolean;
  position: 'top' | 'left' | 'right';
}

function WoodenRack3D({
  tileCount,
  playerName,
  isCurrentTurn,
  isThinking,
  position
}: WoodenRack3DProps) {
  const isVertical = position === 'left' || position === 'right';
  const displayCount = Math.min(tileCount, isVertical ? 10 : 14);

  // Rotation based on position
  const rotation = {
    top: 'rotateX(60deg)',
    left: 'rotateY(-50deg) rotateX(15deg)',
    right: 'rotateY(50deg) rotateX(15deg)',
  }[position];

  return (
    <div className={cn(
      'flex flex-col items-center gap-2',
      position === 'left' && 'flex-row-reverse',
      position === 'right' && 'flex-row'
    )}>
      {/* Player info badge */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-gradient-to-b from-stone-800 to-stone-900',
        'border shadow-lg',
        isCurrentTurn
          ? 'border-green-500 shadow-green-500/30'
          : 'border-stone-600',
      )}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          'bg-gradient-to-br',
          isCurrentTurn
            ? 'from-green-500 to-green-700 text-white'
            : 'from-stone-600 to-stone-700 text-stone-300'
        )}>
          {playerName[0]?.toUpperCase()}
        </div>
        <div className="text-left">
          <div className="text-white font-semibold text-sm truncate max-w-[80px]">
            {playerName}
          </div>
          <div className={cn(
            'text-xs',
            isCurrentTurn ? 'text-green-400' : 'text-stone-400'
          )}>
            {isThinking ? 'Thinking...' : `${tileCount} tiles`}
          </div>
        </div>
      </div>

      {/* 3D Wooden Rack */}
      <div
        className="relative"
        style={{
          perspective: '800px',
          perspectiveOrigin: position === 'top' ? '50% 100%' : '50% 50%'
        }}
      >
        <div
          className="relative"
          style={{
            transform: rotation,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Rack base - thick wooden plank */}
          <div className={cn(
            'relative rounded-lg',
            'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800',
            isVertical ? 'w-16 py-2 px-1' : 'h-20 px-2 py-1',
            isCurrentTurn && 'ring-2 ring-green-400 ring-offset-2 ring-offset-stone-900'
          )}
          style={{
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.2),
              inset 0 -4px 8px rgba(0,0,0,0.3),
              0 8px 16px rgba(0,0,0,0.4),
              0 4px 6px rgba(0,0,0,0.3)
            `,
          }}
          >
            {/* Wood grain texture overlay */}
            <div
              className="absolute inset-0 opacity-20 rounded-lg"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  ${isVertical ? '0deg' : '90deg'},
                  transparent,
                  transparent 2px,
                  rgba(0,0,0,0.1) 2px,
                  rgba(0,0,0,0.1) 4px
                )`,
              }}
            />

            {/* Decorative edge - top groove */}
            <div className={cn(
              'absolute bg-amber-900/50 rounded-full',
              isVertical
                ? 'top-2 bottom-2 left-1 w-1'
                : 'left-2 right-2 top-1 h-1'
            )} />

            {/* Tile holder groove */}
            <div className={cn(
              'relative flex gap-0.5',
              isVertical ? 'flex-col items-center' : 'flex-row justify-center',
              isVertical ? 'min-h-[200px]' : 'min-w-[300px]'
            )}>
              {Array.from({ length: displayCount }).map((_, i) => (
                <div
                  key={i}
                  className="relative"
                  style={{
                    transform: 'translateZ(8px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* 3D Tile back */}
                  <div
                    className={cn(
                      'rounded-md relative',
                      isVertical ? 'w-10 h-6' : 'w-6 h-10',
                      'bg-gradient-to-br from-amber-100 via-amber-50 to-white',
                      'border border-amber-200'
                    )}
                    style={{
                      boxShadow: `
                        inset 0 1px 2px rgba(255,255,255,0.8),
                        inset 0 -1px 2px rgba(0,0,0,0.1),
                        0 2px 4px rgba(0,0,0,0.2),
                        0 1px 2px rgba(0,0,0,0.1)
                      `,
                      transform: 'translateZ(2px)',
                    }}
                  >
                    {/* Tile back pattern - subtle circles */}
                    <div className="absolute inset-1 flex items-center justify-center opacity-30">
                      <div className="w-3 h-3 rounded-full border-2 border-amber-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative edge - bottom lip */}
            <div className={cn(
              'absolute bg-amber-900 rounded-full',
              isVertical
                ? 'top-2 bottom-2 right-1 w-2'
                : 'left-2 right-2 bottom-1 h-2'
            )}
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}
            />
          </div>

          {/* 3D depth sides */}
          <div
            className="absolute bg-gradient-to-b from-amber-800 to-amber-900"
            style={{
              width: isVertical ? '16px' : '100%',
              height: isVertical ? '100%' : '16px',
              transform: isVertical
                ? 'rotateY(-90deg) translateZ(0px)'
                : 'rotateX(90deg) translateZ(0px)',
              transformOrigin: isVertical ? 'right center' : 'center bottom',
              left: isVertical ? 0 : 0,
              top: isVertical ? 0 : 'auto',
              bottom: isVertical ? 'auto' : 0,
            }}
          />
        </div>

        {/* Tile count badge */}
        {tileCount > displayCount && (
          <div className="absolute -bottom-2 right-0 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            +{tileCount - displayCount}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PLAYER'S RACK - Full interactive rack
// ============================================
interface PlayerRack3DProps {
  tiles: TileType[];
  rackLayout: (string | null)[];
  okeyTile?: TileType | null;
  selectedTileId: string | null;
  onTileSelect: (tile: TileType) => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  canSelect: boolean;
  isCurrentTurn: boolean;
}

function PlayerRack3D({
  tiles,
  rackLayout,
  okeyTile,
  selectedTileId,
  onTileSelect,
  onTileMove,
  canSelect,
  isCurrentTurn,
}: PlayerRack3DProps) {
  // Create tile lookup map
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
          className="relative"
          style={{ transform: 'translateZ(12px)' }}
          layout
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
        className="w-14 h-[72px] rounded-lg border-2 border-dashed border-amber-600/30 bg-amber-900/20"
        onDrop={handleDrop(index)}
        onDragOver={handleDragOver}
      />
    );
  };

  const topRow = Array.from({ length: 15 }, (_, i) => i);
  const bottomRow = Array.from({ length: 15 }, (_, i) => i + 15);

  return (
    <div
      className="relative"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 100%'
      }}
    >
      <div
        style={{
          transform: 'rotateX(25deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main rack body */}
        <div className={cn(
          'relative rounded-xl p-3',
          'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800',
          isCurrentTurn && 'ring-4 ring-green-500/50'
        )}
        style={{
          boxShadow: `
            inset 0 4px 8px rgba(255,255,255,0.15),
            inset 0 -8px 16px rgba(0,0,0,0.3),
            0 20px 40px rgba(0,0,0,0.5),
            0 10px 20px rgba(0,0,0,0.3)
          `,
        }}
        >
          {/* Wood grain texture */}
          <div
            className="absolute inset-0 opacity-15 rounded-xl"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 3px,
                  rgba(0,0,0,0.1) 3px,
                  rgba(0,0,0,0.1) 6px
                )
              `,
            }}
          />

          {/* Top decorative edge */}
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-full mb-2 shadow-inner" />

          {/* Top row of tiles */}
          <div className="flex gap-1 justify-center mb-2">
            {topRow.map(renderSlot)}
          </div>

          {/* Center divider with decorative element */}
          <div className="relative h-2 mx-4 my-1">
            <div className="absolute inset-0 bg-amber-900/40 rounded-full" />
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-full border border-amber-400 shadow-lg" />
          </div>

          {/* Bottom row of tiles */}
          <div className="flex gap-1 justify-center mt-2">
            {bottomRow.map(renderSlot)}
          </div>

          {/* Bottom decorative edge */}
          <div className="h-2 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-full mt-2"
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
          />
        </div>

        {/* 3D depth - front face */}
        <div
          className="absolute left-0 right-0 bg-gradient-to-b from-amber-800 to-amber-950 rounded-b-xl"
          style={{
            height: '20px',
            bottom: '-20px',
            transform: 'rotateX(-90deg)',
            transformOrigin: 'top center',
            boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// CENTER TABLE - Draw pile and discards
// ============================================
interface CenterTableProps {
  tileBagCount: number;
  indicatorTile?: TileType | null;
  okeyTile?: TileType | null;
  lastDiscarded?: TileType | null;
  canDraw: boolean;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
}

function CenterTable({
  tileBagCount,
  indicatorTile,
  okeyTile,
  lastDiscarded,
  canDraw,
  onDrawFromPile,
  onDrawFromDiscard,
}: CenterTableProps) {
  return (
    <div className="flex items-center justify-center gap-8">
      {/* Draw pile */}
      <motion.button
        onClick={onDrawFromPile}
        disabled={!canDraw}
        className={cn(
          'relative flex flex-col items-center',
          canDraw && 'cursor-pointer'
        )}
        whileHover={canDraw ? { scale: 1.05, y: -4 } : {}}
        whileTap={canDraw ? { scale: 0.98 } : {}}
      >
        <span className="text-xs text-amber-300 font-bold mb-2 tracking-wider">DESTE</span>

        {/* Stacked tiles with 3D effect */}
        <div className="relative" style={{ perspective: '400px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-14 h-20 rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 border border-amber-600"
              style={{
                transform: `translateZ(${i * 3}px) translateY(${-i * 2}px) translateX(${i * 1}px)`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            />
          ))}
          <div
            className="relative w-14 h-20 rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 border border-amber-600 flex items-center justify-center"
            style={{
              transform: 'translateZ(12px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <div className="w-6 h-6 bg-amber-500/40 rotate-45 border border-amber-400/50" />
          </div>
        </div>

        <div className="mt-3 bg-amber-700 text-amber-100 text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          {tileBagCount}
        </div>

        {canDraw && (
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </motion.button>

      {/* Indicator tile */}
      {indicatorTile && (
        <div className="flex flex-col items-center">
          <span className="text-xs text-amber-300 font-bold mb-2 tracking-wider">GOSTERGE</span>
          <div className="relative" style={{ perspective: '400px' }}>
            <div style={{ transform: 'rotateX(10deg)' }}>
              <TurkishTile tile={indicatorTile} size="lg" />
            </div>
          </div>
          {okeyTile && (
            <div className="mt-2 flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-xs">
              <span className="text-amber-300">Okey:</span>
              <span className={cn(
                'font-bold',
                okeyTile.color === 'red' && 'text-red-400',
                okeyTile.color === 'blue' && 'text-blue-400',
                okeyTile.color === 'yellow' && 'text-amber-400',
                okeyTile.color === 'black' && 'text-gray-300',
              )}>
                {okeyTile.number}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Discard pile */}
      <motion.button
        onClick={onDrawFromDiscard}
        disabled={!canDraw || !lastDiscarded}
        className={cn(
          'relative flex flex-col items-center',
          canDraw && lastDiscarded && 'cursor-pointer'
        )}
        whileHover={canDraw && lastDiscarded ? { scale: 1.05, y: -4 } : {}}
        whileTap={canDraw && lastDiscarded ? { scale: 0.98 } : {}}
      >
        <span className="text-xs text-red-300 font-bold mb-2 tracking-wider">ATILAN</span>

        <div
          className={cn(
            'w-16 h-24 rounded-lg flex items-center justify-center',
            'bg-gradient-to-b from-red-900/30 to-red-950/30',
            'border-2 border-dashed border-red-700/50',
            canDraw && lastDiscarded && 'ring-2 ring-green-400'
          )}
        >
          {lastDiscarded ? (
            <TurkishTile tile={lastDiscarded} okeyTile={okeyTile} size="md" />
          ) : (
            <span className="text-red-500/30 text-xs">Empty</span>
          )}
        </div>

        {canDraw && lastDiscarded && (
          <span className="mt-2 text-xs text-green-400 font-medium">Click to take</span>
        )}
      </motion.button>
    </div>
  );
}

// ============================================
// MAIN GAME BOARD COMPONENT
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
  timeRemaining = 30,
  isProcessingAI = false,
}: GameBoardProps) {
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);

  // Get opponents
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

  const lastDiscarded = game.discardPile.length > 0
    ? game.discardPile[game.discardPile.length - 1]
    : null;

  return (
    <div
      className="w-full h-full min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Timer bar */}
      <div className="h-2 bg-stone-900 flex-shrink-0">
        <motion.div
          className={cn(
            'h-full transition-colors duration-300',
            isTimeLow ? 'bg-red-500' : 'bg-green-500'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${timerPercentage}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>

      {/* Exit button */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-4 left-4 z-50 px-3 py-1.5 text-sm bg-stone-900/80 text-amber-400 rounded-lg hover:bg-stone-800 border border-stone-700 shadow-lg"
      >
        Exit
      </button>

      {/* Main game area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Top opponent */}
        <div className="flex justify-center mb-4">
          {topOpp && (
            <WoodenRack3D
              tileCount={topOpp.player.tiles.length}
              playerName={topOpp.player.name}
              isCurrentTurn={game.currentTurn === topOpp.index}
              isThinking={isProcessingAI && game.currentTurn === topOpp.index}
              position="top"
            />
          )}
        </div>

        {/* Middle section: Left opponent, Table, Right opponent */}
        <div className="flex-1 flex items-center justify-between px-4">
          {/* Left opponent */}
          <div className="flex-shrink-0">
            {leftOpp && (
              <WoodenRack3D
                tileCount={leftOpp.player.tiles.length}
                playerName={leftOpp.player.name}
                isCurrentTurn={game.currentTurn === leftOpp.index}
                isThinking={isProcessingAI && game.currentTurn === leftOpp.index}
                position="left"
              />
            )}
          </div>

          {/* Center table area */}
          <div
            className="flex-1 max-w-xl mx-8 aspect-square rounded-2xl flex items-center justify-center"
            style={{
              background: `
                radial-gradient(ellipse at center, #1b5e20 0%, #1a472a 50%, #0d3320 100%)
              `,
              boxShadow: `
                inset 0 0 60px rgba(0,0,0,0.5),
                inset 0 0 120px rgba(0,0,0,0.3),
                0 0 40px rgba(0,0,0,0.5)
              `,
              border: '8px solid',
              borderImage: 'linear-gradient(180deg, #8b4513 0%, #654321 50%, #3d2914 100%) 1',
            }}
          >
            {/* Felt texture overlay */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none rounded-2xl"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
                `,
              }}
            />

            <CenterTable
              tileBagCount={game.tileBag.length}
              indicatorTile={game.indicatorTile}
              okeyTile={game.okeyTile}
              lastDiscarded={lastDiscarded}
              canDraw={canDraw}
              onDrawFromPile={onDrawFromPile}
              onDrawFromDiscard={onDrawFromDiscard}
            />
          </div>

          {/* Right opponent */}
          <div className="flex-shrink-0">
            {rightOpp && (
              <WoodenRack3D
                tileCount={rightOpp.player.tiles.length}
                playerName={rightOpp.player.name}
                isCurrentTurn={game.currentTurn === rightOpp.index}
                isThinking={isProcessingAI && game.currentTurn === rightOpp.index}
                position="right"
              />
            )}
          </div>
        </div>

        {/* Bottom - Current player section */}
        <div className="mt-4">
          {/* Action buttons */}
          <div className="flex justify-center gap-3 mb-3">
            {canDraw && (
              <motion.button
                onClick={onDrawFromPile}
                className="px-6 py-2 text-sm font-bold rounded-lg bg-gradient-to-b from-green-500 to-green-700 text-white shadow-lg border border-green-400"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Draw Tile
              </motion.button>
            )}
            {canDiscard && (
              <>
                <motion.button
                  onClick={onDiscard}
                  className="px-6 py-2 text-sm font-bold rounded-lg bg-gradient-to-b from-red-500 to-red-700 text-white shadow-lg border border-red-400"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Discard
                </motion.button>
                {currentPlayer && currentPlayer.tiles.length === 15 && (
                  <motion.button
                    onClick={onDeclareWin}
                    className="px-6 py-2 text-sm font-bold rounded-lg bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-lg border border-amber-400"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Declare Win!
                  </motion.button>
                )}
              </>
            )}
          </div>

          {/* Player info */}
          {currentPlayer && (
            <div className="flex justify-center mb-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-stone-900/80 rounded-lg border border-stone-700">
                <span className="text-amber-300 font-bold">{currentPlayer.name}</span>
                <span className={cn(
                  'text-sm font-medium',
                  isMyTurn ? 'text-green-400' : 'text-stone-400'
                )}>
                  {isMyTurn ? (canDraw ? 'Draw a tile' : 'Discard a tile') : 'Waiting...'}
                </span>
              </div>
            </div>
          )}

          {/* Player's rack */}
          {currentPlayer && (
            <div className="flex justify-center overflow-x-auto pb-4">
              <div className="transform scale-75 sm:scale-85 md:scale-90 lg:scale-100 origin-top">
                <PlayerRack3D
                  tiles={currentPlayer.tiles}
                  rackLayout={rackLayout}
                  okeyTile={game.okeyTile}
                  selectedTileId={selectedTileId}
                  onTileSelect={onTileSelect}
                  onTileMove={onTileMove}
                  canSelect={game.turnPhase === 'discard'}
                  isCurrentTurn={isMyTurn}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TurkishGameBoard;
