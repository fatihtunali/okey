'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameSettings, Tile } from '@/lib/game/types';
import {
  createGame,
  addPlayer,
  fillWithAI,
  startGame,
  drawFromPile,
  drawFromDiscard,
  discardTile,
  declareWin,
  handleTimeout,
} from '@/lib/game/game';
import { getAIDecision } from '@/lib/game/ai';

interface UseGameOptions {
  mode: 'regular' | 'okey101';
  playerName: string;
  playerId: string;
  turnTimeLimit?: number;
}

const RACK_SIZE = 28; // 14 slots per row, 2 rows

export function useGame(options: UseGameOptions) {
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(options.turnTimeLimit || 30);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Rack layout: 30 slots, each contains tile ID or null
  // This allows players to arrange tiles freely with gaps
  const [rackLayout, setRackLayout] = useState<(string | null)[]>(() =>
    Array(RACK_SIZE).fill(null)
  );

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevTileIdsRef = useRef<string[]>([]);

  // Initialize game
  const initGame = useCallback(() => {
    const settings: GameSettings = {
      mode: options.mode,
      maxPlayers: 4,
      turnTimeLimit: options.turnTimeLimit || 30,
      isPrivate: false,
    };

    let newGame = createGame(settings, {
      id: options.playerId,
      name: options.playerName,
    });

    // Fill with AI players
    newGame = fillWithAI(newGame, 4);

    // Start the game
    newGame = startGame(newGame);

    setGame(newGame);
    setTimeRemaining(options.turnTimeLimit || 30);
    setSelectedTileId(null);
    setError(null);

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
  }, [options.mode, options.playerName, options.playerId, options.turnTimeLimit]);

  // Process AI turn
  const processAITurn = useCallback(() => {
    if (!game || game.status !== 'playing') return;

    const currentPlayer = game.players[game.currentTurn];
    if (!currentPlayer.isAI) return;

    setIsProcessingAI(true);

    const decision = getAIDecision(game, game.currentTurn);

    // Simulate thinking time
    aiTimeoutRef.current = setTimeout(() => {
      setGame((prevGame) => {
        if (!prevGame) return null;

        try {
          let newGame = prevGame;

          switch (decision.action) {
            case 'draw_pile':
              newGame = drawFromPile(newGame, currentPlayer.id);
              break;
            case 'draw_discard':
              newGame = drawFromDiscard(newGame, currentPlayer.id);
              break;
            case 'discard':
              if (decision.tileId) {
                newGame = discardTile(newGame, currentPlayer.id, decision.tileId);
              }
              break;
            case 'finish':
              if (decision.tileId) {
                newGame = declareWin(newGame, currentPlayer.id, decision.tileId);
              }
              break;
          }

          return newGame;
        } catch (err) {
          console.error('AI action error:', err);
          return prevGame;
        }
      });

      setIsProcessingAI(false);
    }, decision.thinkingTime);
  }, [game]);

  // Turn timer
  useEffect(() => {
    if (!game || game.status !== 'playing') return;

    const currentPlayer = game.players[game.currentTurn];
    const isPlayerTurn = currentPlayer.id === options.playerId;

    // Reset timer for new turn
    setTimeRemaining(options.turnTimeLimit || 30);

    // Clear existing timers
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
    }

    if (isPlayerTurn) {
      // Countdown timer for human player
      turnTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timeout - auto move
            setGame((prevGame) => {
              if (!prevGame) return null;
              return handleTimeout(prevGame);
            });
            return options.turnTimeLimit || 30;
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
    // Find removed tiles (discarded)
    const removedTileIds = prevTileIds.filter(id => !currentTileIds.includes(id));

    if (newTileIds.length > 0 || removedTileIds.length > 0) {
      setRackLayout(prev => {
        const newLayout = [...prev];

        // Remove discarded tiles from layout
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

      prevTileIdsRef.current = currentTileIds;
    }
  }, [game, options.playerId]);

  // Player actions
  const handleDrawFromPile = useCallback(() => {
    if (!game) return;
    try {
      const newGame = drawFromPile(game, options.playerId);
      setGame(newGame);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId]);

  const handleDrawFromDiscard = useCallback(() => {
    if (!game) return;
    try {
      const newGame = drawFromDiscard(game, options.playerId);
      setGame(newGame);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId]);

  const handleDiscard = useCallback(() => {
    if (!game || !selectedTileId) return;
    try {
      const newGame = discardTile(game, options.playerId, selectedTileId);
      setGame(newGame);
      setSelectedTileId(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId, selectedTileId]);

  // Discard a specific tile by ID (for drag-drop)
  const handleDiscardById = useCallback((tileId: string) => {
    if (!game) return;
    try {
      const newGame = discardTile(game, options.playerId, tileId);
      setGame(newGame);
      setSelectedTileId(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId]);

  const handleDeclareWin = useCallback(() => {
    if (!game || !selectedTileId) return;
    try {
      const newGame = declareWin(game, options.playerId, selectedTileId);
      setGame(newGame);
      setSelectedTileId(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [game, options.playerId, selectedTileId]);

  const handleTileSelect = useCallback((tile: Tile) => {
    setSelectedTileId((prev) => (prev === tile.id ? null : tile.id));
  }, []);

  // Move tile to a new position (drag and drop)
  // This only affects the visual rack layout, not the game state
  const handleTileMove = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setRackLayout(prev => {
      const newLayout = [...prev];
      const tileId = newLayout[fromIndex];

      // If target slot has a tile, swap them
      if (newLayout[toIndex] !== null) {
        newLayout[fromIndex] = newLayout[toIndex];
        newLayout[toIndex] = tileId;
      } else {
        // Move to empty slot
        newLayout[fromIndex] = null;
        newLayout[toIndex] = tileId;
      }

      return newLayout;
    });
  }, []);

  // Sort tiles by groups (same number, different colors) - 5/5 style
  const handleSortByGroups = useCallback(() => {
    if (!game) return;

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return;

    // Get current tiles and sort them
    const tiles = [...player.tiles];
    tiles.sort((a, b) => {
      if (a.number !== b.number) return a.number - b.number;
      const colorOrder = ['red', 'yellow', 'blue', 'black'];
      return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
    });

    // Update rack layout with sorted tiles
    const newLayout: (string | null)[] = Array(RACK_SIZE).fill(null);
    tiles.forEach((tile, i) => {
      newLayout[i] = tile.id;
    });
    setRackLayout(newLayout);
  }, [game, options.playerId]);

  // Sort tiles by runs (consecutive numbers, same color) - 1/2/3 style
  const handleSortByRuns = useCallback(() => {
    if (!game) return;

    const player = game.players.find(p => p.id === options.playerId);
    if (!player) return;

    // Get current tiles and sort them
    const tiles = [...player.tiles];
    tiles.sort((a, b) => {
      const colorOrder = ['red', 'yellow', 'blue', 'black'];
      const colorDiff = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
      if (colorDiff !== 0) return colorDiff;
      return a.number - b.number;
    });

    // Update rack layout with sorted tiles
    const newLayout: (string | null)[] = Array(RACK_SIZE).fill(null);
    tiles.forEach((tile, i) => {
      newLayout[i] = tile.id;
    });
    setRackLayout(newLayout);
  }, [game, options.playerId]);

  return {
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
    handleDiscardById,
    handleDeclareWin,
    handleTileSelect,
    handleTileMove,
    handleSortByGroups,
    handleSortByRuns,
  };
}
