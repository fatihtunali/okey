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

export function useGame(options: UseGameOptions) {
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(options.turnTimeLimit || 30);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  return {
    game,
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
  };
}
