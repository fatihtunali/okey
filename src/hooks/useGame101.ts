'use client';

// ============================================
// 101 OKEY GAME HOOK
// State management for 101 Okey mode
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameSettings, Tile, Meld, OpeningType } from '@/lib/game/types';
import {
  create101Game,
  start101Game,
  draw101FromPile,
  draw101FromDiscard,
  discard101,
  openHand,
  layMeld,
  addToMeld,
  finish101Game,
  start101NextRound,
  ai101Move,
  validateMeldStructure,
  calculateMeldsPoints,
} from '@/lib/game/okey101';
import { sortTiles } from '@/lib/game/tiles';

interface UseGame101Options {
  playerName: string;
  playerId: string;
  turnTimeLimit?: number;
}

const RACK_SIZE = 28; // 14 slots per row, 2 rows

// Add AI players to game
function addAIPlayers(game: GameState): GameState {
  const aiNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Zeynep'];
  const usedNames = game.players.map(p => p.name);

  let updatedGame = { ...game };

  while (updatedGame.players.length < 4) {
    const availableNames = aiNames.filter(n => !usedNames.includes(n));
    const name = availableNames[Math.floor(Math.random() * availableNames.length)] || `Oyuncu ${updatedGame.players.length + 1}`;
    usedNames.push(name);

    updatedGame = {
      ...updatedGame,
      players: [
        ...updatedGame.players,
        {
          id: `ai_${Date.now()}_${updatedGame.players.length}`,
          odayId: null,
          name,
          position: updatedGame.players.length,
          tiles: [],
          isAI: true,
          aiDifficulty: 'medium',
          isConnected: true,
          isReady: true,
          score101: 0,
          hasOpened: false,
          openingType: null,
          isEliminated: false,
        },
      ],
    };
  }

  return updatedGame;
}

