CREATE TABLE `battles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL,
	`vote_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `title_options` (
	`id` text PRIMARY KEY NOT NULL,
	`battle_id` text NOT NULL,
	`content` text NOT NULL,
	`scoreElo` integer DEFAULT 1000 NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`battle_id`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`battle_id` text NOT NULL,
	`winner_id` text NOT NULL,
	`loser_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`battle_id`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`winner_id`) REFERENCES `title_options`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`loser_id`) REFERENCES `title_options`(`id`) ON UPDATE no action ON DELETE cascade
);
