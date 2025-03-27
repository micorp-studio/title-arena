// server/api/battles/[id].get.ts
import { defineEventHandler } from 'h3';
import { useDrizzle, eq, tables, mapBattleRecord } from '~/server/utils/drizzle';
import type { Battle } from '~/types';

export default defineEventHandler(async (event): Promise<Battle> => {
  try {
    const { id } = getRouterParams(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Battle ID is required'
      });
    }
    
    const db = useDrizzle();
    
    // Use the query builder with relations
    const battle = await db.query.battles.findFirst({
      where: eq(tables.battles.id, id),
      with: {
        titleOptions: true
      }
    });
    
    if (!battle) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Map to application type
    return mapBattleRecord(battle);
  } catch (error) {
    if ((error as any).statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch battle details'
    });
  }
});
