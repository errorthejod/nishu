import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GamemodeIcon } from "./ui-elements";

const GAMEMODE_NAV = [
  { href: "/leaderboard", label: "Overall",    gm: "overall" },
  { href: "/uhc",         label: "UHC",        gm: "uhc" },
  { href: "/nethpot",     label: "NethPot",    gm: "nethpot" },
  { href: "/smp",         label: "SMP",        gm: "smp" },
  { href: "/axe",         label: "Axe",        gm: "axe" },
  { href: "/mace",        label: "Mace",       gm: "mace" },
  { href: "/spear",       label: "Spear",      gm: "spear" },
  { href: "/lifesteal",   label: "Lifesteal",  gm: "lifesteal" },
  { href: "/crystal",     label: "Crystal",    gm: "crystal" },
  { href: "/sword",       label: "Sword",      gm: "sword" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1e2130] bg-[#0d0f14]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}images/neotiers-logo.png`}
              alt="NEOTIERS"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0 overflow-x-auto">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium tracking-wide transition-all whitespace-nowrap
                ${location === "/" ? "text-white border-b-2 border-primary" : "text-[#6b7280] hover:text-white"}`}
            >
              Home
            </Link>
            <div className="w-px h-4 bg-[#2a2f42] mx-1" />
            {GAMEMODE_NAV.map((link) => {
              const isActive = location === link.href || (link.href === "/leaderboard" && location === "/overall");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-2 text-sm font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5
                    ${isActive ? "text-white border-b-2 border-primary bg-primary/5" : "text-[#6b7280] hover:text-white"}`}
                >
                  <GamemodeIcon gamemode={link.gm} size="sm" active={isActive} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
            <a
              href="https://discord.gg/rCbVkcrb39"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded px-3 py-1.5 hover:opacity-90 transition-opacity text-white text-xs font-display uppercase tracking-wider"
              style={{ background: "#5865F2" }}
            >
              <svg width="16" height="12" viewBox="0 0 24 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 1.492a19.825 19.825 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 1.492a.07.07 0 00-.032.027C.533 6.093-.32 10.555.099 14.961a.08.08 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.442a.061.061 0 00-.031-.03zM8.02 12.278c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
            </a>
            <div className="text-xs text-[#6b7280] bg-[#1e2130] border border-[#2a2f42] px-3 py-1.5 rounded">
              <span className="text-white font-medium">neomc.fun</span>
            </div>
            <Link href="/stats" className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-white transition-colors">
              Stats
            </Link>
            <Link href="/admin" className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-white transition-colors">
              Admin
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-[#6b7280] ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="lg:hidden bg-[#0d0f14] border-b border-[#1e2130] overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1 p-3">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm rounded col-span-2 ${location === "/" ? "text-white bg-[#1e2130] border-l-2 border-primary" : "text-[#6b7280]"}`}
              >
                Home
              </Link>
              {GAMEMODE_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm rounded flex items-center gap-1.5 ${location === link.href ? "text-white bg-[#1e2130] border-l-2 border-primary" : "text-[#6b7280] hover:text-white"}`}
                >
                  <GamemodeIcon gamemode={link.gm} size="sm" active={location === link.href} />
                  {link.label}
                </Link>
              ))}
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-[#6b7280] col-span-2 border-t border-[#1e2130] mt-1 pt-2">
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#1e2130] bg-[#0a0c10] mt-10">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={`${import.meta.env.BASE_URL}images/neotiers-logo.png`} alt="NEOTIERS" className="h-7 w-auto object-contain opacity-60" />
          <div className="flex gap-6 text-sm text-[#6b7280]">
            <a href="https://discord.gg/rCbVkcrb39" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord</a>
            <span className="text-[#2a2f42]">|</span>
            <span>Server IP: <span className="text-white font-medium">neomc.fun</span></span>
          </div>
          <p className="text-[#4b5563] text-xs">© {new Date().getFullYear()} NEOTIERS. Not affiliated with Mojang AB.</p>
        </div>
      </footer>
    </div>
  );
}
