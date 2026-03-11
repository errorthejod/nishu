import { Player } from "@workspace/api-client-react";
import { TierBadge, getRankTitle } from "./ui-elements";
import { motion } from "framer-motion";
import { Link } from "wouter";

const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "#C9A227", text: "#fff" },
  2: { bg: "#8A8FA0", text: "#fff" },
  3: { bg: "#A0522D", text: "#fff" },
};

function PlayerModel({ username, customSkinUrl }: { username: string; customSkinUrl?: string | null }) {
  return (
    <div className="relative w-[60px] h-[72px] shrink-0 overflow-hidden">
      <img
        src={`https://visage.surgeplay.com/bust/96/${username}`}
        alt={username}
        className="w-full h-full object-contain drop-shadow-md"
        style={{ imageRendering: "pixelated" }}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/${username}/64`;
        }}
      />
    </div>
  );
}

export function PlayerRow({ player, index }: { player: Player; index: number }) {
  const rankNum = index + 1;
  const rankColor = RANK_COLORS[rankNum] || { bg: "#1e2130", text: "#9ca3af" };
  const isTop3 = rankNum <= 3;
  const isTop25 = rankNum <= 25;
  const title = getRankTitle(player.points);

  return (
    <Link href={`/player/${player.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.5) }}
        className={`
          group flex items-center gap-0 cursor-pointer transition-all duration-200 border-b border-[#1e2130]
          ${isTop3 ? "bg-[#16191f] hover:bg-[#1c2030]" : "bg-[#12141a] hover:bg-[#16191f]"}
        `}
        style={{
          borderLeft: isTop25 ? `3px solid ${rankColor.bg}` : "3px solid transparent",
        }}
      >
        {/* Rank Number */}
        <div
          className="flex items-center justify-center shrink-0 font-bold text-lg"
          style={{
            width: 56,
            minWidth: 56,
            height: 72,
            backgroundColor: rankColor.bg,
            color: rankColor.text,
            fontFamily: "inherit",
          }}
        >
          {rankNum}.
        </div>

        {/* Player 3D Model */}
        <div className="flex items-center justify-center shrink-0 px-2 h-[72px]">
          <PlayerModel username={player.username} customSkinUrl={player.customSkinUrl} />
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0 py-3 pr-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base leading-tight truncate group-hover:text-primary transition-colors">
              {player.username}
            </span>
            {isTop25 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: rankColor.bg + "33", color: rankColor.bg, border: `1px solid ${rankColor.bg}55` }}
              >
                TOP {rankNum <= 3 ? rankNum : "25"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-yellow-400/80 text-xs">◆</span>
            <span className="text-[#6b7280] text-xs">{title}</span>
            <span className="text-[#3a3f52] text-xs">({player.points.toLocaleString()} points)</span>
          </div>
        </div>

        {/* Gamemode */}
        <div className="hidden md:flex items-center justify-center shrink-0 w-20 px-2">
          <span className="text-xs px-2 py-1 rounded font-medium tracking-wide bg-[#1e2130] text-[#6b7280] border border-[#2a2f42]">
            {player.gamemode}
          </span>
        </div>

        {/* Weapon */}
        <div className="hidden lg:flex items-center justify-center shrink-0 w-20 px-2">
          <span className="text-xs text-[#6b7280]">{player.weapon}</span>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center justify-center shrink-0 px-4 gap-2">
          <TierBadge tier={player.tier} size="sm" />
        </div>
      </motion.div>
    </Link>
  );
}
