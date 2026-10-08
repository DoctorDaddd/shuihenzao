import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  check,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
export const adminLoginLimit = sqliteTable("admin_login_limit", {
  id: text("id").primaryKey(),
  attempts: integer("attempts").notNull(),
  resetAt: integer("reset_at").notNull(),
});
export const members = sqliteTable(
  "members",
  {
    id: text("id").primaryKey(),
    role: text("role").notNull(),
    name: text("name").notNull(),
  },
  (t) => [
    uniqueIndex("one_member_per_role").on(t.role),
    check("member_role", sql`${t.role} IN ('admin', 'hero')`),
  ],
);
export const artworks = sqliteTable(
  "artworks",
  {
    id: text("id").primaryKey(),
    node: integer("node").notNull().unique(),
    imageKey: text("image_key").notNull(),
    title: text("title").notNull(),
    createdDate: text("created_date").notNull(),
    mood: text("mood").notNull().default(""),
    note: text("note").notNull().default(""),
    uploadedAt: text("uploaded_at").notNull(),
    requestId: text("request_id").notNull().unique(),
  },
  (t) => [check("node_range", sql`${t.node} BETWEEN 1 AND 25`)],
);
export const rewards = sqliteTable("rewards", {
  node: integer("node").primaryKey(),
  amount: integer("amount").notNull(),
  name: text("name").notNull(),
  unlockedAt: text("unlocked_at"),
  openedAt: text("opened_at"),
  paidAt: text("paid_at"),
  paymentNote: text("payment_note").notNull().default(""),
});
export const letters = sqliteTable(
  "letters",
  {
    id: text("id").primaryKey(),
    node: integer("node").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    published: integer("published").notNull().default(0),
    readAt: text("read_at"),
  },
  (t) => [check("letter_node_range", sql`${t.node} BETWEEN 1 AND 25`)],
);
