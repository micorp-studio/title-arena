// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';
import type { Battle, TitleOption } from '~/types';
import { logger } from './helpers';
import { sql, eq, and, or, desc } from 'drizzle-orm';

export { sql, eq, and, or, desc } from 'drizzle-orm'
export const tables = schema;

const log = logger('drizzle');

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}


// Map database records to application types
export function mapBattleRecord(battle: typeof schema.battles.$inferSelect & { 
  titleOptions: (typeof schema.titleOptions.$inferSelect)[] 
}): Battle {
  return {
    id: battle.id,
    title: battle.title,
    createdAt: battle.createdAt,
    voteCount: battle.voteCount,
    titleOptions: battle.titleOptions.map(option => ({
      id: option.id,
      battleId: option.battleId,
      content: option.content,
      score: option.score
    }))
  };
}

// Commonly used database operations
export function battleOperations() {
  const db = useDrizzle();
  
  return {
    // Find a battle by ID with its title options
    async findBattleById(id: string): Promise<Battle | null> {
      try {
        const battle = await db.query.battles.findFirst({
          where: eq(tables.battles.id, id),
          with: {
            titleOptions: true
          }
        });
        
        return battle ? mapBattleRecord(battle) : null;
      } catch (error) {
        log.error(`Error finding battle with ID ${id}:`, error);
        throw error;
      }
    },
    
    // Check if a battle exists
    async battleExists(id: string): Promise<boolean> {
      try {
        const battle = await db
          .select({ id: tables.battles.id })
          .from(tables.battles)
          .where(eq(tables.battles.id, id))
          .get();
        
        return !!battle;
      } catch (error) {
        log.error(`Error checking if battle with ID ${id} exists:`, error);
        throw error;
      }
    },
    
    // Get all battles with their title options
    async getAllBattles(): Promise<Battle[]> {
      try {
        const battles = await db.query.battles.findMany({
          orderBy: [desc(tables.battles.createdAt)],
          with: {
            titleOptions: true
          }
        });
        
        return battles.map(mapBattleRecord);
      } catch (error) {
        log.error('Error fetching all battles:', error);
        throw error;
      }
    },
    
    // Find a title option by ID
    async findTitleOptionById(id: string): Promise<typeof schema.titleOptions.$inferSelect | null> {
      try {
        const option = await db
          .select()
          .from(tables.titleOptions)
          .where(eq(tables.titleOptions.id, id))
          .get();
        
        return option || null;
      } catch (error) {
        log.error(`Error finding title option with ID ${id}:`, error);
        throw error;
      }
    },
    
    // Check if title options belong to a specific battle
    async validateTitleOptionsBelongToBattle(battleId: string, optionIds: string[]): Promise<boolean> {
      try {
        const options = await db
          .select()
          .from(tables.titleOptions)
          .where(and(
            eq(tables.titleOptions.battleId, battleId),
            inArray(tables.titleOptions.id, optionIds)
          ))
          .all();
        
        return options.length === optionIds.length;
      } catch (error) {
        log.error(`Error validating title options for battle ${battleId}:`, error);
        throw error;
      }
    },
    
    // Increment battle vote count
    async incrementBattleVoteCount(battleId: string): Promise<void> {
      try {
        await db
          .update(tables.battles)
          .set({ 
            voteCount: sql`${tables.battles.voteCount} + 1` 
          })
          .where(eq(tables.battles.id, battleId));
      } catch (error) {
        log.error(`Error incrementing vote count for battle ${battleId}:`, error);
        throw error;
      }
    }
  };
}

// Export DB record types for internal use
export type BattleRecord = typeof schema.battles.$inferSelect;
export type TitleOptionRecord = typeof schema.titleOptions.$inferSelect;
export type VoteRecord = typeof schema.votes.$inferSelect;

// Add missing function from drizzle-orm
function inArray(column: any, values: any[]) {
  return sql`${column} IN ${values}`;
}
