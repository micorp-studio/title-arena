// server/api/battles/index.post.ts
import { defineEventHandler } from 'h3';
import { battleSchema, generateId, getCurrentTimestamp } from '~/server/utils/helpers';
import { useDrizzle, mapBattleRecord } from '~/server/utils/drizzle';
import { ZodError } from 'zod';
import type { Battle, CreateBattleRequest } from '~/types';

export default defineEventHandler(async (event): Promise<Battle> => {
  try {
    // Parse and validate request body with Zod
    const body = await readBody<CreateBattleRequest>(event);
    const validData = battleSchema.parse(body);
    
    const db = useDrizzle();
    
    // Generate battle details
    const battleId = generateId();
    const now = getCurrentTimestamp();
    
    // Insert the battle
    await db
      .insert(tables.battles)
      .values({
        id: battleId,
        title: validData.title,
        createdAt: now,
        voteCount: 0
      });
    
    // Insert all title options
    for (const content of validData.options) {
      await db
        .insert(tables.titleOptions)
        .values({
          id: generateId(),
          battleId,
          content,
          score: 1000 // Initial ELO score
        });
    }
    
    // Get the created battle with options
    const battle = await db.query.battles.findFirst({
      where: eq(tables.battles.id, battleId),
      with: {
        titleOptions: true
      }
    });
    
    if (!battle) {
      throw new Error('Failed to retrieve created battle');
    }
    
    // Return the full battle with options
    return mapBattleRecord(battle);
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
      message: (error as Error).message || 'Failed to create battle'
    });
  }
});
