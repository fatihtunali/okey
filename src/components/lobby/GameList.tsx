'use client';

import { cn } from '@/lib/utils';
import { useGameList, useJoinGame } from '@/hooks/useGames';
import type { GameLobby } from '@/lib/api/games';

interface GameListProps {
  onJoinGame: (gameId: string) => void;
}

export function GameList({ onJoinGame }: GameListProps) {
  const { data: games, isLoading, error } = useGameList();
  const { mutate: joinGame, isLoading: isJoining } = useJoinGame();

  const handleJoin = async (gameId: string) => {
    try {
      await joinGame(gameId);
      onJoinGame(gameId);
    } catch (err) {
      console.error('Join game failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Oyunlar yüklenirken hata oluştu
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        Şu anda bekleyen oyun yok. Yeni bir oyun oluşturun!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onJoin={() => handleJoin(game.id)}
          isJoining={isJoining}
        />
      ))}
    </div>
  );
}

function GameCard({
  game,
  onJoin,
  isJoining,
}: {
  game: GameLobby;
  onJoin: () => void;
  isJoining: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl',
        'bg-white/5 border border-white/10',
        'hover:bg-white/10 transition-colors'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Host avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          {game.host?.image ? (
            <img
              src={game.host.image}
              alt={game.host.name || 'Host'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-stone-900">
              {game.host?.name?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">
              {game.host?.name || 'Anonim'}
            </span>
            {game.host?.isVip && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-stone-900 rounded">
                VIP
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {game.currentPlayers}/{game.maxPlayers}
            </span>
            <span className="text-amber-400">
              {game.host?.rating || 1000} puan
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onJoin}
        disabled={isJoining || game.currentPlayers >= game.maxPlayers}
        className={cn(
          'px-6 py-2 rounded-lg font-medium transition-all',
          'bg-gradient-to-r from-green-500 to-emerald-600',
          'hover:from-green-400 hover:to-emerald-500',
          'text-white',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {game.currentPlayers >= game.maxPlayers ? 'Dolu' : 'Katıl'}
      </button>
    </div>
  );
}
