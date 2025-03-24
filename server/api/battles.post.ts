// server/api/battles.post.ts
import { z } from 'zod';
import { useDrizzle, tables } from '../utils/drizzle';

// Simple ID generator
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event);
  
  // Validate with Zod
  const schema = z.object({
    title: z.string().min(3).max(100),
    options: z.array(z.string().min(1).max(100)).min(2)
  });
  
  try {
    const validData = schema.parse(body);
    const db = useDrizzle();
    
    // Create battle ID
    const battleId = generateId();
    const now = Math.floor(Date.now() / 1000);
    
    // Insert battle
    const battle = await db
      .insert(tables.battles)
      .values({
        id: battleId,
        title: validData.title,
        createdAt: now
      })
      .returning()
      .get();
    
    // Process options one by one
    const options = [];
    for (const optionContent of validData.options) {
      const option = await db
        .insert(tables.titleOptions)
        .values({
          id: generateId(),
          battleId: battle.id,
          content: optionContent
        })
        .returning()
        .get();
      
      options.push(option);
    }
    
    return {
      ...battle,
      options
    };
  } catch (error) {
    console.error('Error creating battle:', error);
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Invalid battle data'
    });
  }
});