export function useGame101(options: UseGame101Options) {
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedTileIds, setSelectedTileIds] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(options.turnTimeLimit || 60);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showRoundResults, setShowRoundResults] = useState(false);
  const [pendingMelds, setPendingMelds] = useState<Meld[]>([]);

  // Rack layout for tile arrangement
  const [rackLayout, setRackLayout] = useState<(string | null)[]>(() =>
    Array(RACK_SIZE).fill(null)
  );

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevTileIdsRef = useRef<string[]>([]);

  // Initialize game
  const initGame = useCallback(() => {
    const settings: GameSettings = {
      mode: 'okey101',
      maxPlayers: 4,
      turnTimeLimit: options.turnTimeLimit || 60,
      isPrivate: false,
    };

    let newGame = create101Game(settings, {
      id: options.playerId,
      name: options.playerName,
    });

    // Fill with AI players
    newGame = addAIPlayers(newGame);

    // Start the game
    newGame = start101Game(newGame);

    setGame(newGame);
    setTimeRemaining(options.turnTimeLimit || 60);
    setSelectedTileIds(new Set());
    setError(null);
    setShowRoundResults(false);
    setPendingMelds([]);

    // Initialize rack layout with player's tiles
    const player = newGame.players.find(p => p.id === options.playerId);
    if (player) {
      const newLayout: (string | null)[] = Array(RACK_SIZE).fill(null);
      player.tiles.forEach((tile, i) => {
        newLayout[i] = tile.id;
      });
      setRackLayout(newLayout);
      prevTileIdsRef.current = player.tiles.map(t => t.id);
    }
  }, [options.playerName, options.playerId, options.turnTimeLimit]);

  // Process AI turn
  const processAITurn = useCallback(() => {
    if (!game || game.status !== 'playing') return;

    const currentPlayer = game.players[game.currentTurn];
    if (!currentPlayer.isAI) return;

    setIsProcessingAI(true);

    // Simulate thinking time (1.5-3 seconds)
    const thinkingTime = 1500 + Math.random() * 1500;

    aiTimeoutRef.current = setTimeout(() => {
      setGame((prevGame) => {
        if (!prevGame) return null;

        try {
          const newGame = ai101Move(prevGame);
          return newGame;
        } catch (err) {
          console.error('AI action error:', err);
          return prevGame;
        }
      });

      setIsProcessingAI(false);
    }, thinkingTime);
  }, [game]);

  // Turn timer effect
  useEffect(() => {
    if (!game || game.status !== 'playing') return;

    const currentPlayer = game.players[game.currentTurn];
    const isPlayerTurn = currentPlayer.id === options.playerId;

    // Reset timer for new turn
    setTimeRemaining(options.turnTimeLimit || 60);

    // Clear existing timers
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
    }

    if (isPlayerTurn) {
      // Countdown timer for human player
      turnTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timeout - auto discard random tile
            setGame((prevGame) => {
              if (!prevGame) return null;
              const player = prevGame.players.find(p => p.id === options.playerId);
              if (!player || player.tiles.length === 0) return prevGame;

              // If in draw phase, draw from pile first
              if (prevGame.turnPhase101 === 'draw') {
                try {
                  const afterDraw = draw101FromPile(prevGame, options.playerId);
                  const playerAfter = afterDraw.players.find(p => p.id === options.playerId);
                  if (playerAfter && playerAfter.tiles.length > 0) {
                    const randomTile = playerAfter.tiles[Math.floor(Math.random() * playerAfter.tiles.length)];
                    return discard101(afterDraw, options.playerId, randomTile.id);
                  }
                  return afterDraw;
                } catch {
                  return prevGame;
                }
              } else {
                // Discard random tile
                const randomTile = player.tiles[Math.floor(Math.random() * player.tiles.length)];
                try {
                  return discard101(prevGame, options.playerId, randomTile.id);
                } catch {
                  return prevGame;
                }
              }
            });
            return options.turnTimeLimit || 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (currentPlayer.isAI) {
      // AI turn
      processAITurn();
    }

    return () => {
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
      }
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [game?.currentTurn, game?.status, options.playerId, options.turnTimeLimit, processAITurn]);

  // Sync rack layout when player's tiles change
  useEffect(() => {
    if (!game) return;

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return;

    const currentTileIds = player.tiles.map(t => t.id);
    const prevTileIds = prevTileIdsRef.current;

    // Find new tiles (drawn)
    const newTileIds = currentTileIds.filter(id => !prevTileIds.includes(id));
    // Find removed tiles (discarded or played)
    const removedTileIds = prevTileIds.filter(id => !currentTileIds.includes(id));

    if (newTileIds.length > 0 || removedTileIds.length > 0) {
      setRackLayout(prev => {
        const newLayout = [...prev];

        // Remove tiles from layout
        removedTileIds.forEach(id => {
          const idx = newLayout.indexOf(id);
          if (idx !== -1) {
            newLayout[idx] = null;
          }
        });

        // Add new tiles to first available slots
        newTileIds.forEach(id => {
          const emptyIdx = newLayout.findIndex(slot => slot === null);
          if (emptyIdx !== -1) {
            newLayout[emptyIdx] = id;
          }
        });

        return newLayout;
      });

      // Clear selection for removed tiles
      setSelectedTileIds(prev => {
        const newSet = new Set(prev);
        removedTileIds.forEach(id => newSet.delete(id));
        return newSet;
      });

      prevTileIdsRef.current = currentTileIds;
    }
  }, [game, options.playerId]);

  // Show round results when round ends
  useEffect(() => {
    if (game?.status === 'finished' && game.roundResults && !showRoundResults) {
      setShowRoundResults(true);
    }
  }, [game?.status, game?.roundResults, showRoundResults]);

  // Player actions
  const handleDrawFromPile = useCallback(() => {
    if (!game) return;
    try {
      const newGame = draw101FromPile(game, options.playerId);
      setGame(newGame);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId]);

  const handleDrawFromDiscard = useCallback(() => {
    if (!game) return;
    try {
      const newGame = draw101FromDiscard(game, options.playerId);
      setGame(newGame);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId]);

  const handleDiscard = useCallback((tileId?: string) => {
    if (!game) return;
    const discardId = tileId || (selectedTileIds.size === 1 ? Array.from(selectedTileIds)[0] : null);
    if (!discardId) {
      setError('Atmak için bir taş seçin');
      return;
    }
    try {
      const newGame = discard101(game, options.playerId, discardId);
      setGame(newGame);
      setSelectedTileIds(new Set());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId, selectedTileIds]);

  // Toggle tile selection (multi-select for melding)
  const handleTileSelect = useCallback((tile: Tile) => {
    setSelectedTileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tile.id)) {
        newSet.delete(tile.id);
      } else {
        newSet.add(tile.id);
      }
      return newSet;
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedTileIds(new Set());
  }, []);

  // Create a meld from selected tiles
  const createMeld = useCallback((type: 'set' | 'run'): Meld | null => {
    if (!game) return null;

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return null;

    const selectedTiles = player.tiles.filter(t => selectedTileIds.has(t.id));
    if (selectedTiles.length < 3) {
      setError('En az 3 taş seçmelisiniz');
      return null;
    }

    const meld: Meld = {
      id: '',
      type,
      tiles: selectedTiles,
      ownerId: options.playerId,
      isLocked: false,
    };

    if (!validateMeldStructure(meld, game.okeyTile)) {
      setError(type === 'set' ? 'Geçersiz per (aynı sayı, farklı renkler)' : 'Geçersiz seri (ardışık sayılar, aynı renk)');
      return null;
    }

    return meld;
  }, [game, options.playerId, selectedTileIds]);

  // Add meld to pending melds (before opening)
  const addPendingMeld = useCallback((type: 'set' | 'run') => {
    const meld = createMeld(type);
    if (meld) {
      setPendingMelds(prev => [...prev, meld]);
      setSelectedTileIds(new Set());
      setError(null);
    }
  }, [createMeld]);

  // Remove pending meld
  const removePendingMeld = useCallback((index: number) => {
    setPendingMelds(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Calculate pending melds total points
  const getPendingMeldsPoints = useCallback((): number => {
    if (!game) return 0;
    return calculateMeldsPoints(pendingMelds, game.okeyTile);
  }, [game, pendingMelds]);

  // Open hand with pending melds
  const handleOpenHand = useCallback((openingType: 'series' | 'pairs') => {
    if (!game) return;
    if (pendingMelds.length === 0) {
      setError('Açmak için grup oluşturun');
      return;
    }

    try {
      const newGame = openHand(game, options.playerId, pendingMelds, openingType);
      setGame(newGame);
      setPendingMelds([]);
      setSelectedTileIds(new Set());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId, pendingMelds]);

  // Lay a new meld (after opening)
  const handleLayMeld = useCallback((type: 'set' | 'run') => {
    if (!game) return;

    const meld = createMeld(type);
    if (!meld) return;

    try {
      const newGame = layMeld(game, options.playerId, meld);
      setGame(newGame);
      setSelectedTileIds(new Set());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId, createMeld]);

  // Add tiles to existing meld
  const handleAddToMeld = useCallback((meldId: string, position: 'start' | 'end') => {
    if (!game) return;
    if (selectedTileIds.size === 0) {
      setError('Eklemek için taş seçin');
      return;
    }

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return;

    const tilesToAdd = player.tiles.filter(t => selectedTileIds.has(t.id));

    try {
      const newGame = addToMeld(game, options.playerId, meldId, tilesToAdd, position);
      setGame(newGame);
      setSelectedTileIds(new Set());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId, selectedTileIds]);

  // Start next round
  const handleNextRound = useCallback(() => {
    if (!game) return;
    try {
      const newGame = start101NextRound(game);
      setGame(newGame);
      setShowRoundResults(false);
      setSelectedTileIds(new Set());
      setPendingMelds([]);
      setError(null);

      // Reinitialize rack layout
      const player = newGame.players.find(p => p.id === options.playerId);
      if (player) {
        const newLayout: (string | null)[] = Array(RACK_SIZE).fill(null);
        player.tiles.forEach((tile, i) => {
          newLayout[i] = tile.id;
        });
        setRackLayout(newLayout);
        prevTileIdsRef.current = player.tiles.map(t => t.id);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId]);

  // Move tile in rack (drag and drop)
  const handleTileMove = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setRackLayout(prev => {
      const newLayout = [...prev];
      const tileId = newLayout[fromIndex];

      if (newLayout[toIndex] !== null) {
        // Swap
        newLayout[fromIndex] = newLayout[toIndex];
        newLayout[toIndex] = tileId;
      } else {
        // Move to empty
        newLayout[fromIndex] = null;
        newLayout[toIndex] = tileId;
      }

      return newLayout;
    });
  }, []);

  // Sort tiles by groups (same number)
  const handleSortByGroups = useCallback(() => {
    if (!game) return;

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return;

    const tiles = [...player.tiles];
    tiles.sort((a, b) => {
      if (a.isJoker && !b.isJoker) return 1;
      if (!a.isJoker && b.isJoker) return -1;
      if (a.number !== b.number) return a.number - b.number;
      const colorOrder = ['red', 'yellow', 'blue', 'black'];
      return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
    });

    const newLayout: (string | null)[] = Array(RACK_SIZE).fill(null);
    tiles.forEach((tile, i) => {
      newLayout[i] = tile.id;
    });
    setRackLayout(newLayout);
  }, [game, options.playerId]);

  // Sort tiles by runs (same color, consecutive)
  const handleSortByRuns = useCallback(() => {
    if (!game) return;

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return;

    const tiles = [...player.tiles];
    tiles.sort((a, b) => {
      if (a.isJoker && !b.isJoker) return 1;
      if (!a.isJoker && b.isJoker) return -1;
      const colorOrder = ['red', 'yellow', 'blue', 'black'];
      const colorDiff = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
      if (colorDiff !== 0) return colorDiff;
      return a.number - b.number;
    });

    const newLayout: (string | null)[] = Array(RACK_SIZE).fill(null);
    tiles.forEach((tile, i) => {
      newLayout[i] = tile.id;
    });
    setRackLayout(newLayout);
  }, [game, options.playerId]);

  // Get current player status
  const getCurrentPlayerStatus = useCallback(() => {
    if (!game) return null;
    const player = game.players.find(p => p.id === options.playerId);
    return player ? {
      hasOpened: player.hasOpened || false,
      openingType: player.openingType,
      score101: player.score101 || 0,
      isEliminated: player.isEliminated || false,
      tileCount: player.tiles.length,
    } : null;
  }, [game, options.playerId]);

  return {
    game,
    rackLayout,
    selectedTileIds,
    timeRemaining,
    error,
    isProcessingAI,
    showRoundResults,
    pendingMelds,
    initGame,
    handleDrawFromPile,
    handleDrawFromDiscard,
    handleDiscard,
    handleTileSelect,
    handleTileMove,
    handleSortByGroups,
    handleSortByRuns,
    handleOpenHand,
    handleLayMeld,
    handleAddToMeld,
    handleNextRound,
    addPendingMeld,
    removePendingMeld,
    getPendingMeldsPoints,
    clearSelection,
    getCurrentPlayerStatus,
    setShowRoundResults,
  };
}
