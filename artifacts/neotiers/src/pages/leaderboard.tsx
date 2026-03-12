import { useState } from "react";
import { Layout } from "@/components/layout";
import { PlayerRow } from "@/components/player-row";
import { useListPlayers } from "@workspace/api-client-react";
import { Search, ChevronUp, ChevronDown, Minus } from "lucide-react";

type SortKey = "rank" | "username" | "tier" | "points";

export const GAMEMODE_META: Record<string, { label: string; icon: string; color: string }> = {
  overall:   { label: "Overall",    icon: "🏆", color: "#FFD700" },
  uhc:       { label: "UHC",        icon: "💀", color: "#ef4444" },
  nethpot:   { label: "NethPot",    icon: "🧪", color: "#a855f7" },
  smp:       { label: "SMP",        icon: "⚔️", color: "#3b82f6" },
  axe:       { label: "Axe",        icon: "🪓", color: "#f97316" },
  mace:      { label: "Mace",       icon: "🔨", color: "#eab308" },
  spear:     { label: "Spear",      icon: "🏹", color: "#22c55e" },
  lifesteal: { label: "Lifesteal",  icon: "❤️", color: "#ec4899" },
  crystal:   { label: "Crystal",    icon: "💎", color: "#06b6d4" },
};

/**
 * Grid columns shared between header and each PlayerRow.
 * Rank | Skin | Player (username+title) | Mode | Weapon | Tier | Points
 */
export const COL_WIDTHS = "48px 64px 1fr 90px 110px 72px 80px";

interface LeaderboardProps {
  gamemode?: string;
}

export default function Leaderboard({ gamemode = "overall" }: LeaderboardProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: players = [], isLoading, error } = useListPlayers(
    { gamemode, limit: "50" },
    { query: { queryKey: ["players", gamemode], refetchOnWindowFocus: false } }
  );

  const meta = GAMEMODE_META[gamemode] ?? { label: gamemode, icon: "🎮", color: "#6b7280" };

  const filtered = players.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const TIER_ORDER: Record<string, number> = {
    HT1: 0, HT2: 1, HT3: 2, HT4: 3, HT5: 4,
    LT1: 5, LT2: 6, LT3: 7, LT4: 8, LT5: 9,
  };

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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-3 py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
              style={{ borderColor: meta.color + "44", background: meta.color + "18" }}
            >
              {meta.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {meta.label}{" "}
                <span className="text-xs font-normal text-[#6b7280] bg-[#1e2130] px-2 py-0.5 rounded">
                  Top {players.length}
                </span>
              </h1>
              <p className="text-xs text-[#6b7280]">
                {gamemode === "overall" ? "Global rankings across all gamemodes" : "Ranked by points · Top 50 players"}
              </p>
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

        {/* Table */}
        <div className="rounded-lg border border-[#1e2130] overflow-hidden bg-[#0d0f14]">
          {/* Header */}
          <div
            className="grid text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#1e2130] px-3 h-9 items-center"
            style={{ gridTemplateColumns: COL_WIDTHS }}
          >
            <button onClick={() => handleSort("rank")} className="flex items-center hover:text-white">
              #<SortIcon col="rank" />
            </button>
            <span />
            <button onClick={() => handleSort("username")} className="flex items-center hover:text-white">
              Player<SortIcon col="username" />
            </button>
            <span className="hidden md:block">Mode</span>
            <span className="hidden md:block">Weapon</span>
            <button onClick={() => handleSort("tier")} className="flex items-center justify-center hover:text-white">
              Tier<SortIcon col="tier" />
            </button>
            <button onClick={() => handleSort("points")} className="flex items-center justify-end hover:text-white">
              Points<SortIcon col="points" />
            </button>
          </div>

          {/* Rows */}
          {isLoading && (
            <div className="text-center py-16 text-[#6b7280] text-sm">Loading players...</div>
          )}
          {error && (
            <div className="text-center py-16 text-red-500 text-sm">Failed to load leaderboard</div>
          )}
          {!isLoading && !error && sorted.length === 0 && (
            <div className="text-center py-16 text-[#6b7280] text-sm">
              {search ? "No players matching your search" : "No players ranked yet"}
            </div>
          )}
          {!isLoading &&
            sorted.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                position={player.rank ?? 0}
                gamemode={gamemode}
              />
            ))}
        </div>
      </div>
    </Layout>
  );
}
