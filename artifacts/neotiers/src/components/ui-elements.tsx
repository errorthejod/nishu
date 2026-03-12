import { ReactNode } from "react";

export const TIERS = ["HT1","HT2","HT3","HT4","HT5","LT1","LT2","LT3","LT4","LT5"] as const;
export type Tier = typeof TIERS[number];

export const TIER_ORDER: Record<string, number> = {
  HT1: 0, HT2: 1, HT3: 2, HT4: 3, HT5: 4,
  LT1: 5, LT2: 6, LT3: 7, LT4: 8, LT5: 9,
};

// Updated tier colors per spec
const TIER_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  HT1: { bg: "#dc2626", text: "#fff", border: "#ef4444", glow: "rgba(220,38,38,0.6)" },
  HT2: { bg: "#ea580c", text: "#fff", border: "#f97316", glow: "rgba(234,88,12,0.5)" },
  HT3: { bg: "#ca8a04", text: "#fff", border: "#eab308", glow: "rgba(202,138,4,0.5)" },
  HT4: { bg: "#16a34a", text: "#fff", border: "#4ade80", glow: "rgba(22,163,74,0.5)" },
  HT5: { bg: "#15803d", text: "#fff", border: "#22c55e", glow: "rgba(21,128,61,0.4)" },
  LT1: { bg: "#7e22ce", text: "#fff", border: "#a855f7", glow: "rgba(126,34,206,0.5)" },
  LT2: { bg: "#1d4ed8", text: "#fff", border: "#3b82f6", glow: "rgba(29,78,216,0.5)" },
  LT3: { bg: "#0e7490", text: "#fff", border: "#06b6d4", glow: "rgba(14,116,144,0.4)" },
  LT4: { bg: "#4b5563", text: "#fff", border: "#6b7280", glow: "none" },
  LT5: { bg: "#1f2937", text: "#9ca3af", border: "#374151", glow: "none" },
};

export const TIER_COLORS: Record<string, string> = {
  HT1: "#dc2626", HT2: "#ea580c", HT3: "#ca8a04",
  HT4: "#16a34a", HT5: "#15803d",
  LT1: "#7e22ce", LT2: "#1d4ed8", LT3: "#0e7490",
  LT4: "#4b5563", LT5: "#1f2937",
};

export function TierBadge({ tier, size = "md" }: { tier: string; size?: "sm" | "md" | "lg" }) {
  const upper = tier.toUpperCase();
  const style = TIER_STYLES[upper] || { bg: "#1f2937", text: "#9ca3af", border: "#374151", glow: "none" };

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 min-w-[32px]",
    md: "text-xs px-2 py-1 min-w-[38px]",
    lg: "text-sm px-3 py-1.5 min-w-[48px]",
  };

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        boxShadow: style.glow !== "none" ? `0 0 8px ${style.glow}` : "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        fontWeight: 700,
        fontFamily: "inherit",
        letterSpacing: "0.05em",
      }}
      className={`${sizeClasses[size]} font-bold tracking-wide`}
    >
      {upper}
    </span>
  );
}

export const WEAPON_ICONS: Record<string, string> = {
  sword:     "⚔️",
  axe:       "🪓",
  mace:      "🔨",
  crystal:   "💎",
  bow:       "🏹",
  spear:     "🗡️",
  lifesteal: "🩸",
  trident:   "🔱",
  pickaxe:   "⛏️",
};

export function WeaponIcon({ weapon }: { weapon: string }) {
  const key = weapon.toLowerCase();
  const icon = WEAPON_ICONS[key] ?? "⚔️";
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
      <span className="text-sm leading-none">{icon}</span>
      <span>{weapon}</span>
    </span>
  );
}

/** Returns the rank title based on leaderboard position (1-indexed) */
export function getRankTitle(rank: number): string {
  if (rank === 1) return "Combat Grandmaster";
  if (rank === 2) return "Combat Master";
  if (rank === 3) return "Master";
  if (rank <= 10) return "Combat Ace";
  if (rank <= 25) return "Combat Specialist";
  if (rank <= 50) return "Combat Initiate";
  return "Unranked";
}

/** Color for each rank title */
export function getRankTitleColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  if (rank <= 10) return "#ef4444";
  if (rank <= 25) return "#a855f7";
  if (rank <= 50) return "#6b7280";
  return "#4b5563";
}

export function EsportsButton({
  children, onClick, variant = "primary", className = "", disabled = false, type = "button",
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "outline";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "esports-clip px-8 py-3 font-display text-xl tracking-wider uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-foreground hover:bg-muted",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      <p className="font-display text-xl text-muted-foreground uppercase tracking-widest animate-pulse">Loading Data...</p>
    </div>
  );
}
