'use client';

import { GameState, Tile as TileType } from '@/lib/game/types';
import { PlayerRack, OpponentRack } from './PlayerRack';
import { TileStack, IndicatorTile, DiscardedTile, TileSlot } from './Tile';
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
  isProcessingAI?: boolean;
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
  isProcessingAI = false,
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
  const topDiscard = game.discardPile[game.discardPile.length - 1];

  return (
    <div className="relative w-full min-h-[700px] flex flex-col">
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
              isAI={player.isAI}
              position="top"
              thinkingText={game.currentTurn === index && isProcessingAI ? "Düşünüyor..." : undefined}
            />
          );
        })}
      </div>

      {/* Middle section */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Left opponent */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
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
                isAI={player.isAI}
                position="left"
                thinkingText={game.currentTurn === index && isProcessingAI ? "Düşünüyor..." : undefined}
              />
            );
          })}
        </div>

        {/* Center game area - the table */}
        <div className="relative">
          {/* Green felt table surface */}
          <div className={cn(
            'relative rounded-3xl p-8',
            'bg-gradient-to-br from-green-700 via-green-800 to-green-900',
            'border-8 border-amber-800',
            'shadow-2xl shadow-black/50',
            'min-w-[400px]'
          )}>
            {/* Felt texture overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Timer */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div
                className={cn(
                  'px-6 py-2 rounded-full font-bold text-lg shadow-lg',
                  'border-2',
                  isMyTurn ? 'bg-green-600 text-white border-green-400' : 'bg-stone-700 text-stone-300 border-stone-600',
                  timeRemaining <= 10 && isMyTurn && 'bg-red-600 border-red-400 animate-pulse'
                )}
              >
                {isMyTurn ? `${timeRemaining}s` : 'Bekle...'}
              </div>
            </div>

            {/* Table items */}
            <div className="relative flex items-center justify-center gap-12 py-4">
              {/* Draw pile */}
              <div className="flex flex-col items-center gap-3">
                <TileStack
                  count={game.tileBag.length}
                  size="lg"
                  onClick={onDrawFromPile}
                  canClick={canDraw}
                />
                <span className="text-white/70 text-sm font-medium">Yığın</span>
              </div>

              {/* Indicator tile */}
              {game.indicatorTile && game.okeyTile && (
                <IndicatorTile
                  tile={game.indicatorTile}
                  okeyTile={game.okeyTile}
                />
              )}

              {/* Discard pile */}
              <div className="flex flex-col items-center gap-3">
                {topDiscard ? (
                  <DiscardedTile
                    tile={topDiscard}
                    okeyTile={game.okeyTile}
                    onClick={onDrawFromDiscard}
                    canClick={canDraw}
                  />
                ) : (
                  <div className="w-14 h-20 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center">
                    <span className="text-white/40 text-xs">Boş</span>
                  </div>
                )}
                <span className="text-white/70 text-sm font-medium">
                  Atılan ({game.discardPile.length})
                </span>
              </div>
            </div>

            {/* Draw hint */}
            {canDraw && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-amber-500 text-amber-950 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-bounce">
                  Taş çekin!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right opponent */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
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
                isAI={player.isAI}
                position="right"
                thinkingText={game.currentTurn === index && isProcessingAI ? "Düşünüyor..." : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom - Current player area */}
      <div className="py-6 space-y-4">
        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {canDiscard && (
            <button
              onClick={onDiscard}
              className={cn(
                'px-8 py-3 rounded-xl font-bold text-lg shadow-lg',
                'bg-gradient-to-r from-red-500 to-red-600',
                'hover:from-red-600 hover:to-red-700',
                'text-white border-2 border-red-400',
                'transition-all hover:scale-105 active:scale-100'
              )}
            >
              Taşı At
            </button>
          )}
          {canDiscard && currentPlayer.tiles.length === 15 && (
            <button
              onClick={onDeclareWin}
              className={cn(
                'px-8 py-3 rounded-xl font-bold text-lg shadow-lg',
                'bg-gradient-to-r from-green-500 to-green-600',
                'hover:from-green-600 hover:to-green-700',
                'text-white border-2 border-green-400',
                'transition-all hover:scale-105 active:scale-100',
                'animate-pulse'
              )}
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
              isCurrentPlayer={isMyTurn}
              canInteract={isMyTurn && game.turnPhase === 'discard'}
            />
          </div>
        )}

        {/* Player info */}
        {currentPlayer && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3 bg-stone-800/80 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                {currentPlayer.name.charAt(0)}
              </div>
              <div>
                <div className="text-white font-semibold">{currentPlayer.name}</div>
                <div className="text-amber-400/70 text-sm">{currentPlayer.tiles.length} taş</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameBoard;
