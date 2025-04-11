// server/database/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Battles table
export const battles = sqliteTable('battles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: integer('created_at').notNull(),
  voteCount: integer('vote_count').notNull().default(0)
});

// Title options table
export const titleOptions = sqliteTable('title_options', {
  id: text('id').primaryKey(),
  battleId: text('battle_id').notNull().references(() => battles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  scoreElo: integer('scoreElo').notNull().default(1000),
  score: integer('score').notNull().default(0)
});

// Votes table to track individual votes for analytics
export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  battleId: text('battle_id')
    .notNull()
    .references(() => battles.id, { onDelete: 'cascade' }),
  winnerId: text('winner_id')
    .notNull()
    .references(() => titleOptions.id, { onDelete: 'cascade' }),
  loserId: text('loser_id')
    .notNull()
    .references(() => titleOptions.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull()
});

// Define relations
export const battlesRelations = relations(battles, ({ many }) => ({
  titleOptions: many(titleOptions)
}));

export const titleOptionsRelations = relations(titleOptions, ({ one }) => ({
  battle: one(battles, {
    fields: [titleOptions.battleId],
    references: [battles.id]
  })
}));

export const votesRelations = relations(votes, ({ one }) => ({
  battle: one(battles, {
    fields: [votes.battleId],
    references: [battles.id]
  }),
  winner: one(titleOptions, {
    fields: [votes.winnerId],
    references: [titleOptions.id]
  }),
  loser: one(titleOptions, {
    fields: [votes.loserId],
    references: [titleOptions.id]
  })
}));
