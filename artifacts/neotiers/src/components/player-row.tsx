import { Player } from "@workspace/api-client-react";
import { TierBadge, getRankTitle, getRankTitleColor } from "./ui-elements";
import { Link } from "wouter";
import { COL_WIDTHS } from "@/pages/leaderboard";

interface PlayerRowProps {
  player: Player;
  position: number;
  gamemode: string;
}

const GAMEMODE_LABELS: Record<string, string> = {
  overall: "Global", uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear", lifesteal: "Lifesteal", crystal: "Crystal",
};

function RankBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-base leading-none">🥇</span>
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-base leading-none">🥈</span>
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-base leading-none">🥉</span>
      </div>
    );
  }
  return (
    <span className="text-[#6b7280] text-sm font-mono">#{position}</span>
  );
}

export function PlayerRow({ player, position, gamemode }: PlayerRowProps) {
  const skinSrc =
    player.customSkinUrl ||
    `https://visage.surgeplay.com/bust/96/${player.username}`;

  const isTop3 = position <= 3;
  const isTop10 = position <= 10;
  const title = getRankTitle(position);
  const titleColor = getRankTitleColor(position);

  const displayGamemode = player.gamemode ?? gamemode;

  return (
    <Link href={`/player/${player.id}?gamemode=${gamemode}`}>
      <div
        className={`grid px-3 py-1 items-center border-b border-[#1e2130] cursor-pointer transition-all duration-150
          ${isTop3 ? "bg-[#ffffff04] hover:bg-[#ffffff09]" : "hover:bg-[#1a1d27]"}`}
        style={{ gridTemplateColumns: COL_WIDTHS }}
      >
        {/* Rank */}
        <div className="flex items-center">
          <RankBadge position={position} />
        </div>

        {/* Player Skin */}
        <div className="flex items-center justify-center py-1">
          <img
            src={skinSrc}
            alt={player.username}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              const t = e.currentTarget;
              if (!t.src.includes("mc-heads")) {
                t.src = `https://mc-heads.net/avatar/${player.username}/40`;
              }
            }}
          />
        </div>

        {/* Username + Title */}
        <div className="flex flex-col justify-center min-w-0 pr-2 py-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isTop10 && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            )}
            <span
              className={`font-bold truncate text-sm leading-tight ${isTop3 ? "text-white" : "text-[#d1d5db]"}`}
            >
              {player.username}
            </span>
          </div>
          {position > 0 && position <= 50 && (
            <span
              className="text-[10px] font-medium leading-tight truncate mt-0.5"
              style={{ color: titleColor }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Mode */}
        <div className="hidden md:flex items-center">
          <span className="text-xs text-[#6b7280] bg-[#1e2130] px-1.5 py-0.5 rounded">
            {GAMEMODE_LABELS[displayGamemode] ?? displayGamemode}
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
          <span
            className={`text-sm font-bold tabular-nums ${isTop3 ? "text-white" : "text-[#9ca3af]"}`}
          >
            {player.points.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
