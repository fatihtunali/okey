'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/game';
import { useGame } from '@/hooks/useGame';
import { randomId } from '@/lib/utils';

function PlayContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'regular' | 'okey101') || 'regular';

  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(() => `player_${randomId()}`);
  const [gameStarted, setGameStarted] = useState(false);

  const {
    game,
    rackLayout,
    selectedTileId,
    timeRemaining,
    error,
    isProcessingAI,
    initGame,
    handleDrawFromPile,
    handleDrawFromDiscard,
    handleDiscard,
    handleDeclareWin,
    handleTileSelect,
    handleTileMove,
    handleSortByGroups,
    handleSortByRuns,
  } = useGame({
    mode,
    playerName: playerName || 'Oyuncu',
    playerId,
    turnTimeLimit: 30,
  });

  const startGame = () => {
    if (!playerName.trim()) {
      setPlayerName('Oyuncu');
    }
    initGame();
    setGameStarted(true);
  };

  // Game finished screen
  if (game?.status === 'finished') {
    const winner = game.players.find(p => p.id === game.winnerId);
    const isWinner = game.winnerId === playerId;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <div className={`text-6xl mb-4 ${isWinner ? 'animate-bounce' : ''}`}>
            {isWinner ? '🎉' : '😔'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isWinner ? 'Tebrikler!' : 'Oyun Bitti'}
          </h1>
          <p className="text-xl text-amber-300 mb-6">
            {winner?.name} kazandı!
          </p>

          {game.mode === 'okey101' && (
            <div className="bg-black/20 rounded-lg p-4 mb-6">
              <h3 className="text-white font-bold mb-2">Skorlar</h3>
              <div className="space-y-2">
                {game.players
                  .sort((a, b) => (a.score101 || 0) - (b.score101 || 0))
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="flex justify-between text-white/80"
                    >
                      <span>
                        {index + 1}. {player.name}
                      </span>
                      <span className="font-bold">{player.score101 || 0}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                initGame();
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg transition-colors"
            >
              Tekrar Oyna
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg shadow-lg transition-colors"
            >
              Ana Sayfa
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Game lobby / name entry
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'okey101' ? '101 Okey' : 'Okey'}
            </h1>
            <p className="text-amber-300">Hemen oynamaya başla!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Adınız
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="İsminizi girin..."
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={20}
              />
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Oyuna Başla
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-white/60 hover:text-white text-sm">
              ← Ana sayfaya dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Game in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-bold text-amber-400">
              Okey
            </a>
            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-sm rounded">
              {mode === 'okey101' ? '101 Okey' : 'Normal Okey'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isProcessingAI && (
              <span className="text-white/60 text-sm animate-pulse">
                Rakip düşünüyor...
              </span>
            )}
            {error && (
              <span className="text-red-400 text-sm">{error}</span>
            )}
          </div>
        </div>
      </header>

      {/* Game board */}
      <main className="container mx-auto px-4 py-4">
        {game && (
          <GameBoard
            game={game}
            currentPlayerId={playerId}
            rackLayout={rackLayout}
            selectedTileId={selectedTileId}
            onTileSelect={handleTileSelect}
            onDrawFromPile={handleDrawFromPile}
            onDrawFromDiscard={handleDrawFromDiscard}
            onDiscard={handleDiscard}
            onDeclareWin={handleDeclareWin}
            onTileMove={handleTileMove}
            onSortByGroups={handleSortByGroups}
            onSortByRuns={handleSortByRuns}
            timeRemaining={timeRemaining}
            isProcessingAI={isProcessingAI}
          />
        )}
      </main>
    </div>
  );
}

// Loading fallback
function PlayLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 border-opacity-50 mx-auto mb-4"></div>
        <p className="text-white text-lg">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayLoading />}>
      <PlayContent />
    </Suspense>
  );
}
