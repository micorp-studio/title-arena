// server/api/battles.get.ts
import { useDrizzle, tables } from '../utils/drizzle';

export default defineEventHandler(async () => {
  try {
    // Fetch all battles with their options
    const battles = await useDrizzle()
      .select({
        id: tables.battles.id,
        title: tables.battles.title,
        createdAt: tables.battles.createdAt,
      })
      .from(tables.battles)
      .all();

    // For each battle, get its options
    const battlesWithOptions = await Promise.all(
      battles.map(async (battle) => {
        const options = await useDrizzle()
          .select({
            id: tables.titleOptions.id,
            content: tables.titleOptions.content,
            score: tables.titleOptions.score,
          })
          .from(tables.titleOptions)
          .where(eq(tables.titleOptions.battleId, battle.id))
          .all();

        return {
          ...battle,
          options,
          optionCount: options.length,
        };
      })
    );

    return battlesWithOptions;
  } catch (error) {
    console.error('Error fetching battles:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch battles',
    });
  }
});
