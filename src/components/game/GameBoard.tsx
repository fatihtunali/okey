'use client';

import { GameState, Tile as TileType } from '@/lib/game/types';
import { PlayerRack, OpponentRack } from './PlayerRack';
import { TileStack, IndicatorTile, DiscardedTile, DiscardPile } from './Tile';
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
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
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
  onSortByGroups,
  onSortByRuns,
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

  return (
    <div className="relative w-full min-h-[750px] flex flex-col bg-gradient-to-b from-sky-900 via-sky-800 to-sky-900">
      {/* Timer bar at top */}
      <div className="h-2 bg-gray-800">
        <div
          className={cn(
            'h-full transition-all duration-1000',
            timeRemaining > 10 ? 'bg-green-500' : 'bg-red-500 animate-pulse'
          )}
          style={{ width: `${(timeRemaining / 30) * 100}%` }}
        />
      </div>

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
      <div className="flex-1 flex items-center justify-center relative px-8">
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

        {/* Center game area - the table (Zynga style) */}
        <div className="relative">
          {/* Dark table surface */}
          <div className={cn(
            'relative rounded-3xl p-8',
            'bg-gradient-to-b from-gray-700 to-gray-800',
            'border-4 border-gray-600',
            'shadow-2xl',
            'min-w-[500px]'
          )}>
            {/* Inner border */}
            <div className="absolute inset-2 rounded-2xl border-2 border-gray-500/30 pointer-events-none" />

            {/* Table items */}
            <div className="relative flex items-start justify-center gap-8 py-4">
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
                canClickTop={canDraw}
              />
            </div>

            {/* Draw hint */}
            {canDraw && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                <div className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                  Taş Çekin!
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
      <div className="py-4 space-y-4 bg-gradient-to-t from-gray-900 to-transparent">
        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {canDiscard && (
            <button
              onClick={onDiscard}
              className={cn(
                'px-10 py-3 rounded-xl font-bold text-lg shadow-xl',
                'bg-gradient-to-b from-red-500 to-red-600',
                'hover:from-red-400 hover:to-red-500',
                'text-white border-2 border-red-400',
                'transition-all hover:scale-105 active:scale-95'
              )}
            >
              TAŞI AT
            </button>
          )}
          {canDiscard && currentPlayer.tiles.length === 15 && (
            <button
              onClick={onDeclareWin}
              className={cn(
                'px-10 py-3 rounded-xl font-bold text-lg shadow-xl',
                'bg-gradient-to-b from-green-500 to-green-600',
                'hover:from-green-400 hover:to-green-500',
                'text-white border-2 border-green-400',
                'transition-all hover:scale-105 active:scale-95',
                'animate-pulse'
              )}
            >
              BİTİR!
            </button>
          )}
        </div>

        {/* Player rack with sort buttons */}
        {currentPlayer && (
          <div className="flex justify-center">
            <PlayerRack
              tiles={currentPlayer.tiles}
              okeyTile={game.okeyTile}
              selectedTileId={selectedTileId}
              onTileSelect={onTileSelect}
              onSortByGroups={onSortByGroups}
              onSortByRuns={onSortByRuns}
              isCurrentPlayer={isMyTurn}
              canInteract={isMyTurn && game.turnPhase === 'discard'}
            />
          </div>
        )}

        {/* Player info bar */}
        {currentPlayer && (
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-gray-800 rounded-xl px-6 py-3 shadow-xl border-2 border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-blue-300">
                {currentPlayer.name.charAt(0)}
              </div>
              <div>
                <div className="text-white font-bold text-lg">{currentPlayer.name}</div>
                <div className={cn(
                  'text-sm font-medium',
                  isMyTurn ? 'text-green-400' : 'text-gray-400'
                )}>
                  {isMyTurn ? 'Senin sıran!' : 'Bekle...'}
                </div>
              </div>
              <div className="bg-gray-700 text-white text-lg font-bold px-4 py-2 rounded-lg">
                {currentPlayer.tiles.length} taş
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameBoard;
