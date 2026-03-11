import { ReactNode } from "react";
import { motion } from "framer-motion";

export function TierBadge({ tier }: { tier: string }) {
  const normalized = tier.toUpperCase();
  
  const styles: Record<string, string> = {
    'S': 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/50 text-glow-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]',
    'A': 'bg-primary/10 text-primary border-primary/50 text-glow shadow-[0_0_10px_rgba(255,0,60,0.2)]',
    'B': 'bg-[#FF8C00]/10 text-[#FF8C00] border-[#FF8C00]/50',
    'C': 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/50',
    'D': 'bg-gray-500/10 text-gray-400 border-gray-500/50',
  };

  const defaultStyle = 'bg-gray-800 text-gray-300 border-gray-700';

  return (
    <span className={`
      font-display text-xl px-3 py-0.5 mt-1 border rounded-sm tracking-wider font-bold inline-block
      ${styles[normalized] || defaultStyle}
    `}>
      {normalized} TIER
    </span>
  );
}

export function EsportsButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  type = 'button'
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const baseClasses = "esports-clip px-8 py-3 font-display text-xl tracking-wider uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:box-glow",
    secondary: "bg-secondary text-foreground hover:bg-muted",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10"
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
      <p className="font-display text-xl text-muted-foreground uppercase tracking-widest animate-pulse">Loading Data...</p>
    </div>
  );
}
