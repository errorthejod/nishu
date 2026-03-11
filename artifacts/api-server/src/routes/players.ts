import { Router, type IRouter } from "express";
import { db, playersTable } from "@workspace/db";
import { eq, ilike, or, asc, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: any): boolean {
  return !!(req.session && req.session.isAdmin);
}

router.get("/players", async (req, res) => {
  try {
    const { gamemode, search, sortBy, limit } = req.query as Record<string, string>;
    let query = db.select().from(playersTable);

    const conditions: any[] = [];
    if (gamemode) conditions.push(eq(playersTable.gamemode, gamemode));
    if (search) conditions.push(ilike(playersTable.username, `%${search}%`));

    let results;
    if (conditions.length > 0) {
      const { and } = await import("drizzle-orm");
      results = await db.select().from(playersTable).where(and(...conditions));
    } else {
      results = await db.select().from(playersTable);
    }

    if (sortBy === "points") {
      results.sort((a, b) => b.points - a.points);
    } else if (sortBy === "tier") {
      const tierOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
      results.sort((a, b) => (tierOrder[a.tier] ?? 5) - (tierOrder[b.tier] ?? 5));
    } else if (sortBy === "username") {
      results.sort((a, b) => a.username.localeCompare(b.username));
    } else {
      results.sort((a, b) => a.rank - b.rank || b.points - a.points);
    }

    if (limit) {
      results = results.slice(0, parseInt(limit, 10));
    }

    res.json(results.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/players", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { username, gamemode, tier, points, weapon, customSkinUrl } = req.body;
    if (!username || !gamemode || !tier || points === undefined || !weapon) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const skinUrl = `https://mc-heads.net/avatar/${username}/64`;
    const allPlayers = await db.select().from(playersTable);
    const rank = allPlayers.length + 1;
    const [created] = await db.insert(playersTable).values({
      username,
      gamemode,
      tier,
      points: parseInt(points, 10),
      weapon,
      rank,
      skinUrl,
      customSkinUrl: customSkinUrl || null,
    }).returning();

    await recalcRanks();

    res.status(201).json({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/players/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [player] = await db.select().from(playersTable).where(eq(playersTable.id, id));
    if (!player) return res.status(404).json({ message: "Not found" });
    res.json({
      ...player,
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/players/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const id = parseInt(req.params.id, 10);
    const { username, gamemode, tier, points, weapon, customSkinUrl } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (username !== undefined) {
      updateData.username = username;
      updateData.skinUrl = `https://mc-heads.net/avatar/${username}/64`;
    }
    if (gamemode !== undefined) updateData.gamemode = gamemode;
    if (tier !== undefined) updateData.tier = tier;
    if (points !== undefined) updateData.points = parseInt(points, 10);
    if (weapon !== undefined) updateData.weapon = weapon;
    if (customSkinUrl !== undefined) updateData.customSkinUrl = customSkinUrl || null;

    const [updated] = await db.update(playersTable).set(updateData).where(eq(playersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Not found" });

    await recalcRanks();

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/players/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const id = parseInt(req.params.id, 10);
    const [deleted] = await db.delete(playersTable).where(eq(playersTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ message: "Not found" });
    await recalcRanks();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

async function recalcRanks() {
  const all = await db.select().from(playersTable);
  all.sort((a, b) => b.points - a.points);
  for (let i = 0; i < all.length; i++) {
    await db.update(playersTable).set({ rank: i + 1 }).where(eq(playersTable.id, all[i].id));
  }
}

export default router;
