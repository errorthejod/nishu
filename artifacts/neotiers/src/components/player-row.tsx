import { Player } from "@workspace/api-client-react";
import { TierBadge } from "./ui-elements";
import { Link } from "wouter";
import { COL_WIDTHS } from "@/pages/leaderboard";

interface PlayerRowProps {
  player: Player;
  position: number;
  gamemode: string;
}

function RankDisplay({ position }: { position: number }) {
  if (position === 1) return (
    <span className="text-[#FFD700] font-bold text-sm">🥇</span>
  );
  if (position === 2) return (
    <span className="text-[#C0C0C0] font-bold text-sm">🥈</span>
  );
  if (position === 3) return (
    <span className="text-[#CD7F32] font-bold text-sm">🥉</span>
  );
  return (
    <span className="text-[#6b7280] text-sm font-mono">#{position}</span>
  );
}

const GAMEMODE_LABELS: Record<string, string> = {
  uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear",
  lifesteal: "Lifesteal", crystal: "Crystal",
};

export function PlayerRow({ player, position, gamemode }: PlayerRowProps) {
  const skinSrc = player.customSkinUrl
    || `https://visage.surgeplay.com/bust/96/${player.username}`;

  const isTop3 = position <= 3;
  const isTop10 = position <= 10;

  return (
    <Link href={`/player/${player.id}?gamemode=${gamemode}`}>
      <div
        className={`grid px-3 py-1.5 items-center border-b border-[#1e2130] cursor-pointer transition-all duration-150
          ${isTop3 ? "bg-[#ffffff04] hover:bg-[#ffffff09]" : "hover:bg-[#1a1d27]"}`}
        style={{ gridTemplateColumns: COL_WIDTHS }}
      >
        {/* Rank */}
        <div className="flex items-center">
          <RankDisplay position={position} />
        </div>

        {/* Player Skin */}
        <div className="flex items-center justify-center">
          <img
            src={skinSrc}
            alt={player.username}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes("mc-heads")) {
                target.src = `https://mc-heads.net/avatar/${player.username}/40`;
              }
            }}
          />
        </div>

        {/* Username */}
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {isTop10 && (
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          )}
          <span className={`font-semibold truncate text-sm ${isTop3 ? "text-white" : "text-[#d1d5db]"}`}>
            {player.username}
          </span>
        </div>

        {/* Mode */}
        <div className="hidden md:flex items-center">
          <span className="text-xs text-[#6b7280] bg-[#1e2130] px-1.5 py-0.5 rounded">
            {GAMEMODE_LABELS[player.gamemode ?? gamemode] ?? gamemode}
          </span>
        </div>

        {/* Weapon */}
        <div className="hidden md:flex items-center">
          <span className="text-xs text-[#9ca3af] truncate">{player.weapon}</span>
        </div>

        {/* Tier */}
        <div className="flex items-center justify-center">
          <TierBadge tier={player.tier} />
        </div>

        {/* Points */}
        <div className="flex items-center justify-end">
          <span className={`text-sm font-bold tabular-nums ${isTop3 ? "text-white" : "text-[#9ca3af]"}`}>
            {player.points.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
