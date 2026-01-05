'use client';

// ============================================
// 101 OKEY GAME BOARD
// Complete game board for 101 Okey mode
// ============================================

import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import TurkishTile from './TurkishTile';
import MeldZone from './MeldZone';
import type { GameState, Tile as TileType, Meld, GamePlayer } from '@/lib/game/types';

interface Okey101GameBoardProps {
  game: GameState;
  currentPlayerId: string;
  rackLayout: (string | null)[];
  selectedTileIds: Set<string>;
  pendingMelds: Meld[];
  onTileSelect: (tile: TileType) => void;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: (tileId?: string) => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onSortByGroups?: () => void;
  onSortByRuns?: () => void;
  onOpenHand?: (type: 'series' | 'pairs') => void;
  onAutoOpen?: () => void;
  getAutoOpenInfo?: () => { points: number; melds: Meld[] };
  onLayMeld?: (type: 'set' | 'run') => void;
  onAddToMeld?: (meldId: string, position: 'start' | 'end') => void;
  onAddPendingMeld?: (type: 'set' | 'run') => void;
  onRemovePendingMeld?: (index: number) => void;
  onClearSelection?: () => void;
  getPendingMeldsPoints?: () => number;
  timeRemaining?: number;
  isProcessingAI?: boolean;
  error?: string | null;
}

// ============================================
// OPPONENT DISPLAY WITH SCORE
// ============================================
interface OpponentDisplayProps {
  player: GamePlayer;
  isCurrentTurn: boolean;
  isThinking?: boolean;
  position: 'left' | 'top' | 'right';
  discardedTile?: TileType | null;
  okeyTile?: TileType | null;
  canPickUp?: boolean;
  onPickUp?: () => void;
}

function OpponentDisplay({
  player,
  isCurrentTurn,
  isThinking,
  position,
  discardedTile,
  okeyTile,
  canPickUp,
  onPickUp,
}: OpponentDisplayProps) {
  const isVertical = position === 'left' || position === 'right';

  return (
    <div className={cn(
      'flex items-center gap-1 sm:gap-2',
      isVertical ? 'flex-col' : 'flex-row',
      position === 'right' && !isVertical && 'flex-row-reverse',
    )}>
      {/* Avatar circle */}
      <div className="relative">
        <motion.div
          className={cn(
            'w-10 h-10 sm:w-14 sm:h-14 rounded-full',
            'bg-gradient-to-br from-stone-700 to-stone-900',
            'border-2 sm:border-3 flex items-center justify-center',
            'shadow-lg',
            player.isEliminated && 'opacity-50',
            isCurrentTurn
              ? 'border-green-400 ring-2 ring-green-400/50'
              : player.hasOpened
                ? 'border-blue-400/50'
                : 'border-amber-600/50'
          )}
          animate={isCurrentTurn && !player.isEliminated ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-lg sm:text-3xl">
            {player.isEliminated ? '💀' : player.isAI ? '🤖' : '👤'}
          </span>
        </motion.div>

        {/* Turn indicator */}
        {isCurrentTurn && !player.isEliminated && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
          </div>
        )}

        {/* Opened badge */}
        {player.hasOpened && (
          <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 bg-blue-500 text-white text-[8px] sm:text-[10px] font-bold px-1 rounded">
            Açık
          </div>
        )}

        {/* Tile count badge */}
        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-amber-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-amber-400">
          {player.tiles.length}
        </div>
      </div>

      {/* Name and score */}
      <div className={cn(
        'text-center',
        isVertical ? 'w-full' : ''
      )}>
        <div className={cn(
          'text-[10px] sm:text-sm font-bold truncate max-w-[60px] sm:max-w-[80px]',
          isCurrentTurn ? 'text-green-400' : 'text-white',
          player.isEliminated && 'line-through opacity-50'
        )}>
          {player.name}
        </div>
        <div className={cn(
          'text-[10px] sm:text-sm font-bold',
          (player.score101 || 0) >= 80 ? 'text-red-400' : 'text-amber-400'
        )}>
          {player.score101 || 0} puan
        </div>
        {isThinking && (
          <div className="text-[8px] sm:text-[10px] text-yellow-400 animate-pulse">
            Düşünüyor...
          </div>
        )}
      </div>

      {/* Discarded tile */}
      <motion.button
        onClick={canPickUp ? onPickUp : undefined}
        disabled={!canPickUp}
        className={cn(
          'w-8 h-11 sm:w-12 sm:h-16 rounded-lg',
          'bg-stone-800/80 border-2 flex items-center justify-center',
          canPickUp
            ? 'border-green-400 cursor-pointer shadow-lg shadow-green-500/30'
            : 'border-stone-600/50',
          'transition-all'
        )}
        whileHover={canPickUp ? { scale: 1.1 } : {}}
        whileTap={canPickUp ? { scale: 0.95 } : {}}
      >
        {discardedTile ? (
          <div className="transform scale-50 sm:scale-75">
            <TurkishTile tile={discardedTile} okeyTile={okeyTile} size="sm" />
          </div>
        ) : (
          <span className="text-stone-500 text-[8px] sm:text-[10px]">Boş</span>
        )}
      </motion.button>
    </div>
  );
}

