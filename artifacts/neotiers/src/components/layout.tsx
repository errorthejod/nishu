import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAMEMODE_ICONS } from "./ui-elements";

const GAMEMODE_NAV = [
  { href: "/leaderboard", label: "Overall",   gm: "overall",  tabImg: "/icon-tab-overall.png" },
  { href: "/uhc",         label: "UHC",       gm: "uhc",      tabImg: "/icon-tab-uhc.png" },
  { href: "/nethpot",     label: "NethPot",   gm: "nethpot",  tabImg: "/icon-tab-nethpot.png" },
  { href: "/smp",         label: "SMP",       gm: "smp",      tabImg: "/icon-tab-smp.png" },
  { href: "/axe",         label: "Axe",       gm: "axe",      tabImg: "/icon-tab-axe.png" },
  { href: "/mace",        label: "Mace",      gm: "mace",     tabImg: "/icon-tab-mace.png" },
  { href: "/spear",       label: "Spear",     gm: "spear",    tabImg: null },
  { href: "/lifesteal",   label: "Lifesteal", gm: "lifesteal",tabImg: null },
  { href: "/crystal",     label: "Crystal",   gm: "crystal",  tabImg: null },
  { href: "/sword",       label: "Sword",     gm: "sword",    tabImg: "/icon-tab-sword.png" },
];

function TabIcon({ tabImg, gm, active }: { tabImg: string | null; gm: string; active: boolean }) {
  if (tabImg) {
    return (
      <div style={{ width: 40, height: 32, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={tabImg}
          alt={gm}
          style={{ width: 80, height: "auto", imageRendering: "pixelated" }}
        />
      </div>
    );
  }
  const meta = GAMEMODE_ICONS[gm] ?? GAMEMODE_ICONS.overall;
  return (
    <div style={{ width: 40, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={meta.src}
        alt={gm}
        width={28}
        height={28}
        style={{ imageRendering: "pixelated", objectFit: "contain", filter: active ? "none" : "brightness(0.7)" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f1117", fontFamily: "inherit" }}>

      {/* ── Top nav bar ── */}
      <header style={{ background: "#131520", borderBottom: "1px solid #1e2235", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 24 }}>
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <img
              src={`${import.meta.env.BASE_URL}images/neotiers-logo.png`}
              alt="NEOTIERS"
              style={{ height: 34, width: "auto", objectFit: "contain" }}
            />
          </Link>

          {/* Desktop center nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }} className="hidden lg:flex">
            {[
              { href: "/", label: "Home" },
              { href: "/stats", label: "Stats" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "4px 12px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: location === item.href ? "#fff" : "#8b92a8",
                  borderRadius: 6,
                  background: location === item.href ? "rgba(255,255,255,0.07)" : "transparent",
                  textDecoration: "none",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }} className="hidden lg:flex">
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#6b7280" }} />
              <input
                type="text"
                placeholder="Search player..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchVal.trim()) {
                    window.location.href = `/player/${searchVal.trim()}`;
                    setSearchVal("");
                  }
                }}
                style={{
                  paddingLeft: 30, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
                  fontSize: 12, background: "#1a1d2e", border: "1px solid #2a2f48",
                  borderRadius: 6, color: "#fff", outline: "none", width: 180,
                }}
              />
            </div>
            <a
              href="https://discord.gg/rCbVkcrb39"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#5865F2", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#fff", textDecoration: "none" }}
            >
              <svg width="14" height="11" viewBox="0 0 24 18" fill="white"><path d="M20.317 1.492a19.825 19.825 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 1.492a.07.07 0 00-.032.027C.533 6.093-.32 10.555.099 14.961a.08.08 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.442a.061.061 0 00-.031-.03zM8.02 12.278c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Discord
            </a>
            <div style={{ fontSize: 12, color: "#8b92a8", background: "#1a1d2e", border: "1px solid #2a2f48", borderRadius: 6, padding: "5px 12px" }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>neomc.fun</span>
            </div>
            <Link href="/admin" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none", padding: "5px 8px" }}>Admin</Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#8b92a8", cursor: "pointer" }}
          >
            {isMobileMenuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>
        </div>
      </header>

      {/* ── Gamemode tab bar ── */}
      <div style={{ background: "#131520", borderBottom: "1px solid #1e2235" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 2, overflowX: "auto", paddingBottom: 0 }}>
            {GAMEMODE_NAV.map((link) => {
              const isActive = location === link.href || (link.href === "/leaderboard" && location === "/overall");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 12px 6px",
                    minWidth: 72,
                    cursor: "pointer",
                    textDecoration: "none",
                    borderBottom: isActive ? "2px solid #ffffff" : "2px solid transparent",
                    background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                    transition: "all 0.15s",
                    gap: 4,
                  }}
                >
                  <TabIcon tabImg={link.tabImg} gm={link.gm} active={isActive} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#ffffff" : "#8b92a8",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: "#131520", borderBottom: "1px solid #1e2235", overflow: "hidden" }}
            className="lg:hidden"
          >
            <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ gridColumn: "1/-1", padding: "8px 12px", fontSize: 13, color: location === "/" ? "#fff" : "#8b92a8", textDecoration: "none", borderRadius: 6, background: location === "/" ? "rgba(255,255,255,0.07)" : "transparent" }}>Home</Link>
              {GAMEMODE_NAV.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} style={{ padding: "8px 12px", fontSize: 13, color: location === link.href ? "#fff" : "#8b92a8", textDecoration: "none", borderRadius: 6, background: location === link.href ? "rgba(255,255,255,0.07)" : "transparent", display: "flex", alignItems: "center", gap: 8 }}>
                  <TabIcon tabImg={link.tabImg} gm={link.gm} active={location === link.href} />
                  {link.label}
                </Link>
              ))}
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ gridColumn: "1/-1", padding: "8px 12px", fontSize: 13, color: "#6b7280", textDecoration: "none", borderTop: "1px solid #1e2235", marginTop: 4, paddingTop: 10 }}>Admin Panel</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main style={{ flex: 1, width: "100%" }}>{children}</main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e2235", background: "#0c0e17", marginTop: 32 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <img src={`${import.meta.env.BASE_URL}images/neotiers-logo.png`} alt="NEOTIERS" style={{ height: 26, opacity: 0.5 }} />
          <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#6b7280" }}>
            <a href="https://discord.gg/rCbVkcrb39" target="_blank" rel="noreferrer" style={{ color: "#6b7280", textDecoration: "none" }}>Discord</a>
            <span>Server IP: <span style={{ color: "#fff", fontWeight: 600 }}>neomc.fun</span></span>
          </div>
          <p style={{ fontSize: 11, color: "#3d4257" }}>© {new Date().getFullYear()} NEOTIERS — Not affiliated with Mojang AB.</p>
        </div>
      </footer>
    </div>
  );
}
