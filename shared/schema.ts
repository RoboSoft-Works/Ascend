import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scores = sqliteTable("scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  perfectStreak: integer("perfect_streak").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const insertScoreSchema = createInsertSchema(scores).omit({ id: true, createdAt: true });

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
