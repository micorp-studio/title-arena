// server/api/battles/[id].get.ts
import { defineEventHandler } from 'h3';
import { battleOperations } from '~/server/utils/drizzle';
import { getBattleIdParam, logger } from '~/server/utils/helpers';
import type { Battle } from '~/types';

const log = logger('battles-get-by-id');

export default defineEventHandler(async (event): Promise<Battle> => {
  try {
    const id = getBattleIdParam(event);
    const { findBattleById } = battleOperations();
    
    const battle = await findBattleById(id);
    
    if (!battle) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    return battle;
  } catch (error) {
    if ((error as any).statusCode) {
      throw error;
    }
    
    log.error(`Failed to fetch battle details for ID: ${getRouterParams(event).id}`, error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch battle details'
    });
  }
});
