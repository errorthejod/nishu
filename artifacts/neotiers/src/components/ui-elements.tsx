import { ReactNode } from "react";
import { motion } from "framer-motion";

export const TIERS = ["HT1","HT2","HT3","HT4","HT5","LT1","LT2","LT3","LT4","LT5"] as const;
export type Tier = typeof TIERS[number];

export const TIER_ORDER: Record<string, number> = {
  HT1: 0, HT2: 1, HT3: 2, HT4: 3, HT5: 4,
  LT1: 5, LT2: 6, LT3: 7, LT4: 8, LT5: 9,
};

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  HT1: { bg: "#FFD700", text: "#000", border: "#FFD700", glow: "rgba(255,215,0,0.6)" },
  HT2: { bg: "#FF8C00", text: "#fff", border: "#FF8C00", glow: "rgba(255,140,0,0.5)" },
  HT3: { bg: "#00C853", text: "#000", border: "#00C853", glow: "rgba(0,200,83,0.5)" },
  HT4: { bg: "#00BCD4", text: "#000", border: "#00BCD4", glow: "rgba(0,188,212,0.5)" },
  HT5: { bg: "#9C27B0", text: "#fff", border: "#9C27B0", glow: "rgba(156,39,176,0.5)" },
  LT1: { bg: "#E91E63", text: "#fff", border: "#E91E63", glow: "rgba(233,30,99,0.4)" },
  LT2: { bg: "#2196F3", text: "#fff", border: "#2196F3", glow: "rgba(33,150,243,0.4)" },
  LT3: { bg: "#607D8B", text: "#fff", border: "#607D8B", glow: "rgba(96,125,139,0.4)" },
  LT4: { bg: "#455A64", text: "#fff", border: "#455A64", glow: "none" },
  LT5: { bg: "#263238", text: "#90A4AE", border: "#455A64", glow: "none" },
};

export function TierBadge({ tier, size = "md" }: { tier: string; size?: "sm" | "md" | "lg" }) {
  const upper = tier.toUpperCase();
  const style = TIER_STYLES[upper] || { bg: "#263238", text: "#90A4AE", border: "#455A64", glow: "none" };
  const isHT = upper.startsWith("HT");

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

export function getRankTitle(points: number): string {
  if (points >= 9000) return "Combat Grandmaster";
  if (points >= 7500) return "Combat Master";
  if (points >= 6000) return "Combat Expert";
  if (points >= 4500) return "Combat Veteran";
  if (points >= 3000) return "Combat Recruit";
  return "Combat Initiate";
}

export function EsportsButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const baseClasses =
    "esports-clip px-8 py-3 font-display text-xl tracking-wider uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:box-glow",
    secondary: "bg-secondary text-foreground hover:bg-muted",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      <p className="font-display text-xl text-muted-foreground uppercase tracking-widest animate-pulse">
        Loading Data...
      </p>
    </div>
  );
}
