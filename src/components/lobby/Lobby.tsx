'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GameList } from './GameList';
import { CreateGameModal } from './CreateGameModal';
import { JoinByCodeModal } from './JoinByCodeModal';

export function Lobby() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);

  const handleGameJoined = (gameId: string) => {
    router.push(`/play?gameId=${gameId}`);
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className={cn(
            'flex-1 py-4 rounded-xl font-bold text-lg',
            'bg-gradient-to-r from-amber-500 to-amber-600',
            'hover:from-amber-400 hover:to-amber-500',
            'text-stone-900',
            'transition-all hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Oyun
          </span>
        </button>

        <button
          onClick={() => setShowJoinCodeModal(true)}
          className={cn(
            'py-4 px-6 rounded-xl font-bold',
            'bg-white/10 border border-white/20',
            'text-white',
            'hover:bg-white/20',
            'transition-all'
          )}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </button>
      </div>

      {/* Available games */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Bekleyen Oyunlar
        </h3>
        <GameList onJoinGame={handleGameJoined} />
      </div>

      {/* Modals */}
      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGameCreated={handleGameJoined}
      />

      <JoinByCodeModal
        isOpen={showJoinCodeModal}
        onClose={() => setShowJoinCodeModal(false)}
        onJoined={handleGameJoined}
      />
    </div>
  );
}
