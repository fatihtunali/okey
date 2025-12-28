// ============================================
// HAND VALIDATION
// Check if a hand is a winning hand (per/seri combinations)
// ============================================

import { Tile, TileColor, TileNumber, TileGroup, HandValidation } from './types';
import { isOkey, TILE_COLORS } from './tiles';

/**
 * Check if tiles form a valid SET (per)
 * A set is 3 or 4 tiles of the same number but different colors
 */
export function isValidSet(tiles: Tile[], okeyTile: Tile): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;

  // Count okeys and regular tiles
  const okeys: Tile[] = [];
  const regular: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      regular.push(tile);
    }
  }

  // If all are okeys, not a valid set
  if (regular.length === 0) return false;

  // All regular tiles must have the same number
  const targetNumber = regular[0].number;
  if (!regular.every(t => t.number === targetNumber)) return false;

  // All regular tiles must have different colors
  const colors = new Set(regular.map(t => t.color));
  if (colors.size !== regular.length) return false;

  // With okeys, total must be 3 or 4 with no duplicate colors
  return tiles.length >= 3 && tiles.length <= 4;
}

/**
 * Check if tiles form a valid RUN (seri/el)
 * A run is 3+ consecutive tiles of the same color
 */
export function isValidRun(tiles: Tile[], okeyTile: Tile): boolean {
  if (tiles.length < 3) return false;

  // Separate okeys and regular tiles
  const okeys: Tile[] = [];
  const regular: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      regular.push(tile);
    }
  }

  // If all are okeys, not a valid run
  if (regular.length === 0) return false;

  // All regular tiles must have the same color
  const targetColor = regular[0].color;
  if (!regular.every(t => t.color === targetColor)) return false;

  // Sort regular tiles by number
  const sorted = [...regular].sort((a, b) => a.number - b.number);

  // Check for valid sequence with okeys filling gaps
  let okeyCount = okeys.length;
  let prevNumber = sorted[0].number;

  for (let i = 1; i < sorted.length; i++) {
    const currNumber = sorted[i].number;
    const gap = currNumber - prevNumber - 1;

    if (gap < 0) {
      // Duplicate number (not allowed)
      return false;
    } else if (gap > 0) {
      // Need okeys to fill the gap
      if (gap > okeyCount) return false;
      okeyCount -= gap;
    }
    prevNumber = currNumber;
  }

  // Check if run wraps around (13, 1, 2 is valid in some variants)
  // For standard Okey, 13-1 is NOT consecutive
  // Special case: 12-13-1 or 13-1-2 are NOT valid

  return true;
}

/**
 * Find all possible sets in a hand
 */
export function findPossibleSets(tiles: Tile[], okeyTile: Tile): TileGroup[] {
  const groups: TileGroup[] = [];
  const used = new Set<string>();

  // Group tiles by number
  const byNumber: Map<number, Tile[]> = new Map();
  const okeys: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      if (!byNumber.has(tile.number)) {
        byNumber.set(tile.number, []);
      }
      byNumber.get(tile.number)!.push(tile);
    }
  }

  // For each number, try to form sets
  for (const [number, tilesWithNumber] of byNumber) {
    // Get unique colors
    const byColor: Map<TileColor, Tile[]> = new Map();
    for (const tile of tilesWithNumber) {
      if (!byColor.has(tile.color)) {
        byColor.set(tile.color, []);
      }
      byColor.get(tile.color)!.push(tile);
    }

    const uniqueColors = Array.from(byColor.keys());

    // If we have 3 or 4 different colors, we can form a set
    if (uniqueColors.length >= 3) {
      const setTiles: Tile[] = [];
      for (const color of uniqueColors.slice(0, 4)) {
        const tile = byColor.get(color)![0];
        setTiles.push(tile);
        used.add(tile.id);
      }
      groups.push({ type: 'set', tiles: setTiles });
    }
  }

  return groups;
}

/**
 * Find all possible runs in a hand
 */
export function findPossibleRuns(tiles: Tile[], okeyTile: Tile): TileGroup[] {
  const groups: TileGroup[] = [];

  // Group tiles by color
  const byColor: Map<TileColor, Tile[]> = new Map();
  const okeys: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      if (!byColor.has(tile.color)) {
        byColor.set(tile.color, []);
      }
      byColor.get(tile.color)!.push(tile);
    }
  }

  // For each color, find consecutive sequences
  for (const [color, tilesOfColor] of byColor) {
    // Sort by number
    const sorted = [...tilesOfColor].sort((a, b) => a.number - b.number);

    // Find all runs of 3+
    let currentRun: Tile[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = currentRun[currentRun.length - 1];
      const curr = sorted[i];

      if (curr.number === prev.number + 1) {
        // Consecutive
        currentRun.push(curr);
      } else if (curr.number === prev.number) {
        // Duplicate, skip
        continue;
      } else {
        // Gap - save current run if valid
        if (currentRun.length >= 3) {
          groups.push({ type: 'run', tiles: [...currentRun] });
        }
        currentRun = [curr];
      }
    }

    // Check last run
    if (currentRun.length >= 3) {
      groups.push({ type: 'run', tiles: [...currentRun] });
    }
  }

  return groups;
}

/**
 * Validate if a complete hand is a winning hand
 * All tiles must form valid sets or runs with no tiles left over
 * (except the tile being discarded to win)
 */
