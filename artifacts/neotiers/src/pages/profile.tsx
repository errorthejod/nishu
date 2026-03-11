import { Layout } from "@/components/layout";
import { TierBadge, LoadingSpinner } from "@/components/ui-elements";
import { useGetPlayer } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Trophy, Calendar, Swords } from "lucide-react";

export default function Profile() {
  const params = useParams<{ id: string }>();
  const playerId = parseInt(params.id || "0", 10);

  const { data: player, isLoading, error } = useGetPlayer(playerId, {
    query: { enabled: playerId > 0 }
  });

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;
  
  if (error || !player) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-display text-destructive uppercase">Player Not Found</h1>
          <Link href="/leaderboard" className="text-primary hover:underline mt-4 inline-block">Return to Leaderboard</Link>
        </div>
      </Layout>
    );
  }

  const joinDate = new Date(player.createdAt);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/leaderboard" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 font-display text-xl uppercase tracking-wider">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Rankings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 3D Render & Identity */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-card border border-border p-8 esports-clip-sm flex flex-col items-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <img 
                src={`https://mc-heads.net/body/${player.username}/256`} 
                alt={`${player.username} 3D render`}
                className="h-80 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] z-10"
              />
              
              <div className="mt-8 text-center z-10 w-full border-t border-border/50 pt-6">
                <h1 className="text-4xl font-display text-foreground font-bold tracking-widest break-all">
                  {player.username}
                </h1>
                <div className="mt-2">
                  <TierBadge tier={player.tier} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stats */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8 esports-clip flex justify-between items-center bg-[url('/images/hero-bg.png')] bg-cover bg-center bg-blend-overlay"
              style={{ backgroundColor: 'rgba(10,10,10,0.85)' }}
            >
              <div>
                <div className="text-primary font-display text-2xl tracking-widest uppercase mb-1">Global Rank</div>
                <div className="text-7xl font-display font-bold text-foreground text-glow">#{player.rank}</div>
              </div>
              <Trophy className="w-24 h-24 text-primary/20" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard 
                icon={Target} 
                label="Points" 
                value={player.points.toLocaleString()} 
                delay={0.1} 
              />
              <StatCard 
                icon={Swords} 
                label="Main Gamemode" 
                value={player.gamemode} 
                delay={0.2}
                capitalize 
              />
              <StatCard 
                icon={Swords} 
                label="Preferred Weapon" 
                value={player.weapon} 
                delay={0.3} 
                capitalize
              />
              <StatCard 
                icon={Calendar} 
                label="Ranked Since" 
                value={format(joinDate, 'MMM d, yyyy')} 
                delay={0.4} 
              />
            </div>
            
            {/* Visual flair - empty decorative element matching esports theme */}
            <div className="mt-auto pt-6 flex gap-2 w-full opacity-30">
              <div className="h-2 flex-1 bg-primary/40 esports-clip-sm"></div>
              <div className="h-2 w-12 bg-primary/60 esports-clip-sm"></div>
              <div className="h-2 w-4 bg-primary esports-clip-sm"></div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, delay, capitalize = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-background border border-border p-6 esports-clip-sm hover:border-primary/50 transition-colors flex items-start gap-4"
    >
      <div className="p-3 bg-secondary rounded-sm">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground uppercase tracking-widest">{label}</div>
        <div className={`text-2xl font-display tracking-wider text-foreground mt-1 ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}
