import { Router, type IRouter } from "express";
import { db, GAMEMODE_TABLES } from "@workspace/db";

const router: IRouter = Router();

function isAdmin(req: any): boolean {
  return !!(req.session && req.session.isAdmin);
}

router.get("/admin/backup/db", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const export_: Record<string, any[]> = {};
    for (const [slug, table] of Object.entries(GAMEMODE_TABLES)) {
      export_[slug] = await db.select().from(table);
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      tables: export_,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="neotiers-db-backup-${Date.now()}.json"`
    );
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Backup failed" });
  }
});

router.get("/admin/backup/sql", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  try {
    const lines: string[] = [
      "-- NEOTIERS Database Backup",
      `-- Exported: ${new Date().toISOString()}`,
      "",
    ];

    for (const [slug, table] of Object.entries(GAMEMODE_TABLES)) {
      const tableName = `${slug}_players`;
      const rows = await db.select().from(table);

      lines.push(`-- Table: ${tableName}`);
      lines.push(`DELETE FROM ${tableName};`);

      for (const row of rows) {
        const esc = (v: any) =>
          v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`;
        lines.push(
          `INSERT INTO ${tableName} (username, gamemode, tier, points, region, rank, skin_url, custom_skin_url) VALUES (${esc(row.username)}, ${esc(row.gamemode)}, ${esc(row.tier)}, ${row.points}, ${esc(row.region)}, ${row.rank}, ${esc(row.skinUrl)}, ${esc(row.customSkinUrl)});`
        );
      }
      lines.push("");
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="neotiers-db-backup-${Date.now()}.sql"`
    );
    res.send(lines.join("\n"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SQL backup failed" });
  }
});

router.get("/admin/backup/env", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const envExample = `# NEOTIERS Environment Variables
# Copy this file to .env and fill in your values

# Database connection (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/neotiers

# Session secret key (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password-here

# Server port (optional, defaults to 3001)
PORT=3001
`;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", 'attachment; filename=".env.example"');
  res.send(envExample);
});

export default router;
