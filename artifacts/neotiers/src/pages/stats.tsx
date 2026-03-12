import { Layout } from "@/components/layout";
import { TierBadge, LoadingSpinner, TIERS, TIER_ORDER } from "@/components/ui-elements";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { BarChart2, Users, Trophy, Swords, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const RANKED_GAMEMODES = ["uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal"] as const;
const GAMEMODE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  uhc:       { label: "UHC",       icon: "💀", color: "#ef4444" },
  nethpot:   { label: "NethPot",   icon: "🧪", color: "#a855f7" },
  smp:       { label: "SMP",       icon: "⚔️", color: "#3b82f6" },
  axe:       { label: "Axe",       icon: "🪓", color: "#f97316" },
  mace:      { label: "Mace",      icon: "🔨", color: "#eab308" },
  spear:     { label: "Spear",     icon: "🏹", color: "#22c55e" },
  lifesteal: { label: "Lifesteal", icon: "❤️", color: "#ec4899" },
  crystal:   { label: "Crystal",   icon: "💎", color: "#06b6d4" },
};

export default function Stats() {
  const results = useQueries({
    queries: RANKED_GAMEMODES.map((gm) => ({
      queryKey: ["players", gm],
      queryFn: async () => {
        const res = await fetch(`/api/players?gamemode=${gm}&limit=200`);
        return res.json() as Promise<any[]>;
      },
      staleTime: 30_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  const stats = useMemo(() => {
    if (isLoading) return null;

    const allPlayers: any[] = [];
    const byGamemode: Record<string, any[]> = {};

    RANKED_GAMEMODES.forEach((gm, i) => {
      const players = results[i]?.data ?? [];
      byGamemode[gm] = players;
      allPlayers.push(...players.map((p) => ({ ...p, gm })));
    });

    // Unique players across all gamemodes
    const uniqueUsernames = new Set(allPlayers.map((p) => p.username));

    // Tier distribution
    const tierCounts: Record<string, number> = {};
    TIERS.forEach((t) => (tierCounts[t] = 0));
    allPlayers.forEach((p) => { if (tierCounts[p.tier] !== undefined) tierCounts[p.tier]++; });

    // Most played gamemode
    const byGmCount = RANKED_GAMEMODES.map((gm) => ({ gm, count: byGamemode[gm]?.length ?? 0 }));
    byGmCount.sort((a, b) => b.count - a.count);
    const mostPlayed = byGmCount[0];

    // Top HT1 players
    const ht1Players = allPlayers.filter((p) => p.tier === "HT1");

    // Highest point player
    const topPlayer = [...allPlayers].sort((a, b) => b.points - a.points)[0];

    // Average points
    const avgPoints = allPlayers.length > 0
      ? Math.round(allPlayers.reduce((s, p) => s + p.points, 0) / allPlayers.length)
      : 0;

    return { uniqueUsernames, tierCounts, byGmCount, mostPlayed, ht1Players, topPlayer, avgPoints, allPlayers };
  }, [results, isLoading]);

  if (isLoading || !stats) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-3 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/30">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Season 1 Statistics</h1>
            <p className="text-xs text-[#6b7280]">Live stats across all gamemodes</p>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users, label: "Unique Players", value: stats.uniqueUsernames.size, color: "#3b82f6" },
            { icon: Trophy, label: "HT1 Players", value: stats.ht1Players.length, color: "#dc2626" },
            { icon: Swords, label: "Total Rankings", value: stats.allPlayers.length, color: "#a855f7" },
            { icon: Star, label: "Avg Points", value: stats.avgPoints.toLocaleString(), color: "#eab308" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-[#6b7280] uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Tier Distribution */}
          <div className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Tier Distribution</h2>
            <div className="space-y-2">
              {TIERS.map((tier) => {
                const count = stats.tierCounts[tier] ?? 0;
                const maxCount = Math.max(...Object.values(stats.tierCounts));
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={tier} className="flex items-center gap-3">
                    <TierBadge tier={tier} size="sm" />
                    <div className="flex-1 bg-[#1e2130] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--color-primary)" }} />
                    </div>
                    <span className="text-xs text-[#6b7280] w-8 text-right tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Players per Gamemode */}
          <div className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Players per Gamemode</h2>
            <div className="space-y-2">
              {stats.byGmCount.map(({ gm, count }) => {
                const meta = GAMEMODE_LABELS[gm];
                const maxCount = stats.byGmCount[0]?.count ?? 1;
                const pct = (count / maxCount) * 100;
                return (
                  <Link key={gm} href={`/${gm}`}>
                    <div className="flex items-center gap-3 hover:bg-[#1a1d27] rounded px-2 py-1 transition-colors cursor-pointer">
                      <span className="w-5 text-sm">{meta.icon}</span>
                      <span className="text-xs text-[#9ca3af] w-16">{meta.label}</span>
                      <div className="flex-1 bg-[#1e2130] rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                      </div>
                      <span className="text-xs text-[#6b7280] w-6 text-right tabular-nums">{count}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performer + HT1 Players */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Performer */}
          {stats.topPlayer && (
            <div className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Top Performer</h2>
              <Link href={`/player/${stats.topPlayer.username}`}>
                <div className="flex items-center gap-3 hover:bg-[#1a1d27] rounded-lg p-3 transition-colors cursor-pointer">
                  <img
                    src={`https://mc-heads.net/avatar/${stats.topPlayer.username}/48`}
                    alt={stats.topPlayer.username}
                    className="w-12 h-12 rounded-lg border-2 border-yellow-500/40"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <div>
                    <p className="font-bold text-white">{stats.topPlayer.username}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <TierBadge tier={stats.topPlayer.tier} size="sm" />
                      <span className="text-xs text-[#6b7280]">{stats.topPlayer.points.toLocaleString()} pts</span>
                    </div>
                    <p className="text-xs text-[#6b7280] capitalize mt-0.5">{stats.topPlayer.gm}</p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* HT1 Elite Players */}
          <div className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              HT1 Elite <span className="text-[#6b7280] font-normal normal-case text-xs">({stats.ht1Players.length} players)</span>
            </h2>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {stats.ht1Players.length === 0 ? (
                <p className="text-[#6b7280] text-sm">No HT1 players yet</p>
              ) : stats.ht1Players.map((p) => (
                <Link key={`${p.username}-${p.gm}`} href={`/player/${p.username}`}>
                  <div className="flex items-center gap-2 hover:bg-[#1a1d27] rounded px-2 py-1.5 transition-colors cursor-pointer">
                    <img
                      src={`https://mc-heads.net/avatar/${p.username}/24`}
                      alt={p.username}
                      className="w-6 h-6 rounded"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-sm text-white font-medium flex-1">{p.username}</span>
                    <span className="text-xs text-[#6b7280] capitalize">{p.gm}</span>
                    <span className="text-xs text-[#9ca3af] tabular-nums">{p.points.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
