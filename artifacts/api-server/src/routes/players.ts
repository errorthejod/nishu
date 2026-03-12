import { Router, type IRouter } from "express";
import { db, GAMEMODE_TABLES, VALID_GAMEMODES, type GamemodeSlug } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: any): boolean {
  return !!(req.session && req.session.isAdmin);
}

function getTable(gamemode: string) {
  const slug = gamemode.toLowerCase() as GamemodeSlug;
  return GAMEMODE_TABLES[slug] ?? null;
}

function formatPlayer(p: any, gamemode: string) {
  return {
    ...p,
    gamemode,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

// GET /api/players?gamemode=uhc&search=&sortBy=&limit=
router.get("/players", async (req, res) => {
  try {
    const { gamemode, search, sortBy, limit } = req.query as Record<string, string>;

    if (!gamemode || !VALID_GAMEMODES.includes(gamemode.toLowerCase() as GamemodeSlug)) {
      return res.status(400).json({ message: "Valid gamemode required. Options: " + VALID_GAMEMODES.join(", ") });
    }

    const table = getTable(gamemode)!;
    const conditions: any[] = [];
    if (search) conditions.push(ilike(table.username, `%${search}%`));

    let results = conditions.length > 0
      ? await db.select().from(table).where(and(...conditions))
      : await db.select().from(table);

    const TIER_ORDER: Record<string, number> = {
      HT1: 0, HT2: 1, HT3: 2, HT4: 3, HT5: 4,
      LT1: 5, LT2: 6, LT3: 7, LT4: 8, LT5: 9,
    };

    if (sortBy === "points") {
      results.sort((a, b) => b.points - a.points);
    } else if (sortBy === "tier") {
      results.sort((a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99));
    } else if (sortBy === "username") {
      results.sort((a, b) => a.username.localeCompare(b.username));
    } else {
      results.sort((a, b) => (a.rank || 0) - (b.rank || 0) || b.points - a.points);
    }

    if (limit) results = results.slice(0, parseInt(limit, 10));

    res.json(results.map(p => formatPlayer(p, gamemode)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/players
router.post("/players", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { username, gamemode, tier, points, weapon, customSkinUrl } = req.body;
    if (!username || !gamemode || !tier || points === undefined || !weapon) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const table = getTable(gamemode);
    if (!table) return res.status(400).json({ message: "Invalid gamemode: " + gamemode });

    const skinUrl = `https://mc-heads.net/avatar/${username}/64`;
    const [created] = await db.insert(table).values({
      username,
      gamemode,
      tier,
      points: parseInt(points, 10),
      weapon,
      rank: 0,
      skinUrl,
      customSkinUrl: customSkinUrl || null,
    }).returning();

    await recalcRanks(gamemode);

    res.status(201).json(formatPlayer(created, gamemode));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/players/:id  — searches all tables
router.get("/players/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { gamemode } = req.query as Record<string, string>;

    if (gamemode) {
      const table = getTable(gamemode);
      if (table) {
        const [player] = await db.select().from(table).where(eq(table.id, id));
        if (player) return res.json(formatPlayer(player, gamemode));
      }
    }

    for (const [slug, table] of Object.entries(GAMEMODE_TABLES)) {
      const [player] = await db.select().from(table).where(eq(table.id, id));
      if (player) return res.json(formatPlayer(player, slug));
    }

    res.status(404).json({ message: "Player not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/players/:id
router.put("/players/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const id = parseInt(req.params.id, 10);
    const { username, gamemode, tier, points, weapon, customSkinUrl } = req.body;

    const table = getTable(gamemode || "");
    if (!table) return res.status(400).json({ message: "Valid gamemode required in body" });

    const updateData: any = { updatedAt: new Date(), gamemode };
    if (username !== undefined) {
      updateData.username = username;
      updateData.skinUrl = `https://mc-heads.net/avatar/${username}/64`;
    }
    if (tier !== undefined) updateData.tier = tier;
    if (points !== undefined) updateData.points = parseInt(points, 10);
    if (weapon !== undefined) updateData.weapon = weapon;
    if (customSkinUrl !== undefined) updateData.customSkinUrl = customSkinUrl || null;

    const [updated] = await db.update(table).set(updateData).where(eq(table.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Player not found" });

    await recalcRanks(gamemode);
    res.json(formatPlayer(updated, gamemode));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/players/:id
router.delete("/players/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const id = parseInt(req.params.id, 10);
    const { gamemode } = req.query as Record<string, string>;

    const table = getTable(gamemode || "");
    if (!table) return res.status(400).json({ message: "Valid gamemode query param required" });

    const [deleted] = await db.delete(table).where(eq(table.id, id)).returning();
    if (!deleted) return res.status(404).json({ message: "Player not found" });

    await recalcRanks(gamemode);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

async function recalcRanks(gamemode: string) {
  const table = getTable(gamemode);
  if (!table) return;
  const all = await db.select().from(table);
  all.sort((a, b) => b.points - a.points);
  for (let i = 0; i < all.length; i++) {
    await db.update(table).set({ rank: i + 1 }).where(eq(table.id, all[i].id));
  }
}

export default router;
