import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

function makeGamemodeTable(tableName: string) {
  return pgTable(tableName, {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    gamemode: text("gamemode").notNull(),
    tier: text("tier").notNull().default("LT5"),
    points: integer("points").notNull().default(0),
    weapon: text("weapon").notNull().default("Sword"),
    rank: integer("rank").notNull().default(0),
    skinUrl: text("skin_url"),
    customSkinUrl: text("custom_skin_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  });
}

export const playersTable = makeGamemodeTable("players");

export const overallPlayersTable = makeGamemodeTable("overall_players");
export const uhcPlayersTable = makeGamemodeTable("uhc_players");
export const nethpotPlayersTable = makeGamemodeTable("nethpot_players");
export const smpPlayersTable = makeGamemodeTable("smp_players");
export const axePlayersTable = makeGamemodeTable("axe_players");
export const macePlayersTable = makeGamemodeTable("mace_players");
export const spearPlayersTable = makeGamemodeTable("spear_players");
export const lifestealPlayersTable = makeGamemodeTable("lifesteal_players");
export const crystalPlayersTable = makeGamemodeTable("crystal_players");
export const swordPlayersTable = makeGamemodeTable("sword_players");

export const GAMEMODE_TABLES = {
  overall: overallPlayersTable,
  uhc: uhcPlayersTable,
  nethpot: nethpotPlayersTable,
  smp: smpPlayersTable,
  axe: axePlayersTable,
  mace: macePlayersTable,
  spear: spearPlayersTable,
  lifesteal: lifestealPlayersTable,
  crystal: crystalPlayersTable,
  sword: swordPlayersTable,
} as const;

export type GamemodeSlug = keyof typeof GAMEMODE_TABLES;

export const VALID_GAMEMODES: GamemodeSlug[] = [
  "overall", "uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword",
];

export const insertPlayerSchema = createInsertSchema(playersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
