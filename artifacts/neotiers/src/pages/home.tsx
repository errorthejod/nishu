import { Layout } from "@/components/layout";
import { EsportsButton } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { Copy, ArrowRight, Swords, Trophy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();

  const copyIp = () => {
    navigator.clipboard.writeText("neomc.fun");
    toast({
      title: "IP Copied!",
      description: "neomc.fun has been copied to your clipboard.",
      className: "bg-card border-primary text-foreground font-display tracking-wide",
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-background/90"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-display tracking-widest text-lg mt-0.5">SEASON 1 IS LIVE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-foreground text-glow leading-none uppercase"
          >
            Prove Your <span className="text-primary">Worth</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl font-light"
          >
            The ultimate Minecraft PvP ranking system. Compete in SMP, UHC, NethPot, and more to climb the tiers and dominate the global leaderboard.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <EsportsButton onClick={copyIp} className="text-2xl py-4 px-10">
              <Copy className="w-6 h-6 mr-2" />
              PLAY.NEOMC.FUN
            </EsportsButton>
            
            <Link href="/leaderboard">
              <EsportsButton variant="outline" className="text-2xl py-4 px-10 w-full">
                View Rankings
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </EsportsButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features/Stats Section */}
      <section className="py-20 bg-card border-y border-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Trophy, title: "Global Tiers", desc: "Climb from LT5 to HT1 across multiple standardized gamemodes. HT1 is the pinnacle." },
            { icon: Swords, title: "Fair Competition", desc: "Strictly monitored and balanced PvP leaderboards updated in real-time." },
            { icon: Users, title: "Active Community", desc: "Join thousands of players in our Discord and on the server." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-background p-8 border border-border/50 esports-clip-sm hover:border-primary/50 transition-colors group"
            >
              <feature.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-display text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Discord Banner */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-display text-foreground mb-6">Join The <span className="text-[#5865F2]">Discord</span></h2>
          <p className="text-xl text-muted-foreground mb-10">Get instantly notified of tier updates, participate in community events, and appeal ranking decisions.</p>
          <a href="https://discord.gg/7UxNZS3tph" target="_blank" rel="noreferrer">
            <button className="esports-clip bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-4 font-display text-2xl tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)]">
              Connect Now
            </button>
          </a>
        </div>
      </section>
    </Layout>
  );
}
