import { db, GAMEMODE_TABLES, type GamemodeSlug } from "@workspace/db";
import { SEED_DATA } from "./seed-data";

export async function autoSeedIfEmpty() {
  try {
    for (const [, table] of Object.entries(GAMEMODE_TABLES)) {
      const existing = await db.select({ id: table.id }).from(table).limit(1);
      if (existing.length > 0) {
        console.log("[seed] Database already has data, skipping auto-seed.");
        return;
      }
    }

    console.log("[seed] Database is empty — restoring players from seed data...");

    for (const [slug, rows] of Object.entries(SEED_DATA)) {
      const table = GAMEMODE_TABLES[slug as GamemodeSlug];
      if (!table || !rows.length) continue;

      for (const row of rows) {
        await db.insert(table).values({
          username: row.username,
          gamemode: row.gamemode,
          tier: row.tier,
          points: row.points,
          region: row.region,
          rank: row.rank,
          skinUrl: row.skinUrl ?? `https://mc-heads.net/avatar/${row.username}/64`,
          customSkinUrl: row.customSkinUrl ?? null,
        });
      }

      console.log(`[seed]   ${slug}: ${rows.length} players restored`);
    }

    console.log("[seed] Auto-seed complete — all players restored!");
  } catch (err) {
    console.error("[seed] Auto-seed failed (non-fatal):", err);
  }
}
