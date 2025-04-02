// server/api/battles/[id].delete.ts
import { defineEventHandler } from 'h3';
import { useDrizzle, eq, tables, battleOperations } from '~/server/utils/drizzle';
import { getBattleIdParam, logger } from '~/server/utils/helpers';
import type { DeleteBattleResponse } from '~/types';

const log = logger('battles-delete');

export default defineEventHandler(async (event): Promise<DeleteBattleResponse> => {
  try {
    const id = getBattleIdParam(event);
    const db = useDrizzle();
    const { battleExists } = battleOperations();
    
    // Check if battle exists
    const exists = await battleExists(id);
    if (!exists) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Get battle details before deletion for the response
    const battleToDelete = await db
      .select()
      .from(tables.battles)
      .where(eq(tables.battles.id, id))
      .get();
    
    if (!battleToDelete) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Delete the battle (cascades to title options)
    await db
      .delete(tables.battles)
      .where(eq(tables.battles.id, id));
    
    return {
      success: true,
      data: {
        id: battleToDelete.id,
        title: battleToDelete.title,
        createdAt: battleToDelete.createdAt,
        voteCount: battleToDelete.voteCount
      }
    };
  } catch (error) {
    if ((error as any).statusCode) {
      throw error;
    }
    
    log.error(`Failed to delete battle with ID: ${getRouterParams(event).id}`, error);
    throw createError({
      statusCode: 500,
      message: 'Failed to delete battle'
    });
  }
});
