'use client';

import { useState, useEffect } from 'react';
import { GameState, Tile as TileType, GamePlayer } from '@/lib/game/types';
import { PlayerRack, OpponentRack } from './PlayerRack';
import { Tile, TileStack } from './Tile';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  game: GameState;
  currentPlayerId: string;
  selectedTileId: string | null;
  onTileSelect: (tile: TileType) => void;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
  onDeclareWin: () => void;
  timeRemaining?: number;
}

export function GameBoard({
  game,
  currentPlayerId,
  selectedTileId,
  onTileSelect,
  onDrawFromPile,
  onDrawFromDiscard,
  onDiscard,
  onDeclareWin,
  timeRemaining = 30,
}: GameBoardProps) {
  const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);
  const currentPlayer = game.players[currentPlayerIndex];

  // Calculate opponent positions relative to current player
  const getOpponentPosition = (index: number): 'left' | 'top' | 'right' | null => {
    const relativeIndex = (index - currentPlayerIndex + game.players.length) % game.players.length;
    if (relativeIndex === 0) return null; // Current player

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

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col">
      {/* Top opponent */}
      <div className="flex justify-center py-4">
        {game.players.map((player, index) => {
          const position = getOpponentPosition(index);
          if (position !== 'top') return null;
          return (
            <OpponentRack
              key={player.id}
              tileCount={player.tiles.length}
              playerName={player.name}
              playerAvatar={player.avatar}
              isCurrentTurn={game.currentTurn === index}
              position="top"
            />
          );
        })}
      </div>

      {/* Middle section (left opponent, center, right opponent) */}
      <div className="flex-1 flex items-center">
        {/* Left opponent */}
        <div className="w-32 flex justify-center">
          {game.players.map((player, index) => {
            const position = getOpponentPosition(index);
            if (position !== 'left') return null;
            return (
              <OpponentRack
                key={player.id}
                tileCount={player.tiles.length}
                playerName={player.name}
                playerAvatar={player.avatar}
                isCurrentTurn={game.currentTurn === index}
                position="left"
              />
            );
          })}
        </div>

        {/* Center - Draw pile, Indicator, Discard pile */}
        <div className="flex-1 flex items-center justify-center">
          <CenterArea
            game={game}
            canDraw={canDraw}
            onDrawFromPile={onDrawFromPile}
            onDrawFromDiscard={onDrawFromDiscard}
            timeRemaining={timeRemaining}
            isMyTurn={isMyTurn}
          />
        </div>

        {/* Right opponent */}
        <div className="w-32 flex justify-center">
          {game.players.map((player, index) => {
            const position = getOpponentPosition(index);
            if (position !== 'right') return null;
            return (
              <OpponentRack
                key={player.id}
                tileCount={player.tiles.length}
                playerName={player.name}
                playerAvatar={player.avatar}
                isCurrentTurn={game.currentTurn === index}
                position="right"
              />
            );
          })}
        </div>
      </div>

      {/* Bottom - Current player's rack and controls */}
      <div className="py-4 space-y-4">
        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {canDiscard && (
            <button
              onClick={onDiscard}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors"
            >
              Taşı At
            </button>
          )}
          {canDiscard && currentPlayer.tiles.length === 15 && (
            <button
              onClick={onDeclareWin}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors animate-pulse"
            >
              Bitir!
            </button>
          )}
        </div>

        {/* Player rack */}
        {currentPlayer && (
          <div className="flex justify-center">
            <PlayerRack
              tiles={currentPlayer.tiles}
              okeyTile={game.okeyTile}
              selectedTileId={selectedTileId}
              onTileSelect={onTileSelect}
              isCurrentPlayer={true}
              canInteract={isMyTurn && game.turnPhase === 'discard'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Center area with draw pile, indicator, and discard pile
interface CenterAreaProps {
  game: GameState;
  canDraw: boolean;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
  timeRemaining: number;
  isMyTurn: boolean;
}

function CenterArea({
  game,
  canDraw,
  onDrawFromPile,
  onDrawFromDiscard,
  timeRemaining,
  isMyTurn,
}: CenterAreaProps) {
  const topDiscard = game.discardPile[game.discardPile.length - 1];

  return (
    <div className="bg-green-800/80 rounded-2xl p-8 shadow-2xl border-4 border-green-700">
      {/* Timer */}
      <div className="flex justify-center mb-4">
        <div
          className={cn(
            'px-4 py-2 rounded-full font-bold text-lg',
            isMyTurn ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300',
            timeRemaining <= 10 && isMyTurn && 'bg-red-600 animate-pulse'
          )}
        >
          {timeRemaining}s
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Draw pile */}
        <div className="flex flex-col items-center gap-2">
          <div
            onClick={canDraw ? onDrawFromPile : undefined}
            className={cn(
              'transition-transform',
              canDraw && 'cursor-pointer hover:scale-105'
            )}
          >
            <TileStack count={game.tileBag.length} />
          </div>
          <span className="text-white/80 text-sm">Yığın</span>
        </div>

        {/* Indicator tile (okey göstergesi) */}
        <div className="flex flex-col items-center gap-2">
          {game.indicatorTile && (
            <div className="relative">
              <Tile tile={game.indicatorTile} size="lg" />
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Gösterge
              </div>
            </div>
          )}
          <span className="text-white/80 text-sm">
            Okey: {game.okeyTile?.color} {game.okeyTile?.number}
          </span>
        </div>

        {/* Discard pile */}
        <div className="flex flex-col items-center gap-2">
          {topDiscard ? (
            <div
              onClick={canDraw ? onDrawFromDiscard : undefined}
              className={cn(
                'transition-transform',
                canDraw && 'cursor-pointer hover:scale-105'
              )}
            >
              <Tile tile={topDiscard} okeyTile={game.okeyTile} size="lg" />
            </div>
          ) : (
            <div className="w-12 h-16 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
              <span className="text-white/50 text-xs">Boş</span>
            </div>
          )}
          <span className="text-white/80 text-sm">
            Atılan ({game.discardPile.length})
          </span>
        </div>
      </div>

      {/* Draw hint */}
      {canDraw && (
        <div className="mt-4 text-center text-white font-medium animate-bounce">
          Taş çekin! (Yığından veya atılandan)
        </div>
      )}
    </div>
  );
}

export default GameBoard;
