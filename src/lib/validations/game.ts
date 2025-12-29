import { z } from 'zod';

export const gameRulesSchema = z.object({
  variant: z.enum(['okey', 'okey101']).optional().default('okey'),
  openingRequired: z.boolean().optional().default(false),
  openingMinScore: z.number().int().optional().default(0),
  allowCift: z.boolean().optional().default(true),
  timeoutPolicy: z.enum(['auto_discard_random', 'auto_discard_last_drawn', 'skip_turn']).optional().default('auto_discard_random'),
});

export const stakeSchema = z.object({
  entryFee: z.number().int().min(0).optional(),
  potDistribution: z.enum(['winner_takes_all', 'proportional']).optional().default('winner_takes_all'),
});

export const createGameSchema = z.object({
  mode: z.enum(['regular', 'okey101']).optional().default('regular'),
  maxPlayers: z.number().int().min(2).max(4).optional().default(4),
  isPrivate: z.boolean().optional().default(false),
  turnTimeLimit: z.number().int().min(10).max(120).optional().default(30),
  fillWithAI: z.boolean().optional().default(true),
  rules: gameRulesSchema.optional(),
  stake: stakeSchema.optional(),
});

export const joinByCodeSchema = z.object({
  roomCode: z.string().min(1, 'Oda kodu gerekli'),
});

export const drawSchema = z.object({
  source: z.enum(['pile', 'discard']),
});

export const discardSchema = z.object({
  tileId: z.string().min(1, 'Taş ID gerekli'),
});

export const finishSchema = z.object({
  discardTileId: z.string().min(1, 'Atacak taş ID gerekli'),
});

export const validateHandSchema = z.object({
  discardTileId: z.string().optional(),
});

export type GameRulesInput = z.infer<typeof gameRulesSchema>;
export type StakeInput = z.infer<typeof stakeSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type JoinByCodeInput = z.infer<typeof joinByCodeSchema>;
export type DrawInput = z.infer<typeof drawSchema>;
export type DiscardInput = z.infer<typeof discardSchema>;
export type FinishInput = z.infer<typeof finishSchema>;
export type ValidateHandInput = z.infer<typeof validateHandSchema>;
