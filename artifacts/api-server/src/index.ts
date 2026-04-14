import app from "./app";
import { pool } from "@workspace/db";
import { autoSeedIfEmpty } from "./seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS gamemodes (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
`;

const GAMEMODE_SLUGS = ["overall","uhc","nethpot","smp","axe","mace","spear","lifesteal","crystal","sword"];

function makeTableSQL(name: string) {
  return `
    CREATE TABLE IF NOT EXISTS ${name} (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      gamemode TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'LT5',
      points INTEGER NOT NULL DEFAULT 0,
      region TEXT NOT NULL DEFAULT 'NA',
      rank INTEGER NOT NULL DEFAULT 0,
      skin_url TEXT,
      custom_skin_url TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
}

async function ensureSchema() {
  try {
    await pool.query(CREATE_TABLE_SQL);
    for (const slug of GAMEMODE_SLUGS) {
      await pool.query(makeTableSQL(`${slug}_players`));
    }
    await pool.query(makeTableSQL("players"));
    console.log("[schema] All tables ready.");
  } catch (err) {
    console.error("[schema] Schema setup failed (non-fatal):", err);
  }
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await ensureSchema();
  await autoSeedIfEmpty();
});
