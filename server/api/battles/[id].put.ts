// server/api/battles/[id].put.ts
import { defineEventHandler } from 'h3';
import { generateId, getBattleIdParam, logger} from '~/server/utils/helpers';
import { updateBattleSchema } from '~/types/zod_schemas';
import { useDrizzle, eq, tables, mapBattleRecord, battleOperations } from '~/server/utils/drizzle';
import { ZodError } from 'zod';
import type { Battle, UpdateBattleRequest } from '~/types';

const log = logger('battles-update');

export default defineEventHandler(async (event): Promise<Battle> => {
  try {
    const id = getBattleIdParam(event);
    
    // Parse and validate request body
    const body = await readBody<UpdateBattleRequest>(event);
    const validData = updateBattleSchema.parse(body);
    
    const db = useDrizzle();
    const { battleExists } = battleOperations();
    
    // Verify battle exists
    const exists = await battleExists(id);
    if (!exists) {
      throw createError({
        statusCode: 404,
        message: 'Battle not found'
      });
    }
    
    // Update battle title
    await db
      .update(tables.battles)
      .set({ title: validData.title })
      .where(eq(tables.battles.id, id));
    
    // Get existing options
    const existingOptions = await db
      .select()
      .from(tables.titleOptions)
      .where(eq(tables.titleOptions.battleId, id))
      .all();
    
    const existingOptionIds = new Set(existingOptions.map(opt => opt.id));
    
    // Track option changes
    const optionsToAdd = [];
    const optionsToUpdate = [];
    
    // Properly categorize options
    for (const option of validData.options) {
      if (option.id && existingOptionIds.has(option.id)) {
        optionsToUpdate.push(option);
      } else {
        optionsToAdd.push(option);
      }
    }
    
    // Find options to delete
    const optionIdsToKeep = new Set(
      validData.options
        .filter(opt => opt.id)
        .map(opt => opt.id)
    );
    
    const optionsToDelete = existingOptions.filter(
      existingOpt => !optionIdsToKeep.has(existingOpt.id)
    );
    
    // Process deletions
    for (const option of optionsToDelete) {
      await db
        .delete(tables.titleOptions)
        .where(eq(tables.titleOptions.id, option.id));
    }
    
    // Process updates
    for (const option of optionsToUpdate) {
      if (option.id) { 
        await db
          .update(tables.titleOptions)
          .set({ content: option.content })
          .where(eq(tables.titleOptions.id, option.id));
      }
    }
    
    // Process additions
    for (const option of optionsToAdd) {
      await db
        .insert(tables.titleOptions)
        .values({
          id: generateId(),
          battleId: id,
          content: option.content,
          scoreElo: 1000,
          score: 0
        });
    }
    
    // Get updated battle with options
    const updatedBattle = await db.query.battles.findFirst({
      where: eq(tables.battles.id, id),
      with: {
        titleOptions: true
      }
    });
    
    if (!updatedBattle) {
      throw new Error('Failed to retrieve updated battle');
    }
    
    return mapBattleRecord(updatedBattle);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      });
    }
    log.error(`Failed to update battle with ID: ${getRouterParams(event).id}`, error);
    throw createError({
      statusCode: 500,
      message: (error as Error).message || 'Failed to update battle'
    });
  }
});
