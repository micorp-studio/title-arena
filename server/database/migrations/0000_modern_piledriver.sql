CREATE TABLE `battles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `title_options` (
	`id` text PRIMARY KEY NOT NULL,
	`battle_id` text NOT NULL,
	`content` text NOT NULL,
	`score` integer DEFAULT 1000,
	FOREIGN KEY (`battle_id`) REFERENCES `battles`(`id`) ON UPDATE no action ON DELETE no action
);
