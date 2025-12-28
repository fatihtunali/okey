// ============================================
// TILE MANAGEMENT
// ============================================

import { Tile, TileColor, TileNumber } from './types';

// All tile colors
export const TILE_COLORS: TileColor[] = ['red', 'yellow', 'blue', 'black'];

// All tile numbers
export const TILE_NUMBERS: TileNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Generate a unique tile ID
 */
export function generateTileId(): string {
  return `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a single tile
 */
export function createTile(number: TileNumber, color: TileColor, isJoker = false): Tile {
  return {
    id: generateTileId(),
    number,
    color,
    isJoker,
  };
}

/**
 * Create a complete set of 106 Okey tiles
 * - 4 colors × 13 numbers × 2 sets = 104 tiles
 * - 2 false jokers (sahte okey)
 */
export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];

  // Create 2 sets of each color/number combination
  for (let set = 0; set < 2; set++) {
    for (const color of TILE_COLORS) {
      for (const number of TILE_NUMBERS) {
        tiles.push(createTile(number, color, false));
      }
    }
  }

  // Add 2 false jokers (they act as any tile when okey is determined)
  // False jokers are typically represented as special tiles
  tiles.push({
    id: generateTileId(),
    number: 1, // Placeholder number
    color: 'red', // Placeholder color
    isJoker: true,
  });
  tiles.push({
    id: generateTileId(),
    number: 1,
    color: 'red',
    isJoker: true,
  });

  return tiles;
}

/**
 * Shuffle tiles using Fisher-Yates algorithm
 */
export function shuffleTiles(tiles: Tile[]): Tile[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Determine the indicator tile (gösterge) and okey tile
 * The okey is the tile with the same color but number + 1
 * If indicator is 13, okey is 1 of same color
 */
export function determineOkey(tiles: Tile[]): { indicator: Tile; okey: Tile } {
  // Pick a random tile as indicator (excluding jokers)
  const nonJokers = tiles.filter(t => !t.isJoker);
  const randomIndex = Math.floor(Math.random() * nonJokers.length);
  const indicator = nonJokers[randomIndex];

  // Okey is same color, number + 1 (wraps from 13 to 1)
  const okeyNumber = indicator.number === 13 ? 1 : (indicator.number + 1) as TileNumber;

  const okey: Tile = {
    id: 'okey_indicator',
    number: okeyNumber,
    color: indicator.color,
    isJoker: false,
  };

  return { indicator, okey };
}

/**
 * Check if a tile is the okey (can act as any tile)
 */
export function isOkey(tile: Tile, okeyTile: Tile): boolean {
  // False jokers are always okey
  if (tile.isJoker) return true;

  // Regular tiles matching the okey specification
  return tile.number === okeyTile.number && tile.color === okeyTile.color;
}

/**
 * Deal tiles to players
 * - Dealer gets 15 tiles
 * - Others get 14 tiles
 */
export function dealTiles(
  tiles: Tile[],
  playerCount: number,
  dealerIndex: number
): { hands: Tile[][]; remaining: Tile[] } {
  const shuffled = shuffleTiles(tiles);
  const hands: Tile[][] = [];
  let tileIndex = 0;

  for (let i = 0; i < playerCount; i++) {
    const tileCount = i === dealerIndex ? 15 : 14;
    hands.push(shuffled.slice(tileIndex, tileIndex + tileCount));
    tileIndex += tileCount;
  }

  return {
    hands,
    remaining: shuffled.slice(tileIndex),
  };
}

/**
 * Sort tiles by color then number (for display)
 */
export function sortTiles(tiles: Tile[]): Tile[] {
  const colorOrder: Record<TileColor, number> = {
    red: 0,
    yellow: 1,
    blue: 2,
    black: 3,
  };

  return [...tiles].sort((a, b) => {
    // Jokers go to the end
    if (a.isJoker && !b.isJoker) return 1;
    if (!a.isJoker && b.isJoker) return -1;
    if (a.isJoker && b.isJoker) return 0;

    // Sort by color first
    const colorDiff = colorOrder[a.color] - colorOrder[b.color];
    if (colorDiff !== 0) return colorDiff;

    // Then by number
    return a.number - b.number;
  });
}

/**
 * Sort tiles by number then color (alternative)
 */
export function sortTilesByNumber(tiles: Tile[]): Tile[] {
  const colorOrder: Record<TileColor, number> = {
    red: 0,
    yellow: 1,
    blue: 2,
    black: 3,
  };

  return [...tiles].sort((a, b) => {
    if (a.isJoker && !b.isJoker) return 1;
    if (!a.isJoker && b.isJoker) return -1;
    if (a.isJoker && b.isJoker) return 0;

    // Sort by number first
    const numDiff = a.number - b.number;
    if (numDiff !== 0) return numDiff;

    // Then by color
    return colorOrder[a.color] - colorOrder[b.color];
  });
}

/**
 * Get tile display value (for UI)
 */
export function getTileDisplay(tile: Tile): string {
  if (tile.isJoker) return '★';
  return tile.number.toString();
}

/**
 * Get tile color class (for Tailwind)
 */
export function getTileColorClass(tile: Tile): string {
  if (tile.isJoker) return 'text-amber-600';

  const colorClasses: Record<TileColor, string> = {
    red: 'text-red-600',
    yellow: 'text-amber-500',
    blue: 'text-blue-600',
    black: 'text-gray-900',
  };

  return colorClasses[tile.color];
}

/**
 * Count tiles by color
 */
export function countByColor(tiles: Tile[]): Record<TileColor, number> {
  const counts: Record<TileColor, number> = { red: 0, yellow: 0, blue: 0, black: 0 };
  for (const tile of tiles) {
    if (!tile.isJoker) {
      counts[tile.color]++;
    }
  }
  return counts;
}

/**
 * Count tiles by number
 */
export function countByNumber(tiles: Tile[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 13; i++) counts[i] = 0;

  for (const tile of tiles) {
    if (!tile.isJoker) {
      counts[tile.number]++;
    }
  }
  return counts;
}

/**
 * Find duplicate tiles (same number and color)
 */
export function findDuplicates(tiles: Tile[]): Tile[][] {
  const groups: Map<string, Tile[]> = new Map();

  for (const tile of tiles) {
    if (tile.isJoker) continue;
    const key = `${tile.number}-${tile.color}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tile);
  }

  return Array.from(groups.values()).filter(g => g.length > 1);
}
