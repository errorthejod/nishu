import { Player } from "@workspace/api-client-react";
import { TierBadge } from "./ui-elements";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function PlayerRow({ player, index }: { player: Player; index: number }) {
  const isTop3 = index < 3;
  const isS = player.tier.toUpperCase() === 'S';

  return (
    <Link href={`/player/${player.id}`}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 > 0.5 ? 0 : index * 0.05 }}
        className={`
          group relative flex items-center p-4 mb-2 bg-card border transition-all duration-300 cursor-pointer esports-clip-sm
          ${isTop3 ? 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-secondary'}
          ${isS ? 'box-glow-hover' : ''}
        `}
      >
        {/* Rank Number */}
        <div className={`
          w-16 font-display text-4xl font-bold text-center
          ${index === 0 ? 'text-yellow-400 text-glow-gold' : ''}
          ${index === 1 ? 'text-gray-300' : ''}
          ${index === 2 ? 'text-amber-700' : ''}
          ${index > 2 ? 'text-muted-foreground' : ''}
        `}>
          #{index + 1}
        </div>

        {/* Player Info */}
        <div className="flex-1 flex items-center gap-4 ml-4">
          <div className="relative">
            <img 
              src={player.customSkinUrl || `https://mc-heads.net/avatar/${player.username}/64`} 
              alt={player.username} 
              className="w-12 h-12 rounded-md shadow-lg bg-background"
              loading="lazy"
            />
            {isS && <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 ring-offset-card rounded-md animate-pulse"></div>}
          </div>
          
          <div>
            <h3 className="font-display text-2xl uppercase tracking-wider text-foreground group-hover:text-primary transition-colors mt-1">
              {player.username}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{player.gamemode}</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span>{player.weapon}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 pr-4">
          <div className="hidden md:block text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Points</div>
            <div className="font-display text-2xl text-foreground mt-1">{player.points.toLocaleString()}</div>
          </div>
          <div className="w-24 text-right">
            <TierBadge tier={player.tier} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
