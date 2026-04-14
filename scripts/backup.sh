#!/usr/bin/env bash
set -e

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="neotiers-backup-${DATE}"
BACKUP_DIR="/tmp/${BACKUP_NAME}"

echo "==> Creating backup: ${BACKUP_NAME}"

mkdir -p "${BACKUP_DIR}/src"
mkdir -p "${BACKUP_DIR}/public/assets"
mkdir -p "${BACKUP_DIR}/api"
mkdir -p "${BACKUP_DIR}/lib"

echo "==> Copying source files..."

cp -r artifacts/neotiers/src/. "${BACKUP_DIR}/src/"
cp -r artifacts/neotiers/public/. "${BACKUP_DIR}/public/" 2>/dev/null || true
cp artifacts/neotiers/package.json "${BACKUP_DIR}/"
cp artifacts/neotiers/vite.config.ts "${BACKUP_DIR}/" 2>/dev/null || true
cp artifacts/neotiers/tsconfig.json "${BACKUP_DIR}/" 2>/dev/null || true
cp artifacts/neotiers/index.html "${BACKUP_DIR}/" 2>/dev/null || true

cp -r artifacts/api-server/src/. "${BACKUP_DIR}/api/"
cp artifacts/api-server/package.json "${BACKUP_DIR}/api/" 2>/dev/null || true
cp artifacts/api-server/tsconfig.json "${BACKUP_DIR}/api/" 2>/dev/null || true

cp -r lib/ "${BACKUP_DIR}/lib/"

cp pnpm-workspace.yaml "${BACKUP_DIR}/" 2>/dev/null || true
cp package.json "${BACKUP_DIR}/root-package.json" 2>/dev/null || true

echo "==> Exporting database..."
if [ -n "${DATABASE_URL}" ]; then
  pg_dump "${DATABASE_URL}" --no-owner --no-acl -f "${BACKUP_DIR}/database-backup.sql" 2>/dev/null && \
    echo "    Database exported as SQL." || \
    echo "    WARNING: pg_dump failed. Download the SQL backup from Admin > Settings instead."
else
  echo "    WARNING: DATABASE_URL not set. Download the SQL backup from Admin > Settings instead."
fi

echo "==> Writing .env.example..."
cat > "${BACKUP_DIR}/.env.example" << 'EOF'
# NEOTIERS Environment Variables
# Copy this file to .env and fill in your values

DATABASE_URL=postgresql://user:password@host:5432/neotiers
SESSION_SECRET=your-super-secret-session-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password-here
PORT=3001
EOF

echo "==> Writing README..."
cat > "${BACKUP_DIR}/README.md" << 'EOF'
# NEOTIERS — Backup & Restore Guide

## What's in this backup

| Path | Contents |
|------|----------|
| `src/` | Frontend React source code |
| `api/` | Backend Express API source code |
| `lib/` | Shared libraries (DB schema, API client) |
| `public/` | Static assets (icons, images) |
| `database-backup.sql` | Full PostgreSQL dump (or download from Admin > Settings) |
| `.env.example` | Required environment variables |

---

## Restore on Render (Recommended — Full Stack)

1. **Create a PostgreSQL database** on [Render](https://render.com) (free tier available) or [Neon](https://neon.tech).
2. **Import the database**:
   ```bash
   psql $DATABASE_URL < database-backup.sql
   ```
3. **Fork this Replit project** or push code to a GitHub repo.
4. **Create a Web Service** on Render:
   - Build command: `pnpm install && pnpm run build`
   - Start command: `pnpm run start`
5. **Set environment variables** (from `.env.example`):
   - `DATABASE_URL` — from your Render/Neon DB
   - `SESSION_SECRET` — any long random string
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your admin login
6. Deploy. Your leaderboard will be live!

---

## Restore on Vercel or Netlify (Frontend Only)

> These platforms are serverless. You need to host the API separately on Render.

1. **Deploy API on Render** — follow steps above but only deploy the `api/` folder.
2. **Deploy frontend on Vercel**:
   - Root directory: `artifacts/neotiers`
   - Build command: `pnpm run build`
   - Output directory: `dist/public`
   - Add env var: `VITE_API_URL=https://your-render-api.onrender.com`
3. **Update CORS** in `api/src/app.ts` to allow your Vercel domain.

---

## Re-import the database from JSON backup

If you have a JSON backup (from Admin > Settings > Download JSON):

```js
// Node.js restore script — run with: node restore.js backup.json
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const data = JSON.parse(fs.readFileSync(process.argv[2]));

async function restore() {
  for (const [table, rows] of Object.entries(data.tables)) {
    const tname = `${table}_players`;
    await pool.query(`DELETE FROM ${tname}`);
    for (const row of rows) {
      await pool.query(
        `INSERT INTO ${tname} (username, gamemode, tier, points, region, rank, skin_url, custom_skin_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [row.username, row.gamemode, row.tier, row.points, row.region, row.rank, row.skinUrl, row.customSkinUrl]
      );
    }
    console.log(`Restored ${rows.length} rows to ${tname}`);
  }
  await pool.end();
  console.log("Done!");
}
restore().catch(console.error);
```

---

## Always backup before republishing!

Go to **Admin Panel > Site Config** and click **Download SQL** before every republish.
EOF

echo "==> Zipping..."
cd /tmp
zip -r "${BACKUP_NAME}.zip" "${BACKUP_NAME}" -q
mv "${BACKUP_NAME}.zip" "${OLDPWD}/"
rm -rf "${BACKUP_DIR}"

echo ""
echo "Backup complete: ${BACKUP_NAME}.zip"
echo "Download it from the Replit Files panel."
