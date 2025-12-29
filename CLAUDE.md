# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hadi Hep Beraber - A Turkish Okey game built with Next.js. Currently supports single-player with AI opponents. Multiplayer (Socket.io) and authentication (NextAuth) are scaffolded but not implemented yet.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 16 with App Router, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion
- **Database:** PostgreSQL via Prisma ORM (schema defined, not connected)
- **Planned:** NextAuth 5 for auth, Socket.io for multiplayer

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   └── play/page.tsx      # Game page
├── components/game/        # UI components
│   ├── GameBoard.tsx      # Main game layout
│   ├── Tile.tsx           # Tile rendering (5 sizes, 4 colors)
│   └── PlayerRack.tsx     # 30-slot drag-and-drop rack
├── hooks/
│   └── useGame.ts         # Game state management hook
└── lib/game/              # Core game logic (pure functions)
    ├── types.ts           # Type definitions
    ├── tiles.ts           # Tile creation, shuffling, sorting
    ├── game.ts            # Game state transitions
    ├── validation.ts      # Win condition checking
    └── ai.ts              # AI decision making
```

## Game Logic Details

### Tile Set Structure
- 106 tiles total: 2 complete sets (4 colors × 13 numbers × 2) + 2 false jokers
- Colors: red, yellow, blue, black
- Fisher-Yates shuffle in `tiles.ts`

### Turn Flow
1. Dealer gets 15 tiles, others get 14
2. Dealer starts in `discard` phase (must discard first)
3. Other turns: `draw` phase → `discard` phase
4. Draw from tile bag or discard pile top

### Okey Determination
- Random tile becomes "indicator" (gösterge)
- Okey = indicator number + 1, same color (13 wraps to 1)
- Okey tiles act as wildcards

### Win Validation (`validation.ts`)
- Uses recursive backtracking in `tryFormGroups()`
- Must form all 14 tiles into valid sets (per) or runs (seri)
- Set: 3-4 tiles, same number, different colors
- Run: 3+ consecutive tiles, same color
- Okeys can substitute for any tile

### AI System (`ai.ts`)
Three difficulty levels with different behaviors:
- **easy:** Random decisions, 3s thinking time
- **medium:** Evaluates tile values, 2s thinking time
- **hard:** Considers opponent strategy, 1.5s thinking time

AI evaluates tiles by: membership in complete groups (+50), potential groups (+15-20), middle numbers (+5), okey status (+100).

### Rack Layout
- 30 slots (15 per row) for free tile placement
- `rackLayout` state in `useGame.ts` tracks slot → tile ID mapping
- Separate from game state - purely visual organization

## Key Patterns

### State Updates
Game state functions in `lib/game/game.ts` are pure - they take a `GameState` and return a new `GameState`. The `useGame` hook wraps these with React state.

### Error Messages
All game errors are in Turkish (e.g., "Sıra sizde değil", "Taş bulunamadı"). These are thrown from game.ts functions.

### Turn Timer
- Default 30 seconds per turn
- Auto-move on timeout: draws from pile or discards random tile
- Timer visual is percentage-based in `GameBoard.tsx`

## Domain Terms

| Turkish | English | Description |
|---------|---------|-------------|
| Per | Set | 3-4 tiles, same number, different colors |
| Seri/El | Run | 3+ consecutive tiles, same color |
| Okey | Wildcard | Tile one above indicator, any color match |
| Sahte Okey | False Joker | 2 special tiles that act as okey |
| Gösterge | Indicator | Determines which tile is okey |
| Çift | Double | Special 7-pair win (2x scoring in 101) |

## API Specification

See `openapi.yaml` for full API spec. Key endpoint groups:

| Tag | Description | Priority |
|-----|-------------|----------|
| auth | Register, login (email/phone), OAuth | P0 |
| users | Profile, stats, settings | P0 |
| games | Create, join, list, leave + rules/stake | P0 |
| game-actions | Draw, discard, finish, validate-hand | P0 |
| game-events | Event log, replay | P1 |
| friends | Friend requests, invites | P1 |
| shop | Chips, VIP, cosmetics | P2 |
| leaderboard | Rankings, achievements | P2 |

### Key API Design Decisions

**Tile Type Clarity:**
```
tileType: normal | fake_okey
```
- `fake_okey` (sahte okey): Only represents real okey's value, NOT a wildcard
- Real okey is determined dynamically: `indicator.number + 1, same color`

**Game Rules Engine:**
```yaml
GameRules:
  variant: okey | okey101
  timeoutPolicy: auto_discard_random | auto_discard_last_drawn | skip_turn
  allowCift: boolean
  openingRequired: boolean
```

**Game Events (Replay/Audit):**
- `/games/{id}/events` - Full event log
- `/games/{id}/replay` - Initial state + all events
- Enables: cheat detection, AI training, spectator mode

**Stake System:**
```yaml
stake:
  entryFee: 100      # chips to join
  potDistribution: winner_takes_all | proportional
```

### Socket.io Events

**Client → Server:**
- `join_game`, `leave_game`, `ready`
- `draw`, `discard`, `finish`
- `chat`, `ping`

**Server → Client:**
- `game_state`, `turn_changed`, `turn_timeout`
- `tile_drawn`, `tile_discarded`
- `player_disconnected`, `player_reconnected`
- `game_finished`, `game_invite`, `error`

**Error Codes:** `NOT_YOUR_TURN`, `WRONG_PHASE`, `TILE_NOT_FOUND`, `INVALID_HAND`, `GAME_FULL`, `NOT_ENOUGH_CHIPS`

## Implementation Status

### Done ✅
- Game logic (tiles, validation, AI)
- UI components (GameBoard, Tile, PlayerRack)
- Single-player with AI opponents
- Drag-and-drop rack

### Not Started ❌
- Database connection (Prisma schema ready)
- API routes (see openapi.yaml)
- NextAuth integration
- Socket.io server
- 101 Okey UI (logic exists)
- Friends/chat system
- Shop/achievements
