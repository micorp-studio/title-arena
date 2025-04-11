// server/tasks/seed.ts
import { generateId, getCurrentTimestamp, logger } from '../utils/helpers';
import { useDrizzle, tables } from '../utils/drizzle';

const log = logger('db-seed');

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed the database with sample battles'
  },
  
  async run(event) {
    log.info('🌱 Seeding Versus database...');
    
    const db = useDrizzle();
    const now = getCurrentTimestamp();
    
    // Create first battle
    const battleId1 = generateId();
    
    await db.insert(tables.battles).values({
      id: battleId1,
      title: 'Best Title for a Foot Sniffing Documentary',
      createdAt: now,
      voteCount: 12
    });
    
    // Add title options for first battle
    const footTitles = [
      'Sole Mates: A Journey Into Foot Appreciation',
      'The Smell of Victory: Olympic Athletes and Their Secret Rituals',
      'Toe-tally Obsessed: Understanding Unusual Attractions',
      'Foot Fetish: Walking the Line Between Taboo and Normal',
      'Sniff Test: The Underground World of Foot Enthusiasts'
    ];
    
    for (const title of footTitles) {
      await db.insert(tables.titleOptions).values({
        id: generateId(),
        battleId: battleId1,
        content: title,
        score: 1000 + Math.floor(Math.random() * 200 - 100) // Randomize initial scores
      });
    }
    
    // Create second battle
    const battleId2 = generateId();
    
    await db.insert(tables.battles).values({
      id: battleId2,
      title: 'Reddit Post Title About My Roommate Sniffing My Feet',
      createdAt: now - 172800, // 2 days ago
      voteCount: 57
    });
    
    // Add title options for second battle
    const redditTitles = [
      'AITA for confronting my roommate about sniffing my feet while I sleep?',
      'My (24F) roommate (26M) has been sniffing my feet. How do I address this?',
      'UPDATE: Caught roommate in 4K sniffing my socks and feet',
      'Roommate has a secret foot fetish and I don\'t know how to tell him I know',
      'Advice needed: How to handle a roommate with an inappropriate boundary issue',
      'Is it normal for a roommate to be obsessed with feet? (Serious replies only)'
    ];
    
    for (const title of redditTitles) {
      await db.insert(tables.titleOptions).values({
        id: generateId(),
        battleId: battleId2,
        content: title,
        score: 1000 + Math.floor(Math.random() * 400 - 200) // More variance
      });
    }
    
    log.info('✅ Seeding completed successfully');
    
    // Return in the format expected by the task system
    return { 
      result: {
        success: true,
        battles: [
          { id: battleId1, title: 'Best Title for a Foot Sniffing Documentary' },
          { id: battleId2, title: 'Reddit Post Title About My Roommate Sniffing My Feet' }
        ]
      }
    };
  }
});