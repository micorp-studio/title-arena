// server/utils/helpers.ts
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { CreateBattleRequest, UpdateBattleRequest, VoteRequest } from '~/types';
import type { H3Event } from 'h3';


// Server configuration
export const serverConfig = {
  elo: {
    initialScore: 1000,
    kFactor: 32
  },
  options: {
    minPerBattle: 2
  }
};

// Generate unique IDs
export function generateId(): string {
  return randomUUID();
}

// Get current timestamp in seconds
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function logger(context: string) {
  return {
    info: (message: string, data?: any) => {
      console.log(`\x1b[34m[INFO]\x1b[0m ${context}: ${message}`, data || '');
    },
    error: (message: string, error?: any) => {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${context}: ${message}`, error || '');
    }
  };
}

// Validation schemas
export const battleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  options: z.array(
    z.string().trim().min(1, 'Option cannot be empty').max(100, 'Option must be at most 100 characters')
  ).min(serverConfig.options.minPerBattle, `At least ${serverConfig.options.minPerBattle} options are required`)
}) satisfies z.ZodType<CreateBattleRequest>;

export const updateBattleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  options: z.array(z.object({
    id: z.string().optional(),
    content: z.string().trim().min(1, 'Option cannot be empty').max(100, 'Option must be at most 100 characters')
  })).min(serverConfig.options.minPerBattle, `At least ${serverConfig.options.minPerBattle} options are required`)
}) satisfies z.ZodType<UpdateBattleRequest>;

export const voteSchema = z.object({
  winnerId: z.string().uuid('Invalid winner ID'),
  loserId: z.string().uuid('Invalid loser ID')
}) satisfies z.ZodType<VoteRequest>;

// ELO rating calculator with configurable K-factor
export function calculateNewRatings(
  winnerScore: number, 
  loserScore: number, 
  kFactor = serverConfig.elo.kFactor
): { winnerNew: number, loserNew: number } {
  // Calculate expected scores (probability of winning)
  const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerScore - loserScore) / 400));
  
  // Calculate new ratings
  const winnerNew = Math.round(winnerScore + kFactor * (1 - expectedWinner));
  const loserNew = Math.round(loserScore + kFactor * (0 - expectedLoser));
  
  return { winnerNew, loserNew };
}

// Common request parameter extraction
export function getBattleIdParam(event: H3Event): string {
  const { id } = getRouterParams(event);
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Battle ID is required'
    });
  }
  
  return id;
}
