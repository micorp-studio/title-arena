// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';
import type { Battle, TitleOption } from '~/types';

export { sql, eq, and, or, desc } from 'drizzle-orm'
export const tables = schema;

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
    voteCount: battle.voteCount ?? 0,
    titleOptions: battle.titleOptions.map(option => ({
      id: option.id,
      battleId: option.battleId,
      content: option.content,
      score: option.score ?? 1000
    }))
  };
}

// Export DB record types for internal use
export type BattleRecord = typeof schema.battles.$inferSelect;
export type TitleOptionRecord = typeof schema.titleOptions.$inferSelect;
export type VoteRecord = typeof schema.votes.$inferSelect;
