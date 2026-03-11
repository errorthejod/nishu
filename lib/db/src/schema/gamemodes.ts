import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamemodesTable = pgTable("gamemodes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  defaultWeapon: text("default_weapon").notNull().default("Sword"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGamemodeSchema = createInsertSchema(gamemodesTable).omit({ id: true, createdAt: true });
export type InsertGamemode = z.infer<typeof insertGamemodeSchema>;
export type Gamemode = typeof gamemodesTable.$inferSelect;
