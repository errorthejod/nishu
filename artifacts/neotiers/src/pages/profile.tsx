import { Layout } from "@/components/layout";
import { TierBadge, GamemodeIcon, getRankTitleFromPoints, getRankTitleColorFromPoints, LoadingSpinner } from "@/components/ui-elements";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, ExternalLink } from "lucide-react";

const RANKED_GAMEMODES = ["uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword"] as const;
const GAMEMODE_LABELS: Record<string, string> = {
  uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear",
  lifesteal: "Lifesteal", crystal: "Crystal", sword: "Sword",
};

interface PlayerData {
  username: string;
  tiers: Record<string, string>;
  points: Record<string, number>;
  regions: Record<string, string>;
  overallRank: number;
  totalPoints: number;
  firstSeen: string | null;
}

async function fetchPlayerProfile(username: string): Promise<PlayerData> {
  const results = await Promise.allSettled(
    RANKED_GAMEMODES.map((gm) =>
      fetch(`/api/players?gamemode=${gm}&search=${encodeURIComponent(username)}&limit=200`)
        .then((r) => r.json())
        .then((players: any[]) => ({ gm, players }))
    )
  );

  const tiers: Record<string, string> = {};
  const points: Record<string, number> = {};
  const regions: Record<string, string> = {};
  let firstSeen: string | null = null;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { gm, players } = result.value;
    const exact = players.find((p: any) => p.username.toLowerCase() === username.toLowerCase());
    if (exact) {
      tiers[gm] = exact.tier;
      points[gm] = exact.points;
      regions[gm] = exact.region ?? exact.weapon ?? "";
      if (!firstSeen || new Date(exact.createdAt) < new Date(firstSeen)) {
        firstSeen = exact.createdAt;
      }
    }
  }

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);

  let overallRank = 0;
  try {
    const overall = await fetch(`/api/players?gamemode=overall&limit=200`).then((r) => r.json());
    const entry = overall.find((p: any) => p.username.toLowerCase() === username.toLowerCase());
    if (entry) overallRank = entry.rank;
  } catch {}

  return { username, tiers, points, regions, overallRank, totalPoints, firstSeen };
}

