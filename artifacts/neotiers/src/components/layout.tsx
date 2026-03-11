import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/leaderboard", label: "Global" },
    { href: "/smp", label: "SMP" },
    { href: "/uhc", label: "UHC" },
    { href: "/nethpot", label: "NethPot" },
    { href: "/pvp", label: "PvP" },
    { href: "/bedwars", label: "BedWars" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <Shield className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="font-display text-2xl font-bold tracking-widest text-foreground mt-1">
              NEO<span className="text-primary">TIERS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 font-display text-lg tracking-wider transition-all duration-200 uppercase mt-1
                    ${isActive 
                      ? "text-primary text-glow" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-border mx-2"></div>
            <Link 
              href="/admin" 
              className="px-4 py-2 font-display text-lg tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase mt-1"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 font-display text-xl tracking-wider uppercase
                    ${location === link.href ? "text-primary bg-primary/10 border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}
                  `}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2"></div>
              <Link 
                href="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 font-display text-xl tracking-wider text-muted-foreground uppercase"
              >
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-bold tracking-widest text-muted-foreground mt-1">
              NEO<span className="text-primary">TIERS</span>
            </span>
          </div>
          
          <div className="flex gap-6">
            <a href="https://discord.gg/7UxNZS3tph" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Discord Server
            </a>
            <span className="text-border">|</span>
            <span className="text-muted-foreground font-medium">Server IP: <span className="text-foreground">neomc.fun</span></span>
          </div>
          
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} NEOTIERS. Not affiliated with Mojang AB.
          </p>
        </div>
      </footer>
    </div>
  );
}