export function validateWinningHand(
  tiles: Tile[],
  okeyTile: Tile,
  discardTile?: Tile
): HandValidation {
  // Remove the discard tile if specified
  let handTiles = tiles;
  if (discardTile) {
    handTiles = tiles.filter(t => t.id !== discardTile.id);
  }

  // Winning hand must have exactly 14 tiles (after discard)
  if (handTiles.length !== 14) {
    return {
      isValid: false,
      groups: [],
      remainingTiles: handTiles,
      errorMessage: 'El 14 taş olmalı',
    };
  }

  // Try to find a valid combination
  const result = tryFormGroups(handTiles, okeyTile);

  if (result.remainingTiles.length === 0) {
    return {
      isValid: true,
      groups: result.groups,
      remainingTiles: [],
    };
  }

  return {
    isValid: false,
    groups: result.groups,
    remainingTiles: result.remainingTiles,
    errorMessage: 'Tüm taşlar per veya seri oluşturmalı',
  };
}

/**
 * Try to form groups from tiles (recursive backtracking)
 */
function tryFormGroups(
  tiles: Tile[],
  okeyTile: Tile,
  currentGroups: TileGroup[] = []
): { groups: TileGroup[]; remainingTiles: Tile[] } {
  // Base case: no tiles left
  if (tiles.length === 0) {
    return { groups: currentGroups, remainingTiles: [] };
  }

  // If less than 3 tiles, can't form a group
  if (tiles.length < 3) {
    return { groups: currentGroups, remainingTiles: tiles };
  }

  // Try to form sets first
  const setResult = tryFormSet(tiles, okeyTile);
  if (setResult) {
    const remaining = tiles.filter(t => !setResult.tiles.some(st => st.id === t.id));
    const result = tryFormGroups(remaining, okeyTile, [...currentGroups, setResult]);
    if (result.remainingTiles.length === 0) {
      return result;
    }
  }

  // Try to form runs
  const runResult = tryFormRun(tiles, okeyTile);
  if (runResult) {
    const remaining = tiles.filter(t => !runResult.tiles.some(rt => rt.id === t.id));
    const result = tryFormGroups(remaining, okeyTile, [...currentGroups, runResult]);
    if (result.remainingTiles.length === 0) {
      return result;
    }
  }

  // If we couldn't form complete groups, return best effort
  return {
    groups: currentGroups,
    remainingTiles: tiles,
  };
}

/**
 * Try to form a single set from tiles
 */
function tryFormSet(tiles: Tile[], okeyTile: Tile): TileGroup | null {
  // Group by number
  const byNumber: Map<number, Tile[]> = new Map();
  const okeys: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      if (!byNumber.has(tile.number)) {
        byNumber.set(tile.number, []);
      }
      byNumber.get(tile.number)!.push(tile);
    }
  }

  // Find a number with 3+ different colors
  for (const [number, tilesWithNumber] of byNumber) {
    const uniqueByColor: Map<TileColor, Tile> = new Map();
    for (const tile of tilesWithNumber) {
      if (!uniqueByColor.has(tile.color)) {
        uniqueByColor.set(tile.color, tile);
      }
    }

    if (uniqueByColor.size >= 3) {
      const setTiles = Array.from(uniqueByColor.values()).slice(0, Math.min(4, uniqueByColor.size));
      return { type: 'set', tiles: setTiles };
    }

    // Try with okeys
    if (uniqueByColor.size + okeys.length >= 3 && uniqueByColor.size >= 1) {
      const neededOkeys = 3 - uniqueByColor.size;
      if (neededOkeys <= okeys.length) {
        const setTiles = [...Array.from(uniqueByColor.values()), ...okeys.slice(0, neededOkeys)];
        return { type: 'set', tiles: setTiles };
      }
    }
  }

  return null;
}

/**
 * Try to form a single run from tiles
 */
function tryFormRun(tiles: Tile[], okeyTile: Tile): TileGroup | null {
  // Group by color
  const byColor: Map<TileColor, Tile[]> = new Map();
  const okeys: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      if (!byColor.has(tile.color)) {
        byColor.set(tile.color, []);
      }
      byColor.get(tile.color)!.push(tile);
    }
  }

  // For each color, try to find a run
  for (const [color, colorTiles] of byColor) {
    // Sort by number
    const sorted = [...colorTiles].sort((a, b) => a.number - b.number);

    // Try to find 3+ consecutive
    for (let start = 0; start < sorted.length; start++) {
      const run: Tile[] = [sorted[start]];

      for (let i = start + 1; i < sorted.length && run.length < 13; i++) {
        const expected = run[run.length - 1].number + 1;
        if (sorted[i].number === expected) {
          run.push(sorted[i]);
        } else if (sorted[i].number > expected) {
          break;
        }
        // Skip duplicates
      }

      if (run.length >= 3) {
        return { type: 'run', tiles: run };
      }
    }
  }

  return null;
}

/**
 * Check if hand is "çift" (double) - opening with pairs
 * Used in 101 Okey for bonus scoring
 */
export function isCiftOpening(tiles: Tile[], okeyTile: Tile): boolean {
  // Çift is when you finish with all pairs (7 pairs = 14 tiles)
  if (tiles.length !== 14) return false;

  const pairs: Tile[][] = [];
  const used = new Set<string>();

  for (const tile of tiles) {
    if (used.has(tile.id)) continue;

    // Find a matching tile
    const match = tiles.find(t =>
      t.id !== tile.id &&
      !used.has(t.id) &&
      ((t.number === tile.number && t.color === tile.color) ||
        isOkey(t, okeyTile) ||
        isOkey(tile, okeyTile))
    );

    if (match) {
      pairs.push([tile, match]);
      used.add(tile.id);
      used.add(match.id);
    }
  }

  return pairs.length === 7;
}

/**
 * Calculate the score for tiles left in hand (101 Okey)
 */
export function calculateTileScore(tiles: Tile[], okeyTile: Tile): number {
  let score = 0;

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      // Okey tiles are worth double
      score += okeyTile.number * 2;
    } else {
      score += tile.number;
    }
  }

  return score;
}