export default function Profile() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username || "");

  const { data: player, isLoading, error } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => fetchPlayerProfile(username),
    enabled: !!username,
  });

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  const hasData = player && Object.keys(player.tiers).length > 0;

  if (error || !hasData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1e2130] flex items-center justify-center">
            <span className="text-2xl font-black text-[#374151]">?</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Player Not Found</h1>
          <p className="text-[#6b7280] mb-6">"{username}" isn't ranked in any gamemode yet.</p>
          <Link href="/leaderboard" className="text-primary hover:underline text-sm">
            ← Return to Rankings
          </Link>
        </div>
      </Layout>
    );
  }

  const title = getRankTitleFromPoints(player.totalPoints);
  const titleColor = getRankTitleColorFromPoints(player.totalPoints);
  const bestTier = Object.values(player.tiers).sort((a, b) => {
    const order = ["HT1","HT2","HT3","HT4","HT5","LT1","LT2","LT3","LT4","LT5"];
    return order.indexOf(a) - order.indexOf(b);
  })[0] ?? "LT5";

  const rankedModes = RANKED_GAMEMODES.filter((gm) => player.tiers[gm]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/leaderboard" className="inline-flex items-center text-[#6b7280] hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Rankings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Player Card — 3D bust model */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-[#0d0f14] border border-[#1e2130] rounded-xl overflow-hidden"
          >
            {/* 3D Half-Body Skin */}
            <div className="relative flex justify-center items-end pt-6 min-h-[310px] overflow-hidden"
              style={{ background: "linear-gradient(to bottom, #1a1d27, #0d0f14)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)", filter: "blur(24px)" }} />
              <img
                src={`https://visage.surgeplay.com/bust/400/${player.username}`}
                alt={player.username}
                className="relative z-10 h-72 object-contain drop-shadow-2xl"
                style={{ imageRendering: "pixelated" }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes("full")) {
                    img.src = `https://visage.surgeplay.com/full/256/${player.username}`;
                  } else {
                    img.src = `https://mc-heads.net/body/${player.username}/200`;
                  }
                }}
              />
            </div>

            {/* Info */}
            <div className="p-5 text-center border-t border-[#1e2130]">
              <h1 className="text-xl font-bold text-white">{player.username}</h1>
              <p className="text-sm font-semibold mt-0.5" style={{ color: titleColor }}>{title}</p>
              <div className="flex justify-center mt-2">
                <TierBadge tier={bestTier} size="lg" />
              </div>
              <p className="text-xs text-[#6b7280] mt-1">Best Tier</p>

              {/* NameMC link */}
              <a
                href={`https://namemc.com/profile/${player.username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-[#6b7280] hover:text-white transition-colors bg-[#1e2130] px-3 py-1.5 rounded-full border border-[#2a2f42]"
              >
                <span className="font-bold text-[#9ca3af]">N</span>
                NameMC
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Overall Rank */}
              {player.overallRank > 0 && (
                <div className="mt-4 bg-[#1e2130] rounded-lg py-3">
                  <p className="text-[#6b7280] text-xs uppercase tracking-widest">Global Rank</p>
                  <p className="text-3xl font-bold text-white mt-0.5">#{player.overallRank}</p>
                </div>
              )}

              {/* Total Points */}
              <div className="mt-3 bg-[#1e2130] rounded-lg py-3">
                <p className="text-[#6b7280] text-xs uppercase tracking-widest">Total Points</p>
                <p className="text-2xl font-bold text-white mt-0.5">{player.totalPoints.toLocaleString()}</p>
              </div>

              {player.firstSeen && (
                <p className="mt-3 text-xs text-[#6b7280]">
                  Ranked since {new Date(player.firstSeen).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          </motion.div>

          {/* Right: Gamemode Tiers */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Tier Rankings grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-5"
            >
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Tier Rankings by Gamemode
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {RANKED_GAMEMODES.map((gm) => {
                  const tier = player.tiers[gm];
                  const pts = player.points[gm];
                  return (
                    <Link key={gm} href={`/${gm}`}>
                      <div className={`rounded-lg p-3 text-center transition-all hover:scale-105 cursor-pointer
                        ${tier ? "bg-[#1a1d27] border border-[#2a2f42] hover:border-primary/40" : "bg-[#0f1117] border border-[#1e2130] opacity-50"}`}>
                        <div className="flex justify-center mb-1.5">
                          <GamemodeIcon gamemode={gm} size="md" active={!!tier} />
                        </div>
                        <p className="text-xs text-[#6b7280] font-medium">{GAMEMODE_LABELS[gm]}</p>
                        <div className="mt-1.5 flex justify-center">
                          {tier ? <TierBadge tier={tier} size="sm" /> : <span className="text-[#374151] text-xs font-bold">—</span>}
                        </div>
                        {pts !== undefined && (
                          <p className="text-[10px] text-[#6b7280] mt-1">{pts.toLocaleString()} pts</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Target, label: "Total Points", value: player.totalPoints.toLocaleString() },
                { icon: Trophy, label: "Gamemodes Ranked", value: `${rankedModes.length} / ${RANKED_GAMEMODES.length}` },
              ].map(({ icon: Icon, label, value }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="p-2 bg-[#1e2130] rounded-lg">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs uppercase tracking-widest">{label}</p>
                    <p className="text-white font-bold text-lg mt-0.5">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance Breakdown */}
            {rankedModes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d0f14] border border-[#1e2130] rounded-xl p-5"
              >
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Performance Breakdown</h2>
                <div className="space-y-2">
                  {rankedModes
                    .sort((a, b) => (player.points[b] ?? 0) - (player.points[a] ?? 0))
                    .map((gm) => {
                      const pts = player.points[gm] ?? 0;
                      const tier = player.tiers[gm] ?? "";
                      const maxPts = Math.max(...Object.values(player.points));
                      const pct = maxPts > 0 ? (pts / maxPts) * 100 : 0;
                      return (
                        <div key={gm} className="flex items-center gap-3">
                          <GamemodeIcon gamemode={gm} size="sm" active />
                          <span className="text-xs text-[#9ca3af] w-16">{GAMEMODE_LABELS[gm]}</span>
                          <div className="flex-1 bg-[#1e2130] rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <TierBadge tier={tier} size="sm" />
                          <span className="text-xs text-[#6b7280] w-16 text-right tabular-nums">{pts.toLocaleString()} pts</span>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
