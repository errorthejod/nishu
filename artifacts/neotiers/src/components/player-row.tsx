import { Player } from "@workspace/api-client-react";
import { TierBadge, getRankTitle, getRankTitleColor, getRankTitleStyle, handleSkinError } from "./ui-elements";
import { Link } from "wouter";
import { COL_WIDTHS } from "@/pages/leaderboard";

function getSkinUrl(player: Player, size: number): string {
  const custom = (player as any).customSkinUrl as string | null | undefined;
  if (custom) {
    if (custom.startsWith("http")) return custom;
    return `https://visage.surgeplay.com/bust/${size}/${custom}`;
  }
  return `https://visage.surgeplay.com/bust/${size}/${player.username}`;
}

function RegionBadge({ region }: { region?: string }) {
  const upper = (region || "NA").toUpperCase();
  const colors: Record<string, { bg: string; text: string }> = {
    NA: { bg: "#1e40af", text: "#93c5fd" },
    EU: { bg: "#14532d", text: "#86efac" },
    AS: { bg: "#7c3aed", text: "#c4b5fd" },
    OC: { bg: "#0e4f7c", text: "#7dd3fc" },
    IN: { bg: "#7c2d12", text: "#fdba74" },
    SA: { bg: "#065f46", text: "#6ee7b7" },
  };
  const c = colors[upper] ?? { bg: "#1e2235", text: "#9ca3af" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: c.bg, color: c.text, display: "inline-block", letterSpacing: "0.05em" }}>{upper}</span>
  );
}

interface PlayerRowProps {
  player: Player;
  position: number;
  gamemode: string;
}

const GAMEMODE_LABELS: Record<string, string> = {
  overall: "Global", uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear", lifesteal: "Lifesteal", crystal: "Crystal", sword: "Sword",
};

const RANK_BG = (rank: number): string | undefined => {
  if (rank === 1) return "linear-gradient(to right, rgba(255,215,0,0.10) 0%, transparent 70%)";
  if (rank === 2) return "linear-gradient(to right, rgba(192,192,192,0.08) 0%, transparent 70%)";
  if (rank === 3) return "linear-gradient(to right, rgba(205,127,50,0.10) 0%, transparent 70%)";
  return undefined;
};

function RankBadge({ position }: { position: number }) {
  if (position === 1)
    return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, fontWeight: 900, fontSize: 13, color: "#000", background: "linear-gradient(135deg,#FFD700,#FFA500)" }}>1</span>;
  if (position === 2)
    return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, fontWeight: 900, fontSize: 13, color: "#000", background: "linear-gradient(135deg,#E8E8E8,#A0A0A0)" }}>2</span>;
  if (position === 3)
    return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, fontWeight: 900, fontSize: 13, color: "#fff", background: "linear-gradient(135deg,#CD7F32,#7a4010)" }}>3</span>;
  return <span style={{ color: "#6b7280", fontSize: 12, fontFamily: "monospace" }}>#{position}</span>;
}

export function PlayerRow({ player, position, gamemode }: PlayerRowProps) {
  const title = getRankTitle(position);
  const titleColor = getRankTitleColor(position);
  const displayGamemode = player.gamemode ?? gamemode;
  const bg = RANK_BG(position);

  return (
    <Link href={`/player/${player.username}`}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COL_WIDTHS,
          padding: "0 12px",
          alignItems: "center",
          borderBottom: "1px solid #1a1d2e",
          cursor: "pointer",
          background: bg,
          transition: "filter 0.1s",
          minHeight: 52,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.12)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = "")}
      >
        {/* Rank */}
        <div><RankBadge position={position} /></div>

        {/* Skin */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
          <img
            src={getSkinUrl(player, 64)}
            alt={player.username}
            style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated" }}
            onError={(e) => handleSkinError(e, player.username, 64)}
          />
        </div>

        {/* Name + title */}
        <div style={{ minWidth: 0, paddingRight: 8 }}>
          <p style={{ fontWeight: 600, color: "#fff", margin: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {player.username}
          </p>
          {position <= 50 && (
            <p style={{ fontSize: 10, margin: 0, color: titleColor, ...getRankTitleStyle(title), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </p>
          )}
        </div>

        {/* Region */}
        <div><RegionBadge region={(player as any).region} /></div>

        {/* Gamemode */}
        <div style={{ display: "none" }} className="md:block">
          <span style={{ fontSize: 11, color: "#6b7280", background: "#1a1d2e", borderRadius: 4, padding: "2px 6px" }}>
            {GAMEMODE_LABELS[displayGamemode] ?? displayGamemode}
          </span>
        </div>

        {/* Tier */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TierBadge tier={player.tier} size="sm" />
        </div>

        {/* Points */}
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: position <= 3 ? "#fff" : "#9ca3af", fontVariantNumeric: "tabular-nums" }}>
            {player.points.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
