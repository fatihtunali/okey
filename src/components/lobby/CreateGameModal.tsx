'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCreateGame } from '@/hooks/useGames';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: (gameId: string) => void;
}

export function CreateGameModal({ isOpen, onClose, onGameCreated }: CreateGameModalProps) {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [fillWithAI, setFillWithAI] = useState(true);
  const [turnTimeLimit, setTurnTimeLimit] = useState(30);

  const { mutate: createGame, isLoading, error } = useCreateGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const game = await createGame({
        maxPlayers,
        isPrivate,
        fillWithAI,
        turnTimeLimit,
      });
      onGameCreated(game.id);
      onClose();
    } catch (err) {
      console.error('Create game failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4',
          'bg-gradient-to-br from-stone-800/90 to-stone-900/90',
          'border border-white/10 rounded-2xl',
          'shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Yeni Oyun Oluştur</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {(error as Error).message}
            </div>
          )}

          {/* Player count */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Oyuncu Sayısı
            </label>
            <div className="flex gap-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setMaxPlayers(count)}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-all',
                    maxPlayers === count
                      ? 'bg-amber-500 text-stone-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {count} Kişi
                </button>
              ))}
            </div>
          </div>

          {/* Turn time */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Hamle Süresi
            </label>
            <div className="flex gap-3">
              {[15, 30, 60].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setTurnTimeLimit(time)}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-all',
                    turnTimeLimit === time
                      ? 'bg-amber-500 text-stone-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {time} sn
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fillWithAI}
                onChange={(e) => setFillWithAI(e.target.checked)}
                className="w-5 h-5 rounded bg-white/10 border-white/30 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-white">Botlarla hemen başla</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 rounded bg-white/10 border-white/30 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-white">Özel oda (Kod ile katılım)</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-lg',
              'bg-gradient-to-r from-amber-500 to-amber-600',
              'hover:from-amber-400 hover:to-amber-500',
              'text-stone-900',
              'transition-all hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Oluşturuluyor...
              </span>
            ) : (
              'Oyunu Başlat'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
