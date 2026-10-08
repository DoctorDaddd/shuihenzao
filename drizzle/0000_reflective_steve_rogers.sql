CREATE TABLE `artworks` (
	`id` text PRIMARY KEY NOT NULL,
	`node` integer NOT NULL,
	`image_key` text NOT NULL,
	`title` text NOT NULL,
	`created_date` text NOT NULL,
	`mood` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`uploaded_at` text NOT NULL,
	`request_id` text NOT NULL,
	CONSTRAINT "node_range" CHECK("artworks"."node" BETWEEN 1 AND 25)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artworks_node_unique` ON `artworks` (`node`);--> statement-breakpoint
CREATE UNIQUE INDEX `artworks_request_id_unique` ON `artworks` (`request_id`);--> statement-breakpoint
CREATE TABLE `letters` (
	`id` text PRIMARY KEY NOT NULL,
	`node` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`read_at` text,
	CONSTRAINT "letter_node_range" CHECK("letters"."node" BETWEEN 1 AND 25)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT "member_role" CHECK("members"."role" IN ('admin', 'hero'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_member_per_role` ON `members` (`role`);--> statement-breakpoint
CREATE TABLE `rewards` (
	`node` integer PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL,
	`name` text NOT NULL,
	`unlocked_at` text,
	`opened_at` text,
	`paid_at` text,
	`payment_note` text DEFAULT '' NOT NULL
);
