// server/api/battles/[id]/vote.post.ts
import { defineEventHandler } from 'h3';
import { calculateRatings, calculateEloRatings, generateId, getCurrentTimestamp, getBattleIdParam, logger } from '~/server/utils/helpers';
import { voteSchema } from '~/types/zod_schemas';
import { useDrizzle, eq, tables, battleOperations } from '~/server/utils/drizzle';
import { ZodError } from 'zod';
import type { VoteRequest, VoteResponse } from '~/types';

const log = logger('battles-vote');

export default defineEventHandler(async (event): Promise<VoteResponse> => {
  try {
    const id = getBattleIdParam(event);
    
    // Parse and validate request body with Zod
    const body = await readBody<VoteRequest>(event);
    const { winnerId, loserId, winnerCard } = voteSchema.parse(body);
    
    const db = useDrizzle();
    const { findBattleById, findTitleOptionById, incrementBattleVoteCount } = battleOperations();
    
    // Get the battle
    const battle = await findBattleById(id);
    
    if (!battle) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Get the options
    const winner = await findTitleOptionById(winnerId);
    const loser = await findTitleOptionById(loserId);
    
    if (!winner || !loser) {
      throw createError({
        statusCode: 404,
        message: 'One or both title options not found'
      });
    }
    
    // Verify both options belong to the battle
    if (winner.battleId !== id || loser.battleId !== id) {
      throw createError({
        statusCode: 400,
        message: 'Title options do not belong to this battle'
      });
    }
    
    // Initialize with current values
    let winnerEloNew = winner.scoreElo;
    let loserEloNew = loser.scoreElo;
    let winnerNew = winner.score;
    let loserNew = loser.score;

    // Calculate new scores
    if (winnerCard === 'AB') {
      // For ties (AB), add 0.5 to both scores
      winnerEloNew += 0.5;
      loserEloNew += 0.5;
      winnerNew += 0.5;
      loserNew += 0.5;
    } else {
      // For clear winner, use the calculation functions
      const eloResults = calculateEloRatings(winner.scoreElo, loser.scoreElo);
      winnerEloNew = eloResults.winnerEloNew;
      loserEloNew = eloResults.loserEloNew;

      const standardResults = calculateRatings(winner.score, loser.score);
      winnerNew = standardResults.winnerNew;
      loserNew = standardResults.loserNew;
    }

    
    // Update winner score
    await db
      .update(tables.titleOptions)
      .set({ scoreElo: winnerEloNew, score: winnerNew })
      .where(eq(tables.titleOptions.id, winnerId));
    
    // Update loser score
    await db
      .update(tables.titleOptions)
      .set({ scoreElo: loserEloNew, score: loserNew })
      .where(eq(tables.titleOptions.id, loserId));
    
    // Increment vote count on the battle
    await incrementBattleVoteCount(id);
    
    // Record the vote for analytics
    await db
      .insert(tables.votes)
      .values({
        id: generateId(),
        battleId: id,
        winnerId,
        loserId,
        createdAt: getCurrentTimestamp()
      });
    
    // Return the updated scores
    return {
      winner: {
        id: winner.id,
        content: winner.content,
        oldScoreElo: winner.scoreElo,
        newScoreElo: winnerEloNew,
        oldScore: winner.score,
        newScore: winnerNew
      },
      loser: {
        id: loser.id,
        content: loser.content,
        oldScoreElo: loser.scoreElo,
        newScoreElo: loserEloNew,
        oldScore: loser.score,
        newScore: loserNew
      }
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      });
    }
    log.error(`Failed to process vote for battle ID: ${getRouterParams(event).id}`, error);
    throw createError({
      statusCode: 500,
      message: (error as Error).message || 'Failed to vote'
    });
  }
});
