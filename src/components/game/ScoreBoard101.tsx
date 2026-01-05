'use client';

// ============================================
// 101 OKEY SCOREBOARD
// Displays round results and cumulative scores
// ============================================

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import TurkishTile from './TurkishTile';
import type { GameState, Score101, Tile as TileType } from '@/lib/game/types';

interface ScoreBoard101Props {
  game: GameState;
  roundResults: Score101[];
  onNextRound: () => void;
  onExit?: () => void;
  isGameOver: boolean;
}

function PlayerScoreRow({
  result,
  rank,
  cumulativeScore,
  isCurrentPlayer,
  okeyTile,
}: {
  result: Score101;
  rank: number;
  cumulativeScore: number;
  isCurrentPlayer: boolean;
  okeyTile?: TileType | null;
}) {
  const isWinner = result.isWinner;
  const isEliminated = result.isEliminated;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        isWinner && 'bg-gradient-to-r from-yellow-900/50 to-yellow-800/30 border border-yellow-500/30',
        isEliminated && 'bg-gradient-to-r from-red-900/50 to-red-800/30 border border-red-500/30',
        !isWinner && !isEliminated && 'bg-stone-800/50 border border-stone-700/30',
        isCurrentPlayer && 'ring-2 ring-blue-500/50'
      )}
    >
      {/* Rank */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg',
        isWinner ? 'bg-yellow-500 text-yellow-900' :
        isEliminated ? 'bg-red-500 text-white' :
        'bg-stone-600 text-white'
      )}>
        {isWinner ? '🏆' : isEliminated ? '💀' : rank}
      </div>

      {/* Player info */}
      <div className="flex-1">
        <div className={cn(
          'font-bold text-sm',
          isWinner ? 'text-yellow-400' :
          isEliminated ? 'text-red-400 line-through' :
          'text-white'
        )}>
          {result.playerName}
          {isCurrentPlayer && <span className="text-blue-400 ml-1">(Sen)</span>}
        </div>

        {/* Remaining tiles (if any) */}
        {result.tilesLeft.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1">
            {result.tilesLeft.slice(0, 10).map((tile, i) => (
              <div key={i} className="transform scale-50 -m-1">
                <TurkishTile tile={tile} okeyTile={okeyTile} size="sm" />
              </div>
            ))}
            {result.tilesLeft.length > 10 && (
              <span className="text-xs text-gray-400 ml-1">+{result.tilesLeft.length - 10}</span>
            )}
          </div>
        )}
      </div>

      {/* Round score */}
      <div className="text-right">
        <div className={cn(
          'text-lg font-bold',
          isWinner ? 'text-green-400' :
          result.totalScore > 50 ? 'text-red-400' :
          'text-amber-400'
        )}>
          {isWinner ? '-101' : `+${result.totalScore}`}
        </div>
        {result.multiplier > 1 && (
          <div className="text-xs text-purple-400">x{result.multiplier}</div>
        )}
      </div>

      {/* Cumulative score */}
      <div className={cn(
        'w-16 text-right font-bold text-lg',
        cumulativeScore >= 101 ? 'text-red-500' :
        cumulativeScore >= 80 ? 'text-orange-400' :
        'text-white'
      )}>
        {cumulativeScore}
      </div>
    </motion.div>
  );
}

export default function ScoreBoard101({
  game,
  roundResults,
  onNextRound,
  onExit,
  isGameOver,
}: ScoreBoard101Props) {
  // Sort results: winner first, then by score
  const sortedResults = [...roundResults].sort((a, b) => {
    if (a.isWinner) return -1;
    if (b.isWinner) return 1;
    return a.totalScore - b.totalScore;
  });

  // Get cumulative scores from game.players
  const cumulativeScores = game.players.reduce((acc, p) => {
    acc[p.id] = p.score101 || 0;
    return acc;
  }, {} as Record<string, number>);

  // Find overall leader and eliminated count
  const activePlayers = game.players.filter(p => !p.isEliminated);
  const eliminatedCount = game.players.filter(p => p.isEliminated).length;
  const winner = roundResults.find(r => r.isWinner);
  const overallLeader = [...game.players]
    .filter(p => !p.isEliminated)
    .sort((a, b) => (a.score101 || 0) - (b.score101 || 0))[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl border border-amber-500/30 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className={cn(
          "px-6 py-4 bg-gradient-to-r",
          winner ? "from-amber-600 to-amber-700" : "from-gray-600 to-gray-700"
        )}>
          <h2 className="text-xl font-bold text-white text-center">
            {isGameOver ? 'Oyun Bitti!' : `${game.roundNumber}. El Sonucu`}
          </h2>
          {winner ? (
            <p className="text-center text-amber-200 text-sm mt-1">
              Kazanan: {winner.playerName} 🎉
            </p>
          ) : (
            <p className="text-center text-gray-300 text-sm mt-1">
              Deste Bitti - Kazanan Yok 📦
            </p>
          )}
        </div>

        {/* Score list */}
        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {/* Header row */}
          <div className="flex items-center gap-3 px-3 text-xs text-gray-400 font-medium">
            <div className="w-8">Sıra</div>
            <div className="flex-1">Oyuncu</div>
            <div className="text-right">Bu El</div>
            <div className="w-16 text-right">Toplam</div>
          </div>

          {/* Player rows */}
          {sortedResults.map((result, index) => (
            <PlayerScoreRow
              key={result.playerId}
              result={result}
              rank={index + 1}
              cumulativeScore={cumulativeScores[result.playerId] || 0}
              isCurrentPlayer={result.playerId === game.players.find(p => !p.isAI)?.id}
              okeyTile={game.okeyTile}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="px-6 py-3 bg-stone-800/50 border-t border-stone-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Elenen Oyuncu:</span>
            <span className="text-red-400 font-bold">{eliminatedCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Lider:</span>
            <span className="text-green-400 font-bold">
              {overallLeader?.name} ({overallLeader?.score101 || 0} puan)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-stone-700 flex gap-3">
          {isGameOver ? (
            <>
              <motion.button
                onClick={onExit}
                className="flex-1 px-6 py-3 bg-stone-700 text-white font-bold rounded-lg hover:bg-stone-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Çıkış
              </motion.button>
              <motion.button
                onClick={onNextRound}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Yeni Oyun
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={onNextRound}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg shadow-lg text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sonraki El →
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
