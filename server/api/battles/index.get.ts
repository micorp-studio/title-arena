// server/api/battles/index.get.ts
import { defineEventHandler } from 'h3';
import { useDrizzle, tables, desc, mapBattleRecord } from '~/server/utils/drizzle';
import type { Battle } from '~/types';

export default defineEventHandler(async (event): Promise<Battle[]> => {
  try {
    const db = useDrizzle();
    
    // Get all battles with their title options
    const battles = await db.query.battles.findMany({
      orderBy: [desc(tables.battles.createdAt)],
      with: {
        titleOptions: true
      }
    });
    
    // Map database records to application types
    return battles.map(mapBattleRecord);
  } catch (error) {
    console.error('Error fetching battles:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch battles'
    });
  }
});
