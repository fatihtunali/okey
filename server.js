const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3009', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory game rooms storage
const gameRooms = new Map();
const playerSockets = new Map(); // oderId -> socketId
const socketPlayers = new Map(); // socketId -> { oderId, gameId }

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a game room
    socket.on('join_game', ({ gameId, playerId, playerName }) => {
      console.log(`[Socket] Player ${playerName} (${playerId}) joining game ${gameId}`);

      socket.join(gameId);
      playerSockets.set(playerId, socket.id);
      socketPlayers.set(socket.id, { playerId, gameId });

      // Initialize room if needed
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, {
          players: new Map(),
          gameState: null,
          messages: [],
        });
      }

      const room = gameRooms.get(gameId);
      room.players.set(playerId, {
        id: playerId,
        name: playerName,
        socketId: socket.id,
        isConnected: true,
        isReady: false,
      });

      // Notify others in the room
      socket.to(gameId).emit('player_joined', {
        playerId,
        playerName,
        playerCount: room.players.size,
      });

      // Send current room state to the joining player
      socket.emit('room_state', {
        gameId,
        players: Array.from(room.players.values()),
        gameState: room.gameState,
        messages: room.messages.slice(-50), // Last 50 messages
      });

      // Broadcast updated player list
      io.to(gameId).emit('players_updated', {
        players: Array.from(room.players.values()),
      });
    });

    // Leave a game room
    socket.on('leave_game', ({ gameId, playerId }) => {
      handlePlayerLeave(socket, gameId, playerId);
    });

    // Player ready status
    socket.on('player_ready', ({ gameId, playerId, isReady }) => {
      const room = gameRooms.get(gameId);
      if (!room) return;

      const player = room.players.get(playerId);
      if (player) {
        player.isReady = isReady;
        io.to(gameId).emit('player_ready_changed', {
          playerId,
          isReady,
        });

        // Check if all players are ready
        const allReady = Array.from(room.players.values()).every(p => p.isReady);
        const playerCount = room.players.size;

        if (allReady && playerCount >= 2) {
          io.to(gameId).emit('all_players_ready', {
            playerCount,
          });
        }
      }
    });

    // Game state sync
    socket.on('game_state_update', ({ gameId, gameState }) => {
      const room = gameRooms.get(gameId);
      if (!room) return;

      room.gameState = gameState;
      socket.to(gameId).emit('game_state_sync', { gameState });
    });

    // Player draws a tile
    socket.on('draw_tile', ({ gameId, playerId, source }) => {
      console.log(`[Socket] Player ${playerId} drawing from ${source}`);
      io.to(gameId).emit('tile_drawn', {
        playerId,
        source,
        timestamp: Date.now(),
      });
    });

    // Player discards a tile
    socket.on('discard_tile', ({ gameId, playerId, tile }) => {
      console.log(`[Socket] Player ${playerId} discarding tile`);
      io.to(gameId).emit('tile_discarded', {
        playerId,
        tile,
        timestamp: Date.now(),
      });
    });

    // Player declares win
    socket.on('declare_win', ({ gameId, playerId, tiles }) => {
      console.log(`[Socket] Player ${playerId} declaring win`);
      io.to(gameId).emit('win_declared', {
        playerId,
        tiles,
        timestamp: Date.now(),
      });
    });

    // Turn changed
    socket.on('turn_changed', ({ gameId, currentTurn, turnPhase }) => {
      io.to(gameId).emit('turn_update', {
        currentTurn,
        turnPhase,
        timestamp: Date.now(),
      });
    });

    // Game finished
    socket.on('game_finished', ({ gameId, winnerId, results }) => {
      console.log(`[Socket] Game ${gameId} finished, winner: ${winnerId}`);
      io.to(gameId).emit('game_ended', {
        winnerId,
        results,
        timestamp: Date.now(),
      });

      // Clean up room after a delay
      setTimeout(() => {
        gameRooms.delete(gameId);
      }, 60000); // Keep room for 1 minute for reconnections
    });

    // Chat message
    socket.on('chat_message', ({ gameId, playerId, playerName, message }) => {
      const room = gameRooms.get(gameId);
      if (!room) return;

      const chatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playerId,
        playerName,
        message,
        timestamp: Date.now(),
      };

      room.messages.push(chatMessage);

      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }

      io.to(gameId).emit('chat_received', chatMessage);
    });

    // Emoji/reaction
    socket.on('send_reaction', ({ gameId, playerId, reaction }) => {
      io.to(gameId).emit('reaction_received', {
        playerId,
        reaction,
        timestamp: Date.now(),
      });
    });

    // Ping for latency measurement
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({ timestamp: Date.now() });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);

      const playerInfo = socketPlayers.get(socket.id);
      if (playerInfo) {
        const { playerId, gameId } = playerInfo;
        handlePlayerDisconnect(socket, gameId, playerId);
      }
    });

    // Handle reconnection attempt
    socket.on('reconnect_attempt', ({ gameId, playerId }) => {
      const room = gameRooms.get(gameId);
      if (!room) {
        socket.emit('reconnect_failed', { reason: 'Game no longer exists' });
        return;
      }

      const player = room.players.get(playerId);
      if (player) {
        player.socketId = socket.id;
        player.isConnected = true;
        playerSockets.set(playerId, socket.id);
        socketPlayers.set(socket.id, { playerId, gameId });

        socket.join(gameId);

        socket.emit('reconnect_success', {
          gameState: room.gameState,
          players: Array.from(room.players.values()),
        });

        socket.to(gameId).emit('player_reconnected', {
          playerId,
          playerName: player.name,
        });
      } else {
        socket.emit('reconnect_failed', { reason: 'Player not found in game' });
      }
    });
  });

  function handlePlayerLeave(socket, gameId, playerId) {
    const room = gameRooms.get(gameId);
    if (!room) return;

    room.players.delete(playerId);
    playerSockets.delete(playerId);
    socketPlayers.delete(socket.id);
    socket.leave(gameId);

    io.to(gameId).emit('player_left', {
      playerId,
      playerCount: room.players.size,
    });

    io.to(gameId).emit('players_updated', {
      players: Array.from(room.players.values()),
    });

    // Clean up empty rooms
    if (room.players.size === 0) {
      gameRooms.delete(gameId);
    }
  }

  function handlePlayerDisconnect(socket, gameId, playerId) {
    const room = gameRooms.get(gameId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      player.isConnected = false;

      io.to(gameId).emit('player_disconnected', {
        playerId,
        playerName: player.name,
      });

      // Give player 30 seconds to reconnect before removing
      setTimeout(() => {
        const currentRoom = gameRooms.get(gameId);
        if (currentRoom) {
          const currentPlayer = currentRoom.players.get(playerId);
          if (currentPlayer && !currentPlayer.isConnected) {
            handlePlayerLeave(socket, gameId, playerId);
          }
        }
      }, 30000);
    }
  }

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server attached`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
