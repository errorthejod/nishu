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
              href="https://discord.gg/nPKGArUy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-0 rounded overflow-hidden hover:opacity-90 transition-opacity"
              style={{ background: "#5865F2" }}
            >
              <img
                src="/icon-discord.png"
                alt="Discord"
                className="h-8 w-auto object-contain px-3 py-1.5"
              />
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
            <a href="https://discord.gg/nPKGArUy" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord</a>
            <span className="text-[#2a2f42]">|</span>
            <span>Server IP: <span className="text-white font-medium">neomc.fun</span></span>
          </div>
          <p className="text-[#4b5563] text-xs">© {new Date().getFullYear()} NEOTIERS. Not affiliated with Mojang AB.</p>
        </div>
      </footer>
    </div>
  );
}
