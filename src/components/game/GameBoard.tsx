'use client';

import { GameState, Tile as TileType } from '@/lib/game/types';
import { PlayerRack, OpponentRack } from './PlayerRack';
import { TileStack, IndicatorTile, DiscardedTile, DiscardPile } from './Tile';
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
    <div className="relative w-full min-h-[750px] flex flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950">
      {/* Timer bar at top - Zynga style */}
      <div className="h-3 bg-gray-900 border-b border-gray-700">
        <div
          className={cn(
            'h-full transition-all duration-1000 rounded-r-full',
            timeRemaining > 10
              ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-500/50'
              : 'bg-gradient-to-r from-red-400 to-red-500 shadow-lg shadow-red-500/50 animate-pulse'
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

        {/* Center game area - Green felt table (Zynga style) */}
        <div className="relative">
          {/* Green felt table surface */}
          <div className={cn(
            'relative rounded-2xl p-8',
            'bg-gradient-to-b from-green-800 via-green-900 to-green-950',
            'border-4 border-green-700',
            'shadow-2xl shadow-black/50',
            'min-w-[520px]'
          )}>
            {/* Felt texture overlay */}
            <div className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Inner glow border */}
            <div className="absolute inset-2 rounded-xl border border-green-600/30 pointer-events-none" />

            {/* Table items */}
            <div className="relative flex items-start justify-center gap-10 py-4">
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
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 px-6 py-2 rounded-full text-sm font-black shadow-xl animate-bounce border-2 border-amber-300">
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
      <div className="py-4 space-y-3">
        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {canDiscard && (
            <button
              onClick={onDiscard}
              className={cn(
                'px-10 py-3 rounded-xl font-black text-lg shadow-xl',
                'bg-gradient-to-b from-red-500 to-red-700',
                'hover:from-red-400 hover:to-red-600',
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
                'px-10 py-3 rounded-xl font-black text-lg shadow-xl',
                'bg-gradient-to-b from-emerald-500 to-emerald-700',
                'hover:from-emerald-400 hover:to-emerald-600',
                'text-white border-2 border-emerald-400',
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
          <div className="flex justify-center overflow-x-auto pb-2">
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
        )}

        {/* Player info bar */}
        {currentPlayer && (
          <div className="flex justify-center">
            <div className="flex items-center gap-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl px-6 py-3 shadow-xl border border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl border-2 border-amber-300 shadow-lg">
                {currentPlayer.name.charAt(0)}
              </div>
              <div>
                <div className="text-white font-bold text-lg">{currentPlayer.name}</div>
                <div className={cn(
                  'text-sm font-bold',
                  isMyTurn ? 'text-green-400' : 'text-gray-500'
                )}>
                  {isMyTurn ? 'Senin sıran!' : 'Bekle...'}
                </div>
              </div>
              <div className="bg-gray-700/80 text-amber-400 text-lg font-black px-4 py-2 rounded-lg border border-gray-600">
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
