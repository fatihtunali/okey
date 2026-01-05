'use client';

// ============================================
// MELD ZONE COMPONENT
// Displays melds on the table for 101 Okey
// ============================================

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Meld, Tile, GamePlayer } from '@/lib/game/types';
import TurkishTile from './TurkishTile';

interface MeldZoneProps {
  melds: Meld[];
  players: GamePlayer[];
  currentPlayerId: string;
  hasOpened: boolean;
  isCurrentTurn: boolean;
  onAddToMeld?: (meldId: string, position: 'start' | 'end') => void;
  selectedTiles?: Tile[];
  okeyTile?: Tile | null;
}

// Get player initials for meld ownership display
function getPlayerInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
}

// Get player color for their melds
function getPlayerColor(playerIndex: number): string {
  const colors = [
    'from-blue-500/20 to-blue-600/10 border-blue-400/30',
    'from-green-500/20 to-green-600/10 border-green-400/30',
    'from-purple-500/20 to-purple-600/10 border-purple-400/30',
    'from-orange-500/20 to-orange-600/10 border-orange-400/30',
  ];
  return colors[playerIndex % colors.length];
}

// Single meld component
const MeldDisplay = memo(function MeldDisplay({
  meld,
  player,
  playerIndex,
  isCurrentPlayer,
  hasOpened,
  isCurrentTurn,
  onAddToMeld,
  hasSelectedTiles,
  okeyTile,
}: {
  meld: Meld;
  player?: GamePlayer;
  playerIndex: number;
  isCurrentPlayer: boolean;
  hasOpened: boolean;
  isCurrentTurn: boolean;
  onAddToMeld?: (meldId: string, position: 'start' | 'end') => void;
  hasSelectedTiles: boolean;
  okeyTile?: Tile | null;
}) {
  const [hoveredEnd, setHoveredEnd] = useState<'start' | 'end' | null>(null);

  // Can add to meld if player has opened, is current turn, and has selected tiles
  const canAddToMeld = hasOpened && isCurrentTurn && hasSelectedTiles && !meld.isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative flex items-center gap-0.5 p-1.5 rounded-lg',
        'bg-gradient-to-b border',
        getPlayerColor(playerIndex),
        meld.isLocked && 'ring-1 ring-amber-500/30'
      )}
    >
      {/* Meld type indicator */}
      <div
        className={cn(
          'absolute -top-2 -left-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
          meld.type === 'set' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
        )}
      >
        {meld.type === 'set' ? 'Per' : 'Seri'}
      </div>

      {/* Owner initials */}
      {player && (
        <div className="absolute -bottom-2 -right-1 px-1 py-0.5 bg-gray-700 text-white text-[9px] rounded font-medium">
          {getPlayerInitials(player.name)}
        </div>
      )}

      {/* Add to start zone */}
      {canAddToMeld && meld.type === 'run' && (
        <motion.div
          className={cn(
            'absolute -left-6 top-0 bottom-0 w-5 flex items-center justify-center rounded-l cursor-pointer transition-all',
            hoveredEnd === 'start'
              ? 'bg-emerald-500/50 border-2 border-emerald-400'
              : 'bg-emerald-500/20 border border-dashed border-emerald-400/50'
          )}
          onMouseEnter={() => setHoveredEnd('start')}
          onMouseLeave={() => setHoveredEnd(null)}
          onClick={() => onAddToMeld?.(meld.id, 'start')}
        >
          <span className="text-emerald-300 text-sm">+</span>
        </motion.div>
      )}

      {/* Tiles in meld */}
      <div className="flex gap-0.5">
        {meld.tiles.map((tile, index) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TurkishTile
              tile={tile}
              size="sm"
              okeyTile={okeyTile}
            />
          </motion.div>
        ))}
      </div>

      {/* Add to end zone */}
      {canAddToMeld && (
        <motion.div
          className={cn(
            'absolute -right-6 top-0 bottom-0 w-5 flex items-center justify-center rounded-r cursor-pointer transition-all',
            hoveredEnd === 'end'
              ? 'bg-emerald-500/50 border-2 border-emerald-400'
              : 'bg-emerald-500/20 border border-dashed border-emerald-400/50'
          )}
          onMouseEnter={() => setHoveredEnd('end')}
          onMouseLeave={() => setHoveredEnd(null)}
          onClick={() => onAddToMeld?.(meld.id, 'end')}
        >
          <span className="text-emerald-300 text-sm">+</span>
        </motion.div>
      )}
    </motion.div>
  );
});

// Main MeldZone component
export default function MeldZone({
  melds,
  players,
  currentPlayerId,
  hasOpened,
  isCurrentTurn,
  onAddToMeld,
  selectedTiles = [],
  okeyTile,
}: MeldZoneProps) {
  // Group melds by owner
  const meldsByOwner = melds.reduce((acc, meld) => {
    if (!acc[meld.ownerId]) {
      acc[meld.ownerId] = [];
    }
    acc[meld.ownerId].push(meld);
    return acc;
  }, {} as Record<string, Meld[]>);

  const hasSelectedTiles = selectedTiles.length > 0;

  if (melds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2 opacity-30">🎴</div>
          <p className="text-sm">Henüz açılan taş yok</p>
          <p className="text-xs opacity-70 mt-1">
            En az 101 puanla açabilirsiniz
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-h-full overflow-y-auto custom-scrollbar">
      {/* Table melds organized by player */}
      {players.map((player, playerIndex) => {
        const playerMelds = meldsByOwner[player.id] || [];
        if (playerMelds.length === 0) return null;

        const isCurrentPlayer = player.id === currentPlayerId;

        return (
          <div key={player.id} className="space-y-2">
            {/* Player header */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center font-bold text-white',
                  isCurrentPlayer ? 'bg-blue-500' : 'bg-gray-600'
                )}
              >
                {getPlayerInitials(player.name)}
              </div>
              <span className={cn('font-medium', isCurrentPlayer ? 'text-blue-400' : 'text-gray-400')}>
                {player.name}
              </span>
              <span className="text-gray-500">
                ({playerMelds.length} grup)
              </span>
            </div>

            {/* Melds for this player */}
            <div className="flex flex-wrap gap-3 pl-8">
              <AnimatePresence mode="popLayout">
                {playerMelds.map((meld) => (
                  <MeldDisplay
                    key={meld.id}
                    meld={meld}
                    player={player}
                    playerIndex={playerIndex}
                    isCurrentPlayer={isCurrentPlayer}
                    hasOpened={hasOpened}
                    isCurrentTurn={isCurrentTurn}
                    onAddToMeld={onAddToMeld}
                    hasSelectedTiles={hasSelectedTiles}
                    okeyTile={okeyTile}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Export types for external use
export type { MeldZoneProps };