// ============================================
// PENDING MELDS DISPLAY
// ============================================
function PendingMeldsDisplay({
  melds,
  onRemove,
  totalPoints,
  okeyTile,
}: {
  melds: Meld[];
  onRemove: (index: number) => void;
  totalPoints: number;
  okeyTile?: TileType | null;
}) {
  if (melds.length === 0) return null;

  return (
    <div className="bg-stone-800/90 rounded-lg p-2 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-amber-400 font-bold">Açılış Grupları</span>
        <span className={cn(
          'text-xs font-bold',
          totalPoints >= 101 ? 'text-green-400' : 'text-red-400'
        )}>
          {totalPoints} / 101 puan
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {melds.map((meld, index) => (
          <div key={index} className="relative">
            <div className={cn(
              'flex gap-0.5 p-1 rounded border',
              meld.type === 'set' ? 'bg-amber-900/30 border-amber-500/30' : 'bg-emerald-900/30 border-emerald-500/30'
            )}>
              {meld.tiles.map(tile => (
                <div key={tile.id} className="transform scale-75 -m-1">
                  <TurkishTile tile={tile} okeyTile={okeyTile} size="sm" />
                </div>
              ))}
            </div>
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ACTION BUTTONS FOR 101 OKEY
// ============================================
function ActionButtons101({
  turnPhase,
  hasOpened,
  hasSelectedTiles,
  pendingMeldsPoints,
  canOpen,
  autoOpenPoints,
  canAutoOpen,
  onDrawFromPile,
  onDrawFromDiscard,
  onDiscard,
  onAddPendingMeld,
  onOpenHand,
  onAutoOpen,
  onLayMeld,
  onClearSelection,
  canDrawFromDiscard,
}: {
  turnPhase: string;
  hasOpened: boolean;
  hasSelectedTiles: boolean;
  pendingMeldsPoints: number;
  canOpen: boolean;
  autoOpenPoints: number;
  canAutoOpen: boolean;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
  onAddPendingMeld: (type: 'set' | 'run') => void;
  onOpenHand: (type: 'series' | 'pairs') => void;
  onAutoOpen: () => void;
  onLayMeld: (type: 'set' | 'run') => void;
  onClearSelection: () => void;
  canDrawFromDiscard: boolean;
}) {
  if (turnPhase === 'draw') {
    return (
      <div className="flex gap-2 flex-wrap justify-center">
        <motion.button
          onClick={onDrawFromPile}
          className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Desteden Çek
        </motion.button>
        {canDrawFromDiscard && (
          <motion.button
            onClick={onDrawFromDiscard}
            className="px-4 py-2 bg-gradient-to-b from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Yandan Al
          </motion.button>
        )}
      </div>
    );
  }

  // Play phase
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {/* Before opening */}
      {!hasOpened && (
        <>
          {/* Auto-open button - always visible when can auto-open */}
          {canAutoOpen && (
            <motion.button
              onClick={onAutoOpen}
              className="px-4 py-2 bg-gradient-to-b from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎯 Otomatik Aç ({autoOpenPoints} puan)
            </motion.button>
          )}

          {/* Show potential points even if can't auto-open */}
          {!canAutoOpen && autoOpenPoints > 0 && (
            <div className="px-3 py-1.5 bg-stone-700 text-amber-400 rounded-lg text-xs">
              Potansiyel: {autoOpenPoints}/101 puan
            </div>
          )}

          {hasSelectedTiles && (
            <>
              <motion.button
                onClick={() => onAddPendingMeld('set')}
                className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Per
              </motion.button>
              <motion.button
                onClick={() => onAddPendingMeld('run')}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Seri
              </motion.button>
            </>
          )}
          {canOpen && (
            <motion.button
              onClick={() => onOpenHand('series')}
              className="px-4 py-2 bg-gradient-to-b from-purple-500 to-purple-600 text-white font-bold rounded-lg shadow-lg text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Aç ({pendingMeldsPoints} puan)
            </motion.button>
          )}
        </>
      )}

      {/* After opening */}
      {hasOpened && hasSelectedTiles && (
        <>
          <motion.button
            onClick={() => onLayMeld('set')}
            className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Per İndir
          </motion.button>
          <motion.button
            onClick={() => onLayMeld('run')}
            className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Seri İndir
          </motion.button>
        </>
      )}

      {/* Discard button */}
      <motion.button
        onClick={onDiscard}
        disabled={!hasSelectedTiles}
        className={cn(
          "px-4 py-2 font-bold rounded-lg shadow-lg text-sm",
          hasSelectedTiles
            ? 'bg-gradient-to-b from-red-500 to-red-600 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        )}
        whileHover={hasSelectedTiles ? { scale: 1.05 } : {}}
        whileTap={hasSelectedTiles ? { scale: 0.95 } : {}}
      >
        At
      </motion.button>

      {hasSelectedTiles && (
        <motion.button
          onClick={onClearSelection}
          className="px-3 py-1.5 bg-gray-600 text-white font-bold rounded-lg text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Seçimi Temizle
        </motion.button>
      )}
    </div>
  );
}

// ============================================
// PLAYER RACK WITH MULTI-SELECT
// ============================================
const PlayerRack101 = memo(function PlayerRack101({
  tiles,
  rackLayout,
  selectedTileIds,
  onTileSelect,
  onTileMove,
  onDiscardTile,
  okeyTile,
  canDiscard,
}: {
  tiles: TileType[];
  rackLayout: (string | null)[];
  selectedTileIds: Set<string>;
  onTileSelect: (tile: TileType) => void;
  onTileMove?: (fromIndex: number, toIndex: number) => void;
  onDiscardTile?: (tileId: string) => void;
  okeyTile?: TileType | null;
  canDiscard?: boolean;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverDiscard, setDragOverDiscard] = useState(false);

  const tileMap = useMemo(() => {
    const map = new Map<string, TileType>();
    tiles.forEach(t => map.set(t.id, t));
    return map;
  }, [tiles]);

  // Handle double-click to discard
  const handleDoubleClick = (tile: TileType) => {
    if (canDiscard && onDiscardTile) {
      onDiscardTile(tile.id);
    }
  };

  // Handle discard drop zone
  const handleDiscardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTileId && canDiscard && onDiscardTile) {
      onDiscardTile(draggedTileId);
    }
    setDragOverDiscard(false);
    setDraggedIndex(null);
    setDraggedTileId(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number, tileId: string) => {
    setDraggedIndex(index);
    setDraggedTileId(tileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && onTileMove) {
      onTileMove(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedTileId(null);
    setDragOverIndex(null);
    setDragOverDiscard(false);
  };

  // Split into 2 rows of 14
  const row1 = rackLayout.slice(0, 14);
  const row2 = rackLayout.slice(14, 28);

  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      {/* Discard drop zone */}
      {canDiscard && (
        <motion.div
          className={cn(
            'mx-auto mb-2 w-16 h-20 sm:w-20 sm:h-24 rounded-xl flex flex-col items-center justify-center',
            'border-2 border-dashed transition-all cursor-pointer',
            dragOverDiscard
              ? 'bg-red-500/40 border-red-400 scale-105'
              : 'bg-red-900/30 border-red-500/50'
          )}
          onDrop={handleDiscardDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverDiscard(true);
          }}
          onDragLeave={() => setDragOverDiscard(false)}
          animate={dragOverDiscard ? { scale: 1.05 } : { scale: 1 }}
        >
          <span className="text-2xl sm:text-3xl">🗑️</span>
          <span className="text-[10px] sm:text-xs text-red-300 font-bold">
            {dragOverDiscard ? 'Bırak!' : 'Sürükle'}
          </span>
        </motion.div>
      )}

      {[row1, row2].map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-0.5 sm:gap-1">
          {row.map((tileId, slotIndex) => {
            const index = rowIndex * 14 + slotIndex;
            const tile = tileId ? tileMap.get(tileId) : null;
            const isSelected = tile && selectedTileIds.has(tile.id);
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <motion.div
                key={index}
                className={cn(
                  'w-[26px] h-[36px] sm:w-[42px] sm:h-[58px]',
                  'rounded-md border-2 transition-all',
                  isDragOver ? 'border-green-400 bg-green-900/30' :
                    tile ? 'border-transparent' : 'border-dashed border-stone-600/30 bg-stone-800/20',
                  isDragging && 'opacity-50'
                )}
                draggable={!!tile}
                onDragStart={(e) => tile && handleDragStart(e as any, index, tile.id)}
                onDragOver={(e) => handleDragOver(e as any, index)}
                onDrop={(e) => handleDrop(e as any, index)}
                onDragEnd={handleDragEnd}
              >
                {tile && (
                  <motion.div
                    animate={isSelected ? { y: -8, scale: 1.05 } : { y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      'cursor-pointer',
                      isSelected && 'ring-2 ring-blue-400 rounded-md'
                    )}
                    onClick={() => onTileSelect(tile)}
                    onDoubleClick={() => handleDoubleClick(tile)}
                  >
                    <TurkishTile tile={tile} okeyTile={okeyTile} size="sm" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

// ============================================
// MAIN 101 OKEY GAME BOARD
// ============================================
export default function Okey101GameBoard({
  game,
  currentPlayerId,
  rackLayout,
  selectedTileIds,
  pendingMelds,
  onTileSelect,
  onDrawFromPile,
  onDrawFromDiscard,
  onDiscard,
  onTileMove,
  onSortByGroups,
  onSortByRuns,
  onOpenHand,
  onAutoOpen,
  getAutoOpenInfo,
  onLayMeld,
  onAddToMeld,
  onAddPendingMeld,
  onRemovePendingMeld,
  onClearSelection,
  getPendingMeldsPoints,
  timeRemaining,
  isProcessingAI,
  error,
}: Okey101GameBoardProps) {
  const currentPlayer = game.players.find(p => p.id === currentPlayerId);
  const currentTurnPlayer = game.players[game.currentTurn];
  const isPlayerTurn = currentTurnPlayer?.id === currentPlayerId;

  // Get opponents in position order
  const opponents = useMemo(() => {
    const playerIndex = game.players.findIndex(p => p.id === currentPlayerId);
    const positions: ('left' | 'top' | 'right')[] = ['left', 'top', 'right'];
    const opponentList: { player: GamePlayer; position: 'left' | 'top' | 'right' }[] = [];

    for (let i = 1; i <= 3; i++) {
      const oppIndex = (playerIndex + i) % game.players.length;
      if (oppIndex !== playerIndex && game.players[oppIndex]) {
        opponentList.push({
          player: game.players[oppIndex],
          position: positions[i - 1],
        });
      }
    }

    return opponentList;
  }, [game.players, currentPlayerId]);

  // Can draw from discard (previous player's tile)
  const canDrawFromDiscard = useMemo(() => {
    if (!isPlayerTurn || game.turnPhase101 !== 'draw') return false;
    const playerIndex = game.players.findIndex(p => p.id === currentPlayerId);
    const prevPlayerIndex = (playerIndex - 1 + game.players.length) % game.players.length;
    return !!game.players[prevPlayerIndex]?.lastDiscardedTile;
  }, [game, currentPlayerId, isPlayerTurn]);

  const pendingPoints = getPendingMeldsPoints?.() || 0;
  const canOpen = pendingPoints >= 101 && pendingMelds.length > 0;
  const hasSelectedTiles = selectedTileIds.size > 0;

  // Get auto-open info
  const autoOpenInfo = getAutoOpenInfo?.() || { points: 0, melds: [] };
  const canAutoOpen = autoOpenInfo.points >= 101 && autoOpenInfo.melds.length > 0;

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-stone-900 via-green-950 to-stone-900 p-2 sm:p-4 flex flex-col">
      {/* Top area - opponents and round info */}
      <div className="flex justify-between items-start mb-2">
        {/* Left opponent */}
        <div className="flex-shrink-0">
          {opponents[0] && (
            <OpponentDisplay
              player={opponents[0].player}
              isCurrentTurn={game.currentTurn === game.players.findIndex(p => p.id === opponents[0].player.id)}
              isThinking={isProcessingAI && game.players[game.currentTurn]?.id === opponents[0].player.id}
              position="left"
              discardedTile={opponents[0].player.lastDiscardedTile}
              okeyTile={game.okeyTile}
              canPickUp={canDrawFromDiscard && game.players.findIndex(p => p.id === opponents[0].player.id) === (game.players.findIndex(p => p.id === currentPlayerId) - 1 + game.players.length) % game.players.length}
              onPickUp={onDrawFromDiscard}
            />
          )}
        </div>

        {/* Top area - opponent and round info */}
        <div className="flex flex-col items-center gap-2">
          {/* Round info */}
          <div className="bg-stone-800/80 px-3 py-1 rounded-full text-xs text-amber-400 font-bold">
            El {game.roundNumber}
          </div>

          {/* Top opponent */}
          {opponents[1] && (
            <OpponentDisplay
              player={opponents[1].player}
              isCurrentTurn={game.currentTurn === game.players.findIndex(p => p.id === opponents[1].player.id)}
              isThinking={isProcessingAI && game.players[game.currentTurn]?.id === opponents[1].player.id}
              position="top"
              discardedTile={opponents[1].player.lastDiscardedTile}
              okeyTile={game.okeyTile}
            />
          )}
        </div>

        {/* Right opponent */}
        <div className="flex-shrink-0">
          {opponents[2] && (
            <OpponentDisplay
              player={opponents[2].player}
              isCurrentTurn={game.currentTurn === game.players.findIndex(p => p.id === opponents[2].player.id)}
              isThinking={isProcessingAI && game.players[game.currentTurn]?.id === opponents[2].player.id}
              position="right"
              discardedTile={opponents[2].player.lastDiscardedTile}
              okeyTile={game.okeyTile}
            />
          )}
        </div>
      </div>

      {/* Middle area - table melds and draw pile */}
      <div className="flex-1 flex gap-4 mb-2 overflow-hidden">
        {/* Meld zone */}
        <div className="flex-1 bg-stone-800/30 rounded-xl border border-stone-700/50 overflow-hidden">
          <MeldZone
            melds={game.tableMelds || []}
            players={game.players}
            currentPlayerId={currentPlayerId}
            hasOpened={currentPlayer?.hasOpened || false}
            isCurrentTurn={isPlayerTurn}
            onAddToMeld={onAddToMeld}
            selectedTiles={currentPlayer?.tiles.filter(t => selectedTileIds.has(t.id))}
            okeyTile={game.okeyTile}
          />
        </div>

        {/* Draw pile and indicator */}
        <div className="flex flex-col items-center gap-2">
          {/* Indicator tile */}
          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-amber-400 font-bold mb-1">Gösterge</div>
            {game.indicatorTile && (
              <TurkishTile tile={game.indicatorTile} okeyTile={game.okeyTile} size="sm" />
            )}
          </div>

          {/* Draw pile */}
          <div className="text-center">
            <div className="text-[10px] sm:text-xs text-gray-400 font-bold mb-1">
              Deste ({game.tileBag.length})
            </div>
            <motion.button
              onClick={onDrawFromPile}
              disabled={!isPlayerTurn || game.turnPhase101 !== 'draw'}
              className={cn(
                'w-12 h-16 sm:w-16 sm:h-20 rounded-lg',
                'bg-gradient-to-b from-amber-700 to-amber-900',
                'border-2 flex items-center justify-center',
                isPlayerTurn && game.turnPhase101 === 'draw'
                  ? 'border-green-400 cursor-pointer shadow-lg shadow-green-500/30'
                  : 'border-amber-600/50 cursor-not-allowed'
              )}
              whileHover={isPlayerTurn && game.turnPhase101 === 'draw' ? { scale: 1.05 } : {}}
              whileTap={isPlayerTurn && game.turnPhase101 === 'draw' ? { scale: 0.95 } : {}}
            >
              <span className="text-2xl">🎴</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Player area */}
      <div className="mt-auto">
        {/* Pending melds display */}
        {!currentPlayer?.hasOpened && pendingMelds.length > 0 && (
          <PendingMeldsDisplay
            melds={pendingMelds}
            onRemove={onRemovePendingMeld || (() => {})}
            totalPoints={pendingPoints}
            okeyTile={game.okeyTile}
          />
        )}

        {/* Current player info bar with discarded tile */}
        <div className="flex items-center justify-between bg-stone-800/80 rounded-xl p-2 sm:p-3 mb-2 border border-amber-500/30">
          {/* Player avatar and info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-full',
                'bg-gradient-to-br from-blue-600 to-blue-800',
                'border-2 flex items-center justify-center',
                isPlayerTurn ? 'border-green-400 ring-2 ring-green-400/50' : 'border-blue-400/50',
              )}>
                <span className="text-lg sm:text-2xl">👤</span>
              </div>
              {/* Turn indicator */}
              {isPlayerTurn && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                </div>
              )}
              {/* Opened badge */}
              {currentPlayer?.hasOpened && (
                <div className="absolute -top-0.5 -left-0.5 bg-blue-500 text-white text-[8px] font-bold px-1 rounded">
                  Açık
                </div>
              )}
              {/* Tile count badge */}
              <div className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-amber-400">
                {currentPlayer?.tiles.length || 0}
              </div>
            </div>
            <div>
              <div className={cn(
                'text-sm sm:text-base font-bold',
                isPlayerTurn ? 'text-green-400' : 'text-white'
              )}>
                {currentPlayer?.name} <span className="text-blue-400">(Sen)</span>
              </div>
              <div className={cn(
                'text-xs sm:text-sm font-bold',
                (currentPlayer?.score101 || 0) >= 80 ? 'text-red-400' : 'text-amber-400'
              )}>
                {currentPlayer?.score101 || 0} puan
              </div>
            </div>
          </div>

          {/* Timer */}
          {isPlayerTurn && timeRemaining !== undefined && (
            <div className={cn(
              'text-lg sm:text-2xl font-bold px-3 py-1 rounded-lg',
              timeRemaining <= 10 ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-white bg-stone-700/50'
            )}>
              {timeRemaining}s
            </div>
          )}

          {/* Player's own discarded tile */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-gray-400 mb-1">Son Attığın</span>
            <div className={cn(
              'w-8 h-11 sm:w-12 sm:h-16 rounded-lg',
              'bg-stone-700/80 border-2 flex items-center justify-center',
              currentPlayer?.lastDiscardedTile ? 'border-stone-500' : 'border-stone-600/50'
            )}>
              {currentPlayer?.lastDiscardedTile ? (
                <div className="transform scale-50 sm:scale-75">
                  <TurkishTile tile={currentPlayer.lastDiscardedTile} okeyTile={game.okeyTile} size="sm" />
                </div>
              ) : (
                <span className="text-stone-500 text-[8px] sm:text-[10px]">Boş</span>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-1 rounded text-xs text-center mb-2"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {isPlayerTurn && (
          <div className="mb-2">
            <ActionButtons101
              turnPhase={game.turnPhase101 || 'draw'}
              hasOpened={currentPlayer?.hasOpened || false}
              hasSelectedTiles={hasSelectedTiles}
              pendingMeldsPoints={pendingPoints}
              canOpen={canOpen}
              autoOpenPoints={autoOpenInfo.points}
              canAutoOpen={canAutoOpen}
              onDrawFromPile={onDrawFromPile}
              onDrawFromDiscard={onDrawFromDiscard}
              onDiscard={() => onDiscard()}
              onAddPendingMeld={onAddPendingMeld || (() => {})}
              onOpenHand={onOpenHand || (() => {})}
              onAutoOpen={onAutoOpen || (() => {})}
              onLayMeld={onLayMeld || (() => {})}
              onClearSelection={onClearSelection || (() => {})}
              canDrawFromDiscard={canDrawFromDiscard}
            />
          </div>
        )}

        {/* Sort buttons */}
        <div className="flex justify-center gap-2 mb-2">
          <button
            onClick={onSortByGroups}
            className="px-2 py-1 bg-stone-700 text-white text-[10px] sm:text-xs rounded hover:bg-stone-600"
          >
            5/5 Diz
          </button>
          <button
            onClick={onSortByRuns}
            className="px-2 py-1 bg-stone-700 text-white text-[10px] sm:text-xs rounded hover:bg-stone-600"
          >
            123 Diz
          </button>
        </div>

        {/* Player rack */}
        {currentPlayer && (
          <PlayerRack101
            tiles={currentPlayer.tiles}
            rackLayout={rackLayout}
            selectedTileIds={selectedTileIds}
            onTileSelect={onTileSelect}
            onTileMove={onTileMove}
            onDiscardTile={(tileId) => onDiscard(tileId)}
            okeyTile={game.okeyTile}
            canDiscard={isPlayerTurn && (game.turnPhase101 === 'play' || game.turnPhase101 === 'mustDiscard')}
          />
        )}
      </div>
    </div>
  );
}
