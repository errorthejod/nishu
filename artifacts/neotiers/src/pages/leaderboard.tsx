import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { PlayerRow } from "@/components/player-row";
import { GamemodeTierBadge, GamemodeIcon, PlayerSkinViewer, getRankTitleFromPoints, getRankTitleColorFromPoints, getRankTitleStyle, handleSkinError, TIERS, TIER_ORDER, TierBadge } from "@/components/ui-elements";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Search, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Link } from "wouter";

async function fetchGamemodePlayers(gm: string): Promise<any[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${gm}.json`);
    if (res.ok) return res.json();
  } catch {}
  const res = await fetch(`/api/players?gamemode=${gm}&limit=200`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

type SortKey = "rank" | "username" | "tier" | "points";

export const GAMEMODE_META: Record<string, { label: string; color: string }> = {
  overall:   { label: "Overall",   color: "#FFD700" },
  uhc:       { label: "UHC",       color: "#f43f5e" },
  nethpot:   { label: "NethPot",   color: "#a855f7" },
  smp:       { label: "SMP",       color: "#14b8a6" },
  axe:       { label: "Axe",       color: "#f97316" },
  mace:      { label: "Mace",      color: "#eab308" },
  spear:     { label: "Spear",     color: "#22c55e" },
  lifesteal: { label: "Lifesteal", color: "#ec4899" },
  crystal:   { label: "Crystal",   color: "#06b6d4" },
  sword:     { label: "Sword",     color: "#ef4444" },
};

export const COL_WIDTHS = "48px 80px 1fr 72px 96px 56px 72px";
const RANKED_GAMEMODES = ["uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword"] as const;

interface LeaderboardProps { gamemode?: string; }

function RegionBadge({ region }: { region: string }) {
  const upper = (region || "NA").toUpperCase();
  const colors: Record<string, { bg: string; text: string }> = {
    NA: { bg: "#1e40af", text: "#93c5fd" },
    EU: { bg: "#14532d", text: "#86efac" },
    AS: { bg: "#7c3aed", text: "#c4b5fd" },
    OC: { bg: "#0e4f7c", text: "#7dd3fc" },
    IN: { bg: "#7c2d12", text: "#fdba74" },
    SA: { bg: "#065f46", text: "#6ee7b7" },
  };
  const c = colors[upper] ?? { bg: "#1e2235", text: "#9ca3af" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
      background: c.bg, color: c.text, display: "inline-block", letterSpacing: "0.05em",
    }}>{upper}</span>
  );
}

// ─── Overall (MCTiers-style) ─────────────────────────────────────────────────
function OverallLeaderboard() {
  const [search, setSearch] = useState("");

  const results = useQueries({
    queries: RANKED_GAMEMODES.map((gm) => ({
      queryKey: ["players", gm],
      queryFn: () => fetchGamemodePlayers(gm),
      staleTime: 30_000,
    })),
  });

  const merged = useMemo(() => {
    const map = new Map<string, { username: string; tiers: Record<string, string>; points: Record<string, number>; region: string; customSkinUrl?: string | null }>();
    RANKED_GAMEMODES.forEach((gm, i) => {
      const players: any[] = results[i]?.data ?? [];
      players.forEach((p) => {
        if (!map.has(p.username)) map.set(p.username, { username: p.username, tiers: {}, points: {}, region: p.region || "NA", customSkinUrl: p.customSkinUrl ?? null });
        const entry = map.get(p.username)!;
        entry.tiers[gm] = p.tier;
        entry.points[gm] = p.points;
        if (p.region && !entry.region) entry.region = p.region;
        if (p.customSkinUrl && !entry.customSkinUrl) entry.customSkinUrl = p.customSkinUrl;
      });
    });
    return Array.from(map.values())
      .map((p) => ({ ...p, totalPoints: Object.values(p.points).reduce((a: number, b: number) => a + b, 0) }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((p, i) => ({ ...p, rank: i + 1 }))
      .slice(0, 100);
  }, [results]);

  const isLoading = results.some((r) => r.isLoading);
  const filtered = merged.filter((p) => p.username.toLowerCase().includes(search.toLowerCase()));

  const rankBg = (rank: number) => {
    if (rank === 1) return "linear-gradient(to right, rgba(255,215,0,0.10) 0%, transparent 70%)";
    if (rank === 2) return "linear-gradient(to right, rgba(192,192,192,0.08) 0%, transparent 70%)";
    if (rank === 3) return "linear-gradient(to right, rgba(205,127,50,0.10) 0%, transparent 70%)";
    return undefined;
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GamemodeIcon gamemode="overall" size="md" active />
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>
                Overall Rankings
                <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280", background: "#1a1d2e", border: "1px solid #2a2f48", borderRadius: 4, padding: "1px 6px", marginLeft: 8 }}>Season 1</span>
              </h1>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Global rankings across all gamemodes · Top 100</p>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#6b7280" }} />
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, background: "#1a1d2e", border: "1px solid #2a2f48", borderRadius: 6, color: "#fff", outline: "none", width: 200 }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: 8, border: "1px solid #1e2235", overflow: "hidden", background: "#131520", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2235" }}>
                <th style={{ width: 44, padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>#</th>
                <th style={{ width: 52 }} />
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Player</th>
                <th style={{ width: 64, padding: "10px 8px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Region</th>
                {RANKED_GAMEMODES.map((gm) => (
                  <th key={gm} style={{ width: 56, padding: "8px 4px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <GamemodeIcon gamemode={gm} size="sm" />
                      <span style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{GAMEMODE_META[gm]?.label.slice(0, 4)}</span>
                    </div>
                  </th>
                ))}
                <th style={{ width: 72, padding: "10px 12px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={13} style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 }}>Loading rankings…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={13} style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 }}>No players found</td></tr>
              ) : filtered.map((player) => {
                const title = getRankTitleFromPoints(player.totalPoints);
                const titleColor = getRankTitleColorFromPoints(player.totalPoints);
                return (
                  <tr
                    key={player.username}
                    style={{ background: rankBg(player.rank), borderBottom: "1px solid #1a1d2e", cursor: "pointer" }}
                    onClick={() => window.location.href = `/player/${player.username}`}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = rankBg(player.rank) ?? "")}
                  >
                    {/* Rank */}
                    <td style={{ padding: "8px 12px" }}>
                      {player.rank === 1 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 30, borderRadius: 6, fontWeight: 900, fontStyle: "italic", fontSize: 14, letterSpacing: "-0.02em", color: "#000", background: "linear-gradient(135deg,#FFD700,#FFA500)" }}>1.</span>
                      ) : player.rank === 2 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 30, borderRadius: 6, fontWeight: 900, fontStyle: "italic", fontSize: 14, letterSpacing: "-0.02em", color: "#111", background: "linear-gradient(135deg,#c8d6e0,#8ea8b8)" }}>2.</span>
                      ) : player.rank === 3 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 30, borderRadius: 6, fontWeight: 900, fontStyle: "italic", fontSize: 14, letterSpacing: "-0.02em", color: "#fff", background: "linear-gradient(135deg,#CD7F32,#7a4010)" }}>3.</span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 30, borderRadius: 6, fontWeight: 900, fontStyle: "italic", fontSize: 14, letterSpacing: "-0.02em", color: "#9ca3af", background: "#1a1d2e", border: "1px solid #2a2f48" }}>{player.rank}.</span>
                      )}
                    </td>
                    {/* Skin */}
                    <td style={{ padding: "4px 6px" }}>
                      <PlayerSkinViewer
                        username={player.username}
                        customSkinUrl={player.customSkinUrl}
                        size={40}
                        cardData={{ points: player.totalPoints, region: player.region }}
                      />
                    </td>
                    {/* Name */}
                    <td style={{ padding: "8px 12px" }}>
                      <p style={{ fontWeight: 600, color: "#fff", margin: 0, fontSize: 13 }}>{player.username}</p>
                      <p style={{ fontSize: 10, margin: 0, ...getRankTitleStyle(title), color: titleColor }}>{title}</p>
                    </td>
                    {/* Region */}
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <RegionBadge region={player.region} />
                    </td>
                    {/* Per-gamemode tiers */}
                    {RANKED_GAMEMODES.map((gm) => (
                      <td key={gm} style={{ padding: "8px 4px", textAlign: "center" }}>
                        {player.tiers[gm] ? (
                          <GamemodeTierBadge gamemode={gm} tier={player.tiers[gm]} />
                        ) : (
                          <span style={{ color: "#374151", fontSize: 11 }}>—</span>
                        )}
                      </td>
                    ))}
                    {/* Points */}
                    <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums", fontSize: 13 }}>
                      {player.totalPoints.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

// ─── Regular Gamemode Leaderboard ────────────────────────────────────────────
export default function Leaderboard({ gamemode = "overall" }: LeaderboardProps) {
  if (gamemode === "overall") return <OverallLeaderboard />;

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ["players", gamemode],
    queryFn: () => fetchGamemodePlayers(gamemode),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const meta = GAMEMODE_META[gamemode] ?? { label: gamemode, color: "#6b7280" };

  const filtered = players.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.tier.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "all" || p.tier.toUpperCase() === tierFilter;
    return matchesSearch && matchesTier;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "rank") cmp = (a.rank ?? 99) - (b.rank ?? 99);
    else if (sortKey === "username") cmp = a.username.localeCompare(b.username);
    else if (sortKey === "tier") cmp = (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99);
    else if (sortKey === "points") cmp = b.points - a.points;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <Minus style={{ width: 12, height: 12, opacity: 0.3, marginLeft: 3 }} />;
    return sortDir === "asc"
      ? <ChevronUp style={{ width: 12, height: 12, marginLeft: 3, color: meta.color }} />
      : <ChevronDown style={{ width: 12, height: 12, marginLeft: 3, color: meta.color }} />;
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GamemodeIcon gamemode={gamemode} size="md" active />
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>
                {meta.label}
                <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280", background: "#1a1d2e", border: "1px solid #2a2f48", borderRadius: 4, padding: "1px 6px", marginLeft: 8 }}>Season 1</span>
              </h1>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Top {players.length} ranked players</p>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#6b7280" }} />
            <input
              type="text"
              placeholder="Search player…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: 12, background: "#1a1d2e", border: "1px solid #2a2f48", borderRadius: 6, color: "#fff", outline: "none", width: 200 }}
            />
          </div>
        </div>

        {/* Tier filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <button
            onClick={() => setTierFilter("all")}
            style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: "none", cursor: "pointer", background: tierFilter === "all" ? "#fff" : "#1a1d2e", color: tierFilter === "all" ? "#000" : "#9ca3af" }}
          >All</button>
          {TIERS.map((t) => (
            <button key={t} onClick={() => setTierFilter(tierFilter === t ? "all" : t)}
              style={{ padding: "2px 2px", background: "none", border: "none", cursor: "pointer", transform: tierFilter === t ? "scale(1.1)" : "scale(1)", transition: "transform 0.1s" }}>
              <TierBadge tier={t} size="sm" />
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ borderRadius: 8, border: "1px solid #1e2235", overflow: "hidden", background: "#131520" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: COL_WIDTHS, padding: "0 12px", height: 36, alignItems: "center", borderBottom: "1px solid #1e2235" }}>
            <button onClick={() => handleSort("rank")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>#<SortIcon col="rank" /></button>
            <span />
            <button onClick={() => handleSort("username")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Player<SortIcon col="username" /></button>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", display: "block" }}>Region</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", display: "block" }}>Mode</span>
            <button onClick={() => handleSort("tier")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tier<SortIcon col="tier" /></button>
            <button onClick={() => handleSort("points")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pts<SortIcon col="points" /></button>
          </div>

          {isLoading && <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280", fontSize: 13 }}>Loading players…</div>}
          {error && <div style={{ textAlign: "center", padding: "48px 0", color: "#ef4444", fontSize: 13 }}>Failed to load leaderboard</div>}
          {!isLoading && !error && sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280", fontSize: 13 }}>
              {search || tierFilter !== "all" ? "No players match your filters" : "No players ranked yet"}
            </div>
          )}
          {!isLoading && sorted.map((player) => (
            <PlayerRow key={player.id} player={player} position={player.rank ?? 0} gamemode={gamemode} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
