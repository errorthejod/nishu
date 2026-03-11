import { Layout } from "@/components/layout";
import { TierBadge, getRankTitle, LoadingSpinner } from "@/components/ui-elements";
import { useGetPlayer } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Trophy, Calendar, Swords, Shield } from "lucide-react";

export default function Profile() {
  const params = useParams<{ id: string }>();
  const playerId = parseInt(params.id || "0", 10);

  const { data: player, isLoading, error } = useGetPlayer(playerId, {
    query: { enabled: playerId > 0 },
  });

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  if (error || !player) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-red-500">Player Not Found</h1>
          <Link href="/leaderboard" className="text-primary hover:underline mt-4 inline-block text-sm">
            ← Return to Leaderboard
          </Link>
        </div>
      </Layout>
    );
  }

  const joinDate = new Date(player.createdAt);
  const title = getRankTitle(player.points);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/leaderboard"
          className="inline-flex items-center text-[#6b7280] hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Rankings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Player Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0d0f14] border border-[#1e2130] rounded-lg overflow-hidden"
            >
              {/* 3D Model */}
              <div className="relative flex justify-center items-end pt-8 pb-0 bg-gradient-to-b from-[#1a1d27] to-[#0d0f14] min-h-[220px]">
                <img
                  src={`https://visage.surgeplay.com/full/256/${player.username}`}
                  alt={player.username}
                  className="h-56 object-contain drop-shadow-2xl"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://mc-heads.net/player/${player.username}/256`;
                  }}
                />
              </div>

              {/* Player Info */}
              <div className="p-6 text-center border-t border-[#1e2130]">
                <h1 className="text-2xl font-bold text-white">{player.username}</h1>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-yellow-400/80 text-xs">◆</span>
                  <span className="text-[#6b7280] text-sm">{title}</span>
                </div>
                <div className="mt-3 flex justify-center">
                  <TierBadge tier={player.tier} size="lg" />
                </div>

                {/* Minecraft Avatar */}
                <div className="mt-4 flex justify-center">
                  <img
                    src={`https://mc-heads.net/avatar/${player.username}/64`}
                    alt={`${player.username} head`}
                    className="w-16 h-16 rounded-lg border-2 border-[#1e2130]"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Stats */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Rank Banner */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0d0f14] border border-[#1e2130] rounded-lg p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-[#6b7280] text-xs uppercase tracking-widest">Global Rank</p>
                <p className="text-5xl font-bold text-white mt-1">#{player.rank}</p>
              </div>
              <Trophy className="w-16 h-16 text-primary opacity-20" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, label: "Total Points", value: player.points.toLocaleString() },
                { icon: Shield, label: "Tier", value: <TierBadge tier={player.tier} size="md" /> },
                { icon: Swords, label: "Main Gamemode", value: player.gamemode, cap: true },
                { icon: Swords, label: "Weapon", value: player.weapon, cap: true },
                { icon: Calendar, label: "Ranked Since", value: format(joinDate, "MMM d, yyyy") },
                { icon: Trophy, label: "Rank Title", value: title },
              ].map(({ icon: Icon, label, value, cap }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0f14] border border-[#1e2130] rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="p-2 bg-[#1e2130] rounded">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[#6b7280] text-xs uppercase tracking-widest">{label}</p>
                    {typeof value === "string" ? (
                      <p className={`text-white font-semibold mt-0.5 ${cap ? "capitalize" : ""}`}>{value}</p>
                    ) : (
                      <div className="mt-1">{value}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
