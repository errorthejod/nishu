import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_USERNAME = "nishu";
const ADMIN_PASSWORD = "nishu2007";

router.post("/admin/login", async (req: any, res) => {
  try {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/admin/logout", (req: any, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/admin/me", (req: any, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable);
    if (settings.length === 0) {
      const [created] = await db.insert(settingsTable).values({
        backgroundType: "color",
        backgroundValue: null,
        serverIp: "neomc.fun",
        discordUrl: "https://discord.gg/7UxNZS3tph",
      }).returning();
      return res.json(created);
    }
    res.json(settings[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/settings", async (req: any, res) => {
  if (!(req.session && req.session.isAdmin)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { backgroundType, backgroundValue, serverIp, discordUrl } = req.body;
    const existing = await db.select().from(settingsTable);
    if (existing.length === 0) {
      const [created] = await db.insert(settingsTable).values({
        backgroundType: backgroundType || "color",
        backgroundValue: backgroundValue || null,
        serverIp: serverIp || "neomc.fun",
        discordUrl: discordUrl || "https://discord.gg/7UxNZS3tph",
      }).returning();
      return res.json(created);
    }
    const [updated] = await db.update(settingsTable).set({
      backgroundType: backgroundType ?? existing[0].backgroundType,
      backgroundValue: backgroundValue !== undefined ? backgroundValue : existing[0].backgroundValue,
      serverIp: serverIp ?? existing[0].serverIp,
      discordUrl: discordUrl ?? existing[0].discordUrl,
    }).where(eq(settingsTable.id, existing[0].id)).returning();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
