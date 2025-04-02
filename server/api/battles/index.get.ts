// server/api/battles/index.get.ts
import { defineEventHandler } from 'h3';
import { battleOperations } from '~/server/utils/drizzle';
import { logger } from '~/server/utils/helpers';
import type { Battle } from '~/types';

const log = logger('battles-get-all');

export default defineEventHandler(async (): Promise<Battle[]> => {
  try {
    const { getAllBattles } = battleOperations();
    return await getAllBattles();
  } catch (error) {
    log.error('Failed to fetch battles', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch battles'
    });
  }
});
