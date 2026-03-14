import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { PlayerRow } from "@/components/player-row";
import { TierBadge, GamemodeTierBadge, GamemodeIcon, getRankTitle, getRankTitleColor, getRankTitleFromPoints, getRankTitleColorFromPoints, TIERS, TIER_ORDER } from "@/components/ui-elements";
import { useListPlayers } from "@workspace/api-client-react";
import { useQueries } from "@tanstack/react-query";
import { Search, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Link } from "wouter";

type SortKey = "rank" | "username" | "tier" | "points";

export const GAMEMODE_META: Record<string, { label: string; color: string }> = {
  overall:   { label: "Overall",    color: "#FFD700" },
  uhc:       { label: "UHC",        color: "#f59e0b" },
  nethpot:   { label: "NethPot",    color: "#a855f7" },
  smp:       { label: "SMP",        color: "#3b82f6" },
  axe:       { label: "Axe",        color: "#f97316" },
  mace:      { label: "Mace",       color: "#eab308" },
  spear:     { label: "Spear",      color: "#22c55e" },
  lifesteal: { label: "Lifesteal",  color: "#ec4899" },
  crystal:   { label: "Crystal",    color: "#06b6d4" },
  sword:     { label: "Sword",      color: "#ef4444" },
};

export const COL_WIDTHS = "48px 56px 1fr 90px 110px 72px 80px";
const RANKED_GAMEMODES = ["uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword"] as const;

interface LeaderboardProps { gamemode?: string; }

