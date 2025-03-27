// server/api/battles/[id]/vote.post.ts
import { defineEventHandler } from 'h3';
import { voteSchema, calculateNewRatings, generateId, getCurrentTimestamp } from '~/server/utils/helpers';
import { useDrizzle, eq, tables } from '~/server/utils/drizzle';
import { ZodError } from 'zod';
import type { VoteRequest, VoteResponse } from '~/types';

export default defineEventHandler(async (event): Promise<VoteResponse> => {
  try {
    const { id } = getRouterParams(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Battle ID is required'
      });
    }
    
    // Parse and validate request body with Zod
    const body = await readBody<VoteRequest>(event);
    const { winnerId, loserId } = voteSchema.parse(body);
    
    const db = useDrizzle();
    
    // Get the battle
    const battle = await db
      .select()
      .from(tables.battles)
      .where(eq(tables.battles.id, id))
      .get();
      
    if (!battle) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Get the options
    const winner = await db
      .select()
      .from(tables.titleOptions)
      .where(eq(tables.titleOptions.id, winnerId))
      .get();
      
    const loser = await db
      .select()
      .from(tables.titleOptions)
      .where(eq(tables.titleOptions.id, loserId))
      .get();
    
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
    
    // Calculate new scores
    const { winnerNew, loserNew } = calculateNewRatings(
      winner.score ?? 1000,
      loser.score ?? 1000
    );
    
    // Update winner score
    await db
      .update(tables.titleOptions)
      .set({ score: winnerNew })
      .where(eq(tables.titleOptions.id, winnerId));
    
    // Update loser score
    await db
      .update(tables.titleOptions)
      .set({ score: loserNew })
      .where(eq(tables.titleOptions.id, loserId));
    
    // Increment vote count on the battle
    await db
      .update(tables.battles)
      .set({ voteCount: (battle.voteCount ?? 0) + 1 })
      .where(eq(tables.battles.id, id));
    
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
        oldScore: winner.score ?? 1000,
        newScore: winnerNew
      },
      loser: {
        id: loser.id,
        content: loser.content,
        oldScore: loser.score ?? 1000,
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
    throw createError({
      statusCode: 500,
      message: (error as Error).message || 'Failed to vote'
    });
  }
});
