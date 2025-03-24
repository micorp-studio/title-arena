// server/database/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Battles table
export const battles = sqliteTable('battles', {
  id: text('id').primaryKey(),  // We'll generate UUID in the handler
  title: text('title').notNull(),
  createdAt: integer('created_at').notNull()
});

// Title options table
export const titleOptions = sqliteTable('title_options', {
  id: text('id').primaryKey(),  // We'll generate UUID in the handler
  battleId: text('battle_id').notNull().references(() => battles.id),
  content: text('content').notNull(),
  score: integer('score').default(1000) // Starting ELO score
});
