import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  backgroundType: text("background_type").notNull().default("color"),
  backgroundValue: text("background_value"),
  serverIp: text("server_ip").notNull().default("neomc.fun"),
  discordUrl: text("discord_url").notNull().default("https://discord.gg/7UxNZS3tph"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
