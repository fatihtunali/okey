'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TurkishGameBoard, GameChat } from '@/components/game';
import Okey101GameBoard from '@/components/game/Okey101GameBoard';
import ScoreBoard101 from '@/components/game/ScoreBoard101';
import { useGame } from '@/hooks/useGame';
import { useGame101 } from '@/hooks/useGame101';
import { useGame as useApiGame } from '@/hooks/useGames';
import { useSocket } from '@/lib/socket';
import { randomId } from '@/lib/utils';
import * as api from '@/lib/api/games';

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const mode = (searchParams.get('mode') as 'regular' | 'okey101') || 'regular';
  const gameId = searchParams.get('gameId');
  const isMultiplayer = searchParams.get('multiplayer') === 'true';

  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(() => `player_${randomId()}`);
  const [gameStarted, setGameStarted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Socket connection for multiplayer
  const {
    isConnected,
    roomPlayers,
    connect,
    disconnect,
    joinGame: joinSocketRoom,
    leaveGame: leaveSocketRoom,
    setReady: setSocketReady,
    syncGameState,
    emitDrawTile,
    emitDiscardTile,
    emitTurnChanged,
    emitGameFinished,
    onGameStateSync,
    onPlayerJoined,
    onPlayerLeft,
    onPlayerDisconnected,
    onAllPlayersReady,
  } = useSocket();

  // Use session name if available
  useEffect(() => {
    if (session?.user?.name) {
      setPlayerName(session.user.name);
    }
  }, [session]);

  // Connect to socket for multiplayer games
  useEffect(() => {
    if (isMultiplayer || gameId) {
      connect();
    }
    return () => {
      if (gameId) {
        leaveSocketRoom(gameId, session?.user?.id || playerId);
      }
    };
  }, [isMultiplayer, gameId, connect, leaveSocketRoom, session?.user?.id, playerId]);

  // Join socket room when game is available
  useEffect(() => {
    if (gameId && isConnected) {
      joinSocketRoom(gameId, session?.user?.id || playerId, playerName || 'Oyuncu');
    }
  }, [gameId, isConnected, joinSocketRoom, session?.user?.id, playerId, playerName]);

  // API game state (for multiplayer)
  const { data: apiGame, isLoading: isLoadingGame, error: gameError, refetch: refetchGame } = useApiGame(gameId);

  // Local game state (for single player with AI) - Regular Okey
  const regularGame = useGame({
    mode: 'regular',
    playerName: playerName || session?.user?.name || 'Oyuncu',
    playerId: session?.user?.id || playerId,
    turnTimeLimit: 30,
  });

  // Local game state (for single player with AI) - 101 Okey
  const okey101Game = useGame101({
    playerName: playerName || session?.user?.name || 'Oyuncu',
    playerId: session?.user?.id || playerId,
    turnTimeLimit: 60,
  });

  // Select appropriate hook based on mode
  const is101Mode = mode === 'okey101';
  const {
    game: localGame,
    rackLayout,
    timeRemaining,
    error: localError,
    isProcessingAI,
    initGame,
    handleDrawFromPile,
    handleDrawFromDiscard,
    handleDiscard,
    handleTileSelect,
    handleTileMove,
    handleSortByGroups,
    handleSortByRuns,
  } = is101Mode ? {
    game: okey101Game.game,
    rackLayout: okey101Game.rackLayout,
    timeRemaining: okey101Game.timeRemaining,
    error: okey101Game.error,
    isProcessingAI: okey101Game.isProcessingAI,
    initGame: okey101Game.initGame,
    handleDrawFromPile: okey101Game.handleDrawFromPile,
    handleDrawFromDiscard: okey101Game.handleDrawFromDiscard,
    handleDiscard: okey101Game.handleDiscard,
    handleTileSelect: okey101Game.handleTileSelect,
    handleTileMove: okey101Game.handleTileMove,
    handleSortByGroups: okey101Game.handleSortByGroups,
    handleSortByRuns: okey101Game.handleSortByRuns,
  } : {
    game: regularGame.game,
    rackLayout: regularGame.rackLayout,
    timeRemaining: regularGame.timeRemaining,
    error: regularGame.error,
    isProcessingAI: regularGame.isProcessingAI,
    initGame: regularGame.initGame,
    handleDrawFromPile: regularGame.handleDrawFromPile,
    handleDrawFromDiscard: regularGame.handleDrawFromDiscard,
    handleDiscard: regularGame.handleDiscard,
    handleTileSelect: regularGame.handleTileSelect,
    handleTileMove: regularGame.handleTileMove,
    handleSortByGroups: regularGame.handleSortByGroups,
    handleSortByRuns: regularGame.handleSortByRuns,
  };

  // Regular okey specific
  const { selectedTileId, handleDiscardById, handleDeclareWin } = regularGame;

  // API game actions
  const handleApiDraw = async (source: 'pile' | 'discard') => {
    if (!gameId) return;
    try {
      await api.drawTile(gameId, source);
      refetchGame();
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const handleApiDiscard = async () => {
    if (!gameId || !selectedTileId) return;
    try {
      await api.discardTile(gameId, selectedTileId);
      refetchGame();
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const handleApiFinish = async () => {
    if (!gameId || !selectedTileId) return;
    try {
      await api.finishGame(gameId, selectedTileId);
      refetchGame();
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  // Determine which game state to use
  const isApiGame = !!gameId;
  const game = isApiGame ? apiGame : localGame;
  const error = apiError || localError || (gameError?.message);

  const startGame = () => {
    if (!playerName.trim() && !session?.user?.name) {
      setPlayerName('Oyuncu');
    }
    initGame();
    setGameStarted(true);
  };

  // Loading for API games
  if (isApiGame && isLoadingGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 flex items-center justify-center ottoman-pattern">
        <div className="text-center bg-stone-900/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-600/30">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-amber-300 mx-auto mb-4"></div>
          <p className="text-amber-200 text-lg font-medium">Oyun yükleniyor...</p>
          <p className="text-amber-400/60 text-sm mt-2">Kahveniz hazırlanıyor 🫖</p>
        </div>
      </div>
    );
  }

  // Game not found
  if (isApiGame && !apiGame && !isLoadingGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 flex items-center justify-center ottoman-pattern">
        <div className="bg-stone-900/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4 border border-amber-600/30">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-amber-200 mb-2">Oyun Bulunamadı</h1>
          <p className="text-amber-300/70 mb-6">Bu oyun mevcut değil veya sona ermiş olabilir.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-all border border-amber-500"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Game finished screen
  const isFinished = (isApiGame && apiGame?.status === 'FINISHED') || (!isApiGame && localGame?.status === 'finished');

  if (isFinished && game) {
    const winner = isApiGame
      ? apiGame?.players.find(p => p.id === apiGame.winnerId)
      : localGame?.players.find(p => p.id === localGame?.winnerId);
    const currentUserId = session?.user?.id || playerId;
    const isWinner = isApiGame
      ? apiGame?.winnerId === currentUserId
      : localGame?.winnerId === currentUserId;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 flex items-center justify-center ottoman-pattern">
        <div className="bg-stone-900/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4 border-2 border-amber-600/50">
          {/* Decorative top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-full" />

          <div className={`text-7xl mb-4 ${isWinner ? 'animate-bounce' : ''}`}>
            {isWinner ? '🏆' : '😔'}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-amber-300' : 'text-amber-200'}`}>
            {isWinner ? 'Tebrikler!' : 'Oyun Bitti'}
          </h1>
          <p className="text-xl text-amber-400 mb-2">
            {winner?.name || 'Bir oyuncu'} kazandı!
          </p>
          {isWinner && (
            <p className="text-amber-300/60 text-sm mb-6">Harika bir oyun oynadınız!</p>
          )}

          <div className="flex gap-4 justify-center">
            {!isApiGame && (
              <button
                onClick={() => initGame()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl shadow-lg transition-all border border-green-500"
              >
                Tekrar Oyna
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-amber-200 font-bold rounded-xl shadow-lg transition-colors border border-stone-600"
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game lobby / name entry (only for local games)
  if (!isApiGame && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 flex items-center justify-center ottoman-pattern">
        <div className="relative bg-stone-900/90 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4 border-2 border-amber-600/50 shadow-2xl">
          {/* Decorative okey tiles */}
          <div className="absolute -top-6 -left-4 w-10 h-14 bg-gradient-to-b from-amber-100 to-amber-50 rounded-lg shadow-lg transform -rotate-12 border-2 border-amber-200 flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">7</span>
          </div>
          <div className="absolute -top-4 -right-6 w-10 h-14 bg-gradient-to-b from-amber-100 to-amber-50 rounded-lg shadow-lg transform rotate-12 border-2 border-amber-200 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">K</span>
          </div>

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎴</div>
            <h1 className="text-3xl font-bold text-amber-200 mb-2">
              {mode === 'okey101' ? '101 Okey' : 'Okey'}
            </h1>
            <p className="text-amber-400/80">Yapay zekaya karşı oyna!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-amber-200 text-sm mb-2 font-medium">
                Adınız
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="İsminizi girin..."
                className="w-full px-4 py-3 bg-stone-800/80 border-2 border-amber-600/50 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                maxLength={20}
              />
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all transform hover:scale-[1.02] border-2 border-amber-500"
            >
              Oyuna Başla
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-amber-400/60 hover:text-amber-300 text-sm transition-colors"
            >
              ← Ana sayfaya dön
            </button>
          </div>

          {/* Turkish tea decoration */}
          <div className="absolute -bottom-3 right-6 opacity-50">
            <div className="text-2xl">🫖</div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting room for API games
  if (isApiGame && apiGame?.status === 'WAITING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 flex items-center justify-center ottoman-pattern">
        <div className="bg-stone-900/90 backdrop-blur-lg rounded-2xl p-8 max-w-lg mx-4 border-2 border-amber-600/50">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎴</div>
            <h1 className="text-2xl font-bold text-amber-200 mb-2">Bekleme Odası</h1>
            {apiGame.roomCode && (
              <div className="bg-stone-800/80 rounded-xl p-4 mb-4 border border-amber-600/30">
                <p className="text-amber-400/60 text-sm">Oda Kodu</p>
                <p className="text-2xl font-mono font-bold text-amber-300">{apiGame.roomCode}</p>
              </div>
            )}
            <p className="text-amber-300/70">
              {apiGame.players.length}/{apiGame.maxPlayers} oyuncu
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {apiGame.players.map((player, i) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-stone-800/60 rounded-xl border border-amber-600/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold border-2 border-amber-500">
                    {player.isAI ? '🤖' : (player.name?.[0] || '?')}
                  </div>
                  <span className="text-amber-100">
                    {player.isAI ? `Bot ${i}` : player.name}
                  </span>
                </div>
                {player.isReady && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Hazır
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  await api.setReady(gameId!);
                  refetchGame();
                } catch (err) {
                  setApiError((err as Error).message);
                }
              }}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl transition-all border border-green-500"
            >
              Hazırım
            </button>
            <button
              onClick={async () => {
                try {
                  await api.leaveGame(gameId!);
                  router.push('/');
                } catch (err) {
                  setApiError((err as Error).message);
                }
              }}
              className="py-3 px-6 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold rounded-xl transition-colors border border-red-500/30"
            >
              Ayrıl
            </button>
          </div>

          {apiError && (
            <p className="mt-4 text-red-400 text-sm text-center">{apiError}</p>
          )}
        </div>
      </div>
    );
  }

  // Game in progress - Full screen game board
  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Back button overlay */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-2 left-2 z-50 px-2 py-1 text-xs bg-stone-900/80 text-amber-400 rounded hover:bg-stone-800 transition-colors"
      >
        ← Çıkış
      </button>

      {/* Connection status for multiplayer */}
      {(isMultiplayer || gameId) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1 bg-stone-900/80 rounded text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-amber-200">
            {isConnected ? 'Bağlı' : 'Bağlanıyor...'}
          </span>
          {roomPlayers.length > 0 && (
            <span className="text-amber-400/60">({roomPlayers.length} oyuncu)</span>
          )}
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-2 right-2 z-50 text-red-400 text-xs bg-red-900/80 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {/* Full screen game board - 101 Okey */}
      {game && is101Mode && !isApiGame && localGame && (
        <>
          <Okey101GameBoard
            game={localGame}
            currentPlayerId={session?.user?.id || playerId}
            rackLayout={okey101Game.rackLayout}
            selectedTileIds={okey101Game.selectedTileIds}
            pendingMelds={okey101Game.pendingMelds}
            onTileSelect={okey101Game.handleTileSelect}
            onDrawFromPile={okey101Game.handleDrawFromPile}
            onDrawFromDiscard={okey101Game.handleDrawFromDiscard}
            onDiscard={okey101Game.handleDiscard}
            onTileMove={okey101Game.handleTileMove}
            onSortByGroups={okey101Game.handleSortByGroups}
            onSortByRuns={okey101Game.handleSortByRuns}
            onOpenHand={okey101Game.handleOpenHand}
            onLayMeld={okey101Game.handleLayMeld}
            onAddToMeld={okey101Game.handleAddToMeld}
            onAddPendingMeld={okey101Game.addPendingMeld}
            onRemovePendingMeld={okey101Game.removePendingMeld}
            onClearSelection={okey101Game.clearSelection}
            getPendingMeldsPoints={okey101Game.getPendingMeldsPoints}
            timeRemaining={okey101Game.timeRemaining}
            isProcessingAI={okey101Game.isProcessingAI}
            error={okey101Game.error}
          />

          {/* Round results modal for 101 Okey */}
          {okey101Game.showRoundResults && localGame.roundResults && (
            <ScoreBoard101
              game={localGame}
              roundResults={localGame.roundResults}
              onNextRound={() => {
                // Check if game is over
                const activePlayers = localGame.players.filter(p => !p.isEliminated);
                if (activePlayers.length <= 1) {
                  okey101Game.setShowRoundResults(false);
                  // Game is over, reinit
                } else {
                  okey101Game.handleNextRound();
                }
              }}
              onExit={() => router.push('/')}
              isGameOver={localGame.players.filter(p => !p.isEliminated).length <= 1}
            />
          )}
        </>
      )}

      {/* Full screen game board - Regular Okey */}
      {game && !is101Mode && (
        <TurkishGameBoard
            game={isApiGame ? convertApiGameToLocal(apiGame!) : localGame!}
            currentPlayerId={session?.user?.id || playerId}
            rackLayout={rackLayout}
            selectedTileId={selectedTileId}
            onTileSelect={handleTileSelect}
            onDrawFromPile={isApiGame ? () => handleApiDraw('pile') : handleDrawFromPile}
            onDrawFromDiscard={isApiGame ? () => handleApiDraw('discard') : handleDrawFromDiscard}
            onDiscard={isApiGame ? handleApiDiscard : handleDiscard}
            onDiscardById={isApiGame ? undefined : handleDiscardById}
            onDeclareWin={isApiGame ? handleApiFinish : handleDeclareWin}
            onTileMove={handleTileMove}
            onSortByGroups={handleSortByGroups}
            onSortByRuns={handleSortByRuns}
            timeRemaining={timeRemaining}
            isProcessingAI={isProcessingAI && !isApiGame}
          />
      )}

      {/* Chat for multiplayer games */}
      {(isMultiplayer || gameId) && gameId && (
        <GameChat
          gameId={gameId}
          playerId={session?.user?.id || playerId}
          playerName={playerName || session?.user?.name || 'Oyuncu'}
        />
      )}
    </div>
  );
}

// Convert API game format to local game format for GameBoard compatibility
function convertApiGameToLocal(apiGame: api.Game): import('@/lib/game/types').GameState {
  return {
    id: apiGame.id,
    status: apiGame.status.toLowerCase() as 'waiting' | 'playing' | 'finished',
    mode: apiGame.mode as 'regular' | 'okey101',
    players: apiGame.players.map((p, index) => ({
      id: p.id,
      name: p.name || (p.isAI ? 'Bot' : 'Oyuncu'),
      tiles: (p.tiles || []) as unknown as import('@/lib/game/types').Tile[],
      isAI: p.isAI,
      isConnected: p.isConnected,
      score101: 0,
      odayId: null,
      position: index,
      isReady: p.isReady,
    })),
    indicatorTile: apiGame.indicatorTile as unknown as import('@/lib/game/types').Tile | null,
    okeyTile: apiGame.okeyTile as unknown as import('@/lib/game/types').Tile | null,
    discardPile: apiGame.discardPileTop ? [apiGame.discardPileTop as unknown as import('@/lib/game/types').Tile] : [],
    tileBag: Array(apiGame.tileBagCount).fill(null),
    roundNumber: 1,
    dealerIndex: 0,
    currentTurn: apiGame.currentTurn,
    turnPhase: apiGame.turnPhase as 'draw' | 'discard',
    winnerId: apiGame.winnerId || null,
    turnStartedAt: apiGame.turnStartedAt ? new Date(apiGame.turnStartedAt).getTime() : Date.now(),
    turnTimeLimit: apiGame.turnTimeLimit,
    createdAt: new Date(apiGame.createdAt).getTime(),
    startedAt: apiGame.startedAt ? new Date(apiGame.startedAt).getTime() : null,
    finishedAt: apiGame.finishedAt ? new Date(apiGame.finishedAt).getTime() : null,
  };
}

// Loading fallback
function PlayLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 flex items-center justify-center ottoman-pattern">
      <div className="text-center bg-stone-900/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-600/30">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-amber-300 mx-auto mb-4"></div>
        <p className="text-amber-200 text-lg font-medium">Yükleniyor...</p>
        <p className="text-amber-400/60 text-sm mt-2">Kahveniz hazırlanıyor 🫖</p>
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
