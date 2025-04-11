// server/utils/helpers.ts
import { randomUUID } from 'node:crypto';
import type { H3Event } from 'h3';


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

// ELO rating
export function calculateEloRatings(
  winnerScore: number, 
  loserScore: number, 
  kFactor = 8
): { winnerEloNew: number, loserEloNew: number } {
  
  const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerScore - loserScore) / 400));
  
  const winnerEloNew = Math.round(winnerScore + kFactor * (1 - expectedWinner));
  const loserEloNew = Math.round(loserScore + kFactor * (0 - expectedLoser));
  
  return { winnerEloNew, loserEloNew };
}

export function calculateRatings(
  winnerScore: number, 
  loserScore: number, 
): { winnerNew: number, loserNew: number } {
  
  const winnerNew = winnerScore + 1;
  const loserNew = loserScore;
  
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
