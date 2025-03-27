// server/api/battles/[id].delete.ts
import { defineEventHandler } from 'h3';
import { useDrizzle, eq, tables } from '~/server/utils/drizzle';
import type { DeleteBattleResponse } from '~/types';

export default defineEventHandler(async (event): Promise<DeleteBattleResponse> => {
  try {
    const { id } = getRouterParams(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Battle ID is required'
      });
    }
    
    const db = useDrizzle();
    
    // Check if battle exists
    const existingBattle = await db
      .select()
      .from(tables.battles)
      .where(eq(tables.battles.id, id))
      .get();
      
    if (!existingBattle) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Delete all associated title options first (if not using cascade)
    await db
      .delete(tables.titleOptions)
      .where(eq(tables.titleOptions.battleId, id));
    
    // Then delete the battle
    const deletedBattle = await db
      .delete(tables.battles)
      .where(eq(tables.battles.id, id))
      .returning()
      .get();

    if (!deletedBattle) {
      throw createError({
        statusCode: 500,
        message: 'Failed to delete battle'
      });
    }
    
    return {
      success: true,
      data: {
        id: deletedBattle.id,
        title: deletedBattle.title,
        createdAt: deletedBattle.createdAt,
        voteCount: deletedBattle.voteCount ?? 0
      }
    };
  } catch (error) {
    if ((error as any).statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to delete battle'
    });
  }
});