// ─── Overall (MCTiers-style) ────────────────────────────────────────────────
function OverallLeaderboard() {
  const [search, setSearch] = useState("");

  const results = useQueries({
    queries: RANKED_GAMEMODES.map((gm) => ({
      queryKey: ["players", gm],
      queryFn: async () => {
        const res = await fetch(`/api/players?gamemode=${gm}&limit=200`);
        if (!res.ok) throw new Error("Failed");
        return res.json() as Promise<any[]>;
      },
      staleTime: 30_000,
    })),
  });

  const merged = useMemo(() => {
    const map = new Map<string, { username: string; tiers: Record<string, string>; points: Record<string, number> }>();
    RANKED_GAMEMODES.forEach((gm, i) => {
      const players: any[] = results[i]?.data ?? [];
      players.forEach((p) => {
        if (!map.has(p.username)) map.set(p.username, { username: p.username, tiers: {}, points: {} });
        const entry = map.get(p.username)!;
        entry.tiers[gm] = p.tier;
        entry.points[gm] = p.points;
      });
    });
    return Array.from(map.values())
      .map((p) => ({ ...p, totalPoints: Object.values(p.points).reduce((a: number, b: number) => a + b, 0) }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((p, i) => ({ ...p, rank: i + 1 }))
      .slice(0, 25);
  }, [results]);

  const isLoading = results.some((r) => r.isLoading);
  const filtered = merged.filter((p) => p.username.toLowerCase().includes(search.toLowerCase()));

  const top3 = merged.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-3 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <GamemodeIcon gamemode="overall" size="lg" active />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Overall Rankings
                <span className="text-xs font-normal text-[#6b7280] bg-[#1e2130] px-2 py-0.5 rounded">Season 1</span>
              </h1>
              <p className="text-xs text-[#6b7280]">Global rankings across all gamemodes · Top 25</p>
            </div>
          </div>
          <div className="sm:ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm bg-[#1e2130] border border-[#2a2f42] rounded text-white placeholder-[#6b7280] focus:outline-none focus:border-primary w-52"
            />
          </div>
        </div>

        {/* Podium Top 3 */}
        {!isLoading && top3.length === 3 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {podiumOrder.map((player) => {
              const isFirst = player.rank === 1;
              const podiumHeight = player.rank === 1 ? "h-36" : player.rank === 2 ? "h-28" : "h-24";
              const title = getRankTitleFromPoints(player.totalPoints);
              const titleColor = getRankTitleColorFromPoints(player.totalPoints);
              return (
                <Link key={player.username} href={`/player/${player.username}`} className="flex-1 max-w-[200px]">
                  <div className={`flex flex-col items-center bg-[#0d0f14] border rounded-lg ${isFirst ? "border-yellow-500/50 shadow-[0_0_20px_rgba(255,215,0,0.15)]" : "border-[#1e2130]"} p-3 cursor-pointer hover:bg-[#1a1d27] transition-all`}>
                    <img
                      src={`https://visage.surgeplay.com/bust/128/${player.username}`}
                      alt={player.username}
                      className={`${isFirst ? "w-20 h-20" : "w-16 h-16"} object-contain drop-shadow-xl`}
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/${player.username}/64`;
                      }}
                    />
                    <span className={`text-lg mt-1 font-black ${isFirst ? "text-yellow-400" : player.rank === 2 ? "text-slate-300" : "text-amber-600"}`}>
                      #{player.rank}
                    </span>
                    <p className="font-bold text-sm text-white mt-0.5 truncate max-w-full">{player.username}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: titleColor }}>{title}</p>
                    <div className={`${podiumHeight} w-full rounded-b-md mt-2 flex flex-col items-center justify-end pb-2 gap-1`}
                      style={{ background: isFirst ? "linear-gradient(to top, rgba(255,215,0,0.15), transparent)" : "linear-gradient(to top, rgba(255,255,255,0.04), transparent)" }}>
                      <p className="text-white font-bold text-sm">{player.totalPoints.toLocaleString()}</p>
                      <p className="text-[#6b7280] text-[10px]">points</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* MCTiers Wide Table */}
        <div className="rounded-lg border border-[#1e2130] overflow-hidden bg-[#0d0f14] overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1e2130] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] h-10">
                <th className="px-3 text-left w-10">#</th>
                <th className="px-2 w-12" />
                <th className="px-3 text-left min-w-[140px]">Player</th>
                {RANKED_GAMEMODES.map((gm) => (
                  <th key={gm} className="px-2 text-center w-20">
                    <span className="flex flex-col items-center gap-0.5">
                      <GamemodeIcon gamemode={gm} size="sm" />
                      <span className="text-[9px] uppercase tracking-wide">{GAMEMODE_META[gm]?.label}</span>
                    </span>
                  </th>
                ))}
                <th className="px-3 text-right w-24">Points</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={13} className="text-center py-12 text-[#6b7280]">Loading rankings...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={13} className="text-center py-12 text-[#6b7280]">No players found</td></tr>
              ) : filtered.map((player) => {
                const title = getRankTitleFromPoints(player.totalPoints);
                const titleColor = getRankTitleColorFromPoints(player.totalPoints);
                return (
                  <tr
                    key={player.username}
                    className="border-b border-[#1e2130] hover:bg-[#1a1d27] cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/player/${player.username}`}
                  >
                    <td className="px-3 py-2">
                      {player.rank <= 3 ? (
                        <span className={`font-black text-sm ${player.rank === 1 ? "text-yellow-400" : player.rank === 2 ? "text-slate-300" : "text-amber-600"}`}>
                          {player.rank}.
                        </span>
                      ) : (
                        <span className="text-[#6b7280] font-mono text-xs">#{player.rank}</span>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      <img
                        src={`https://visage.surgeplay.com/bust/48/${player.username}`}
                        alt={player.username}
                        className="w-9 h-9 rounded object-contain"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/${player.username}/32`;
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-white">{player.username}</p>
                      <p className="text-[10px] font-medium" style={{ color: titleColor }}>{title}</p>
                    </td>
                    {RANKED_GAMEMODES.map((gm) => (
                      <td key={gm} className="px-2 py-2 text-center">
                        {player.tiers[gm] ? (
                          <GamemodeTierBadge gamemode={gm} tier={player.tiers[gm]} />
                        ) : (
                          <span className="text-[#374151] text-xs">—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold text-white tabular-nums">
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

// ─── Regular Gamemode Leaderboard ───────────────────────────────────────────
export default function Leaderboard({ gamemode = "overall" }: LeaderboardProps) {
  if (gamemode === "overall") return <OverallLeaderboard />;

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: players = [], isLoading, error } = useListPlayers(
    { gamemode, limit: "50" },
    { query: { queryKey: ["players", gamemode], refetchOnWindowFocus: false } }
  );

  const meta = GAMEMODE_META[gamemode] ?? { label: gamemode, color: "#6b7280" };

  const filtered = players.filter((p) => {
    const matchesSearch =
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.tier.toLowerCase().includes(search.toLowerCase()) ||
      (p.gamemode ?? "").toLowerCase().includes(search.toLowerCase());
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
    if (sortKey !== col) return <Minus className="w-3 h-3 opacity-30 ml-0.5" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 ml-0.5" style={{ color: meta.color }} />
      : <ChevronDown className="w-3 h-3 ml-0.5" style={{ color: meta.color }} />;
  }

  const top3 = [...players].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).slice(0, 3);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-3 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <GamemodeIcon gamemode={gamemode} size="lg" active />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {meta.label}
                <span className="text-xs font-normal text-[#6b7280] bg-[#1e2130] px-2 py-0.5 rounded">Season 1</span>
                <span className="text-xs font-normal text-[#6b7280] bg-[#1e2130] px-2 py-0.5 rounded">Top {players.length}</span>
              </h1>
              <p className="text-xs text-[#6b7280]">Ranked by points · Top 50 players</p>
            </div>
          </div>
          <div className="sm:ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search username, tier, mode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm bg-[#1e2130] border border-[#2a2f42] rounded text-white placeholder-[#6b7280] focus:outline-none focus:border-primary w-56"
            />
          </div>
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setTierFilter("all")}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${tierFilter === "all" ? "bg-white text-black" : "bg-[#1e2130] text-[#9ca3af] border border-[#2a2f42] hover:text-white"}`}
          >All</button>
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(tierFilter === t ? "all" : t)}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${tierFilter === t ? "ring-2 ring-white scale-105" : "hover:scale-105"}`}
              style={{ background: tierFilter === t ? "white" : undefined }}
            >
              <TierBadge tier={t} size="sm" />
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!isLoading && top3.length === 3 && tierFilter === "all" && !search && (
          <div className="flex items-end justify-center gap-3 mb-6">
            {podiumOrder.map((player) => {
              const isFirst = player.rank === 1;
              return (
                <Link key={player.id} href={`/player/${player.username}`} className="flex-1 max-w-[160px]">
                  <div className={`flex flex-col items-center bg-[#0d0f14] border rounded-lg ${isFirst ? "border-yellow-500/50 shadow-[0_0_20px_rgba(255,215,0,0.15)]" : "border-[#1e2130]"} p-3 cursor-pointer hover:bg-[#1a1d27] transition-all`}>
                    <img
                      src={`https://visage.surgeplay.com/bust/96/${player.username}`}
                      alt={player.username}
                      className={`${isFirst ? "w-16 h-16" : "w-12 h-12"} object-contain drop-shadow-xl`}
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/${player.username}/64`;
                      }}
                    />
                    <span className={`text-base mt-1 font-black ${isFirst ? "text-yellow-400" : player.rank === 2 ? "text-slate-300" : "text-amber-600"}`}>
                      #{player.rank}
                    </span>
                    <p className="font-bold text-xs text-white mt-0.5 truncate max-w-full">{player.username}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: getRankTitleColor(player.rank ?? 0) }}>
                      {getRankTitle(player.rank ?? 0)}
                    </p>
                    <div className="mt-1.5 text-center">
                      <TierBadge tier={player.tier} size="sm" />
                      <p className="text-white font-bold text-xs mt-1">{player.points.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="rounded-lg border border-[#1e2130] overflow-hidden bg-[#0d0f14]">
          <div className="grid text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#1e2130] px-3 h-9 items-center"
            style={{ gridTemplateColumns: COL_WIDTHS }}>
            <button onClick={() => handleSort("rank")} className="flex items-center hover:text-white">#<SortIcon col="rank" /></button>
            <span />
            <button onClick={() => handleSort("username")} className="flex items-center hover:text-white">Player<SortIcon col="username" /></button>
            <span className="hidden md:block">Mode</span>
            <span className="hidden md:block">Weapon</span>
            <button onClick={() => handleSort("tier")} className="flex items-center justify-center hover:text-white">Tier<SortIcon col="tier" /></button>
            <button onClick={() => handleSort("points")} className="flex items-center justify-end hover:text-white">Pts<SortIcon col="points" /></button>
          </div>

          {isLoading && <div className="text-center py-16 text-[#6b7280] text-sm">Loading players...</div>}
          {error && <div className="text-center py-16 text-red-500 text-sm">Failed to load leaderboard</div>}
          {!isLoading && !error && sorted.length === 0 && (
            <div className="text-center py-16 text-[#6b7280] text-sm">
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
