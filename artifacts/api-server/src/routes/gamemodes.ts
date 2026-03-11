import { Router, type IRouter } from "express";
import { db, gamemodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: any): boolean {
  return !!(req.session && req.session.isAdmin);
}

router.get("/gamemodes", async (req, res) => {
  try {
    const gamemodes = await db.select().from(gamemodesTable);
    res.json(gamemodes.map(g => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/gamemodes", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { name, slug, description, defaultWeapon } = req.body;
    if (!name || !slug || !defaultWeapon) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const [created] = await db.insert(gamemodesTable).values({
      name,
      slug,
      description: description || null,
      defaultWeapon,
    }).returning();
    res.status(201).json({
      ...created,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/gamemodes/:id", async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  try {
    const id = parseInt(req.params.id, 10);
    const [deleted] = await db.delete(gamemodesTable).where(eq(gamemodesTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
