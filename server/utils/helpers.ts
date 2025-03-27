// server/utils/helpers.ts
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { CreateBattleRequest, UpdateBattleRequest, VoteRequest } from '~/types';

// Generate unique IDs
export function generateId(): string {
  return randomUUID();
}

// Get current timestamp in seconds
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

// Validation schemas
export const battleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  options: z.array(
    z.string().trim().min(1, 'Option cannot be empty').max(100, 'Option must be at most 100 characters')
  ).min(2, 'At least 2 options are required').max(30, 'Maximum 30 options allowed')
}) satisfies z.ZodType<CreateBattleRequest>;

export const updateBattleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  options: z.array(z.object({
    id: z.string().optional(),
    content: z.string().trim().min(1, 'Option cannot be empty').max(100, 'Option must be at most 100 characters')
  })).min(2, 'At least 2 options are required').max(30, 'Maximum 30 options allowed')
}) satisfies z.ZodType<UpdateBattleRequest>;

export const voteSchema = z.object({
  winnerId: z.string().uuid('Invalid winner ID'),
  loserId: z.string().uuid('Invalid loser ID')
}) satisfies z.ZodType<VoteRequest>;

// ELO rating calculator
export function calculateNewRatings(winnerScore: number, loserScore: number): { winnerNew: number, loserNew: number } {
  const K = 32; // K-factor: how much a single match affects the rating
  
  // Calculate expected scores (probability of winning)
  const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerScore - loserScore) / 400));
  
  // Calculate new ratings
  const winnerNew = Math.round(winnerScore + K * (1 - expectedWinner));
  const loserNew = Math.round(loserScore + K * (0 - expectedLoser));
  
  return { winnerNew, loserNew };
}
