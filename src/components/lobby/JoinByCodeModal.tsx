'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useJoinByCode } from '@/hooks/useGames';

interface JoinByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (gameId: string) => void;
}

export function JoinByCodeModal({ isOpen, onClose, onJoined }: JoinByCodeModalProps) {
  const [code, setCode] = useState('');
  const { mutate: joinByCode, isLoading, error } = useJoinByCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await joinByCode(code.toUpperCase());
      onJoined(result.gameId);
      onClose();
    } catch (err) {
      console.error('Join by code failed:', err);
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
          'relative w-full max-w-sm mx-4',
          'bg-gradient-to-br from-stone-800/90 to-stone-900/90',
          'border border-white/10 rounded-2xl',
          'shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Oda Kodunu Gir</h2>
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

          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className={cn(
                'w-full px-4 py-4 rounded-xl text-center text-2xl tracking-widest font-mono',
                'bg-white/10 border border-white/20',
                'text-white placeholder-white/40',
                'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
                'transition-all'
              )}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-lg',
              'bg-gradient-to-r from-amber-500 to-amber-600',
              'hover:from-amber-400 hover:to-amber-500',
              'text-stone-900',
              'transition-all hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Katılınıyor...' : 'Odaya Katıl'}
          </button>
        </form>
      </div>
    </div>
  );
}
