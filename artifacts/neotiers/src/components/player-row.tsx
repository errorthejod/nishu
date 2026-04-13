import { Player } from "@workspace/api-client-react";
import { TierBadge, getRankTitle, getRankTitleColor, getRankTitleStyle, handleSkinError } from "./ui-elements";
import { Link } from "wouter";
import { COL_WIDTHS } from "@/pages/leaderboard";

interface PlayerRowProps {
  player: Player;
  position: number;
  gamemode: string;
}

const GAMEMODE_LABELS: Record<string, string> = {
  overall: "Global", uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear", lifesteal: "Lifesteal", crystal: "Crystal", sword: "Sword",
};

const RANK_BG: Record<number, string> = {
  1: "linear-gradient(to right, rgba(255,215,0,0.12) 0%, rgba(255,215,0,0.04) 60%, transparent 100%)",
  2: "linear-gradient(to right, rgba(192,192,192,0.10) 0%, rgba(192,192,192,0.03) 60%, transparent 100%)",
  3: "linear-gradient(to right, rgba(205,127,50,0.12) 0%, rgba(205,127,50,0.04) 60%, transparent 100%)",
};

const RANK_BORDER: Record<number, string> = {
  1: "rgba(255,215,0,0.35)",
  2: "rgba(192,192,192,0.25)",
  3: "rgba(205,127,50,0.30)",
};

function RankBadge({ position }: { position: number }) {
  if (position === 1)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md font-black text-sm text-black" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}>1</span>
    );
  if (position === 2)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md font-black text-sm text-black" style={{ background: "linear-gradient(135deg, #E8E8E8, #A0A0A0)" }}>2</span>
    );
  if (position === 3)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md font-black text-sm text-black" style={{ background: "linear-gradient(135deg, #CD7F32, #8B4513)" }}>3</span>
    );
  return <span className="text-[#6b7280] text-sm font-mono">#{position}</span>;
}

export function PlayerRow({ player, position, gamemode }: PlayerRowProps) {
  const isTop3 = position <= 3;
  const isTop10 = position <= 10;
  const title = getRankTitle(position);
  const titleColor = getRankTitleColor(position);
  const displayGamemode = player.gamemode ?? gamemode;

  return (
    <Link href={`/player/${player.username}`}>
      <div
        className="grid px-3 py-1 items-center border-b cursor-pointer transition-all duration-150 hover:brightness-110"
        style={{
          gridTemplateColumns: COL_WIDTHS,
          background: isTop3 ? RANK_BG[position] : undefined,
          borderColor: isTop3 ? RANK_BORDER[position] : "#1e2130",
          borderLeftWidth: isTop3 ? "3px" : "0px",
        }}
      >
        <div className="flex items-center">
          <RankBadge position={position} />
        </div>

        <div className="flex items-center justify-center py-1">
          <img
            src={`https://visage.surgeplay.com/bust/${isTop3 ? 128 : 112}/${player.username}`}
            alt={player.username}
            className={`${isTop3 ? "w-24 h-24" : "w-20 h-20"} object-contain`}
            style={{ imageRendering: "pixelated" }}
            onError={(e) => handleSkinError(e, player.username, isTop3 ? 128 : 112)}
          />
        </div>

        <div className="flex flex-col justify-center min-w-0 pr-2 py-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isTop10 && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
            <span className={`font-bold truncate text-sm leading-tight ${isTop3 ? "text-white" : "text-[#d1d5db]"}`}>
              {player.username}
            </span>
          </div>
          {position > 0 && position <= 50 && (
            <span className="text-[10px] leading-tight truncate mt-0.5" style={{ color: titleColor, ...getRankTitleStyle(title) }}>
              {title}
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center">
          <span className="text-xs text-[#6b7280] bg-[#1e2130] px-1.5 py-0.5 rounded">
            {GAMEMODE_LABELS[displayGamemode] ?? displayGamemode}
          </span>
        </div>

        <div className="hidden md:flex items-center">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1e2130] border border-[#2a2f42] text-white">
            {(player as any).region || "—"}
          </span>
        </div>

        <div className="flex items-center justify-center">
          <TierBadge tier={player.tier} />
        </div>

        <div className="flex items-center justify-end">
          <span className={`text-sm font-bold tabular-nums ${isTop3 ? "text-white" : "text-[#9ca3af]"}`}>
            {player.points.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
