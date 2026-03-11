import { Layout } from "@/components/layout";
import { PlayerRow } from "@/components/player-row";
import { LoadingSpinner, TIERS } from "@/components/ui-elements";
import { useListPlayers, useListGamemodes } from "@workspace/api-client-react";
import { Search, Trophy, Swords } from "lucide-react";
import { useState } from "react";

const GAMEMODE_ICONS: Record<string, string> = {
  overall: "🏆",
  smp: "⚔️",
  uhc: "💀",
  nethpot: "🧪",
  pvp: "🗡️",
  bedwars: "🛏️",
};

type SortOption = "rank" | "points" | "tier" | "username";

export default function Leaderboard({ gamemodeFilter }: { gamemodeFilter?: string }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rank");

  const { data: gamemodes } = useListGamemodes();
  const { data: allPlayers, isLoading, error } = useListPlayers({
    gamemode: gamemodeFilter,
    search: search || undefined,
    sortBy: sortBy,
    limit: 50,
  });

  const players = allPlayers || [];
  const activeTab = gamemodeFilter?.toLowerCase() || "overall";

  const gamemodeTabList = [
    { slug: "", label: "Overall", icon: "🏆" },
    ...(gamemodes || []).map((g) => ({
      slug: g.slug,
      label: g.name,
      icon: GAMEMODE_ICONS[g.slug.toLowerCase()] || "🎮",
    })),
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            {gamemodeFilter ? `${gamemodeFilter.toUpperCase()} Rankings` : "Global Rankings"}
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Top 50 players · Sorted by {sortBy}
          </p>
        </div>

        {/* Gamemode Tabs - MCTiers style */}
        <div className="flex flex-wrap gap-2 mb-4 bg-[#0d0f14] border border-[#1e2130] rounded-lg p-2">
          {gamemodeTabList.map((tab) => {
            const isActive = activeTab === (tab.slug || "overall");
            return (
              <a
                key={tab.slug}
                href={tab.slug ? `/${tab.slug}` : "/leaderboard"}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer min-w-[60px] text-center
                  ${isActive
                    ? "bg-[#1e2130] text-white border-b-2 border-primary"
                    : "text-[#6b7280] hover:text-white hover:bg-[#1a1d27]"
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
              </a>
            );
          })}
        </div>

        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0f14] border border-[#1e2130] pl-9 pr-4 py-2 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-primary rounded"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6b7280]">Sort:</span>
            {(["rank", "points", "tier", "username"] as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-3 py-1.5 rounded capitalize transition-colors ${
                  sortBy === opt
                    ? "bg-primary text-white"
                    : "bg-[#1e2130] text-[#6b7280] hover:text-white border border-[#2a2f42]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d0f14] border border-[#1e2130] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center gap-0 border-b border-[#1e2130] bg-[#0a0c10] px-0 py-2 text-xs text-[#6b7280] uppercase tracking-widest">
            <div style={{ width: 56, minWidth: 56 }} className="text-center">#</div>
            <div className="w-[60px] shrink-0"></div>
            <div className="flex-1 pl-2">Player</div>
            <div className="hidden md:block w-20 text-center">Mode</div>
            <div className="hidden lg:block w-20 text-center">Weapon</div>
            <div className="w-24 text-center pr-4">Tier</div>
          </div>

          {/* Rows */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-20 text-red-500 text-sm">
              Failed to load rankings. Please try again.
            </div>
          ) : players.length > 0 ? (
            <div>
              {players.map((player, index) => (
                <PlayerRow key={player.id} player={player} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 flex flex-col items-center gap-4 text-[#6b7280]">
              <Swords className="w-12 h-12 opacity-30" />
              <div>
                <p className="font-medium text-white">No players found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#4b5563]">
          <span>Showing top {players.length} of 50 maximum players</span>
          <span>Tier system: HT1 (best) → LT5 (lowest)</span>
        </div>

        {/* Tier Legend */}
        <div className="mt-6 bg-[#0d0f14] border border-[#1e2130] rounded-lg p-4">
          <p className="text-xs text-[#6b7280] uppercase tracking-widest mb-3">Tier Legend</p>
          <div className="flex flex-wrap gap-2">
            {TIERS.map((tier) => {
              const tierColors: Record<string, string> = {
                HT1: "#FFD700", HT2: "#FF8C00", HT3: "#00C853",
                HT4: "#00BCD4", HT5: "#9C27B0",
                LT1: "#E91E63", LT2: "#2196F3", LT3: "#607D8B",
                LT4: "#455A64", LT5: "#263238",
              };
              const col = tierColors[tier] || "#444";
              const isHT = tier.startsWith("HT");
              return (
                <span
                  key={tier}
                  className="text-xs px-2 py-0.5 rounded font-bold border"
                  style={{
                    backgroundColor: col + "20",
                    color: isHT ? col : "#9ca3af",
                    borderColor: col + "55",
                  }}
                >
                  {tier}
                </span>
              );
            })}
          </div>
          <p className="text-[#4b5563] text-xs mt-2">HT = High Tier · LT = Low Tier · Lower number = Higher skill</p>
        </div>
      </div>
    </Layout>
  );
}
