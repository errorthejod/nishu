import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { EsportsButton, LoadingSpinner, TierBadge, GamemodeIcon } from "@/components/ui-elements";
import { 
  useAdminMe, 
  useAdminLogout, 
  useListPlayers, 
  useCreatePlayer, 
  useUpdatePlayer, 
  useDeletePlayer,
  useListGamemodes,
  useCreateGamemode,
  useDeleteGamemode,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Edit, Trash2, Settings, Users, Gamepad2, Download, Database, FileCode, ShieldCheck, Terminal, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const VALID_GAMEMODES = ["overall", "uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword"] as const;
const GAMEMODE_LABELS: Record<string, string> = {
  overall: "Overall", uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear", lifesteal: "Lifesteal",
  crystal: "Crystal", sword: "Sword",
};

const REGIONS = ["NA", "EU", "AS", "IN", "AU", "US"] as const;
const REGION_LABELS: Record<string, string> = {
  NA: "NA — North America",
  EU: "EU — Europe",
  AS: "AS — Asia",
  IN: "IN — India",
  AU: "AU — Australia",
  US: "US — United States",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"players" | "gamemodes" | "settings">("players");

  const { data: auth, isLoading: isAuthLoading, isError: isAuthError } = useAdminMe({ query: { retry: false } });
  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => { toast({ title: "Logged out" }); setLocation("/admin"); }
    }
  });

  useEffect(() => {
    if (isAuthError || (auth && !auth.isAdmin)) setLocation("/admin");
  }, [auth, isAuthError, setLocation]);

  if (isAuthLoading) return <Layout><LoadingSpinner /></Layout>;
  if (!auth?.isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-4xl font-display uppercase tracking-widest text-primary text-glow">System Control</h1>
            <p className="text-muted-foreground">Admin Operations Panel</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="mt-4 md:mt-0 flex items-center text-muted-foreground hover:text-destructive transition-colors font-display text-xl uppercase"
          >
            <LogOut className="w-5 h-5 mr-2" /> Terminate Session
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8 overflow-x-auto">
          {([
            { id: "players", icon: Users, label: "Player Database" },
            { id: "gamemodes", icon: Gamepad2, label: "Gamemodes" },
            { id: "settings", icon: Settings, label: "Site Config" },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 font-display text-xl tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
            >
              <tab.icon className="w-5 h-5 mr-3" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border p-6 esports-clip-sm min-h-[500px]">
          {activeTab === "players" && <PlayersTab />}
          {activeTab === "gamemodes" && <GamemodesTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </Layout>
  );
}

function PlayersTab() {
  const [selectedGamemode, setSelectedGamemode] = useState<string>("uhc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: players = [], isLoading } = useListPlayers(
    { gamemode: selectedGamemode, limit: "200" },
    { query: { queryKey: ["players", selectedGamemode] } }
  );

  const deleteMutation = useDeletePlayer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast({ title: "Player deleted" });
      },
    },
  });

  const openAdd = () => { setEditingPlayer(null); setIsFormOpen(true); };
  const openEdit = (p: any) => { setEditingPlayer(p); setIsFormOpen(true); };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div className="flex flex-wrap gap-1">
          {VALID_GAMEMODES.map(gm => (
            <button
              key={gm}
              onClick={() => setSelectedGamemode(gm)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1.5
                ${selectedGamemode === gm
                  ? "bg-primary text-black font-bold"
                  : "bg-[#1e2130] text-[#9ca3af] hover:text-white border border-[#2a2f42]"
                }`}
            >
              <GamemodeIcon gamemode={gm} size="sm" active={selectedGamemode === gm} />
              {GAMEMODE_LABELS[gm]}
            </button>
          ))}
        </div>
        <EsportsButton onClick={openAdd} className="py-2 px-4 text-base">
          <Plus className="w-4 h-4 mr-2" /> Add Player
        </EsportsButton>
      </div>

      <div className="text-sm text-muted-foreground mb-3">
        Showing <span className="text-white font-bold">{players.length}</span> players in{" "}
        <span className="text-primary font-bold">{GAMEMODE_LABELS[selectedGamemode]}</span>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background">
                {["ID", "Skin", "Username", "Tier", "Points", "Region", "Rank", "Actions"].map(h => (
                  <th key={h} className="p-3 font-display text-sm uppercase text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    No players in {GAMEMODE_LABELS[selectedGamemode]} yet
                  </td>
                </tr>
              ) : players.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 text-muted-foreground text-sm">#{p.id}</td>
                  <td className="p-3">
                    <img
                      src={(() => {
                        const custom = (p as any).customSkinUrl as string | null | undefined;
                        if (custom) return custom.startsWith("http") ? custom : `https://visage.surgeplay.com/bust/64/${custom}`;
                        return `https://visage.surgeplay.com/face/32/${p.username}`;
                      })()}
                      alt={p.username}
                      className="w-8 h-8 rounded object-contain"
                      style={{ imageRendering: "pixelated" }}
                      onError={(e) => { e.currentTarget.src = `https://mc-heads.net/avatar/${p.username}/32`; }}
                    />
                  </td>
                  <td className="p-3 font-bold">{p.username}</td>
                  <td className="p-3"><TierBadge tier={p.tier} /></td>
                  <td className="p-3 font-display text-lg">{p.points.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1e2130] border border-[#2a2f42] text-white">
                      {(p as any).region || "NA"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-[#9ca3af]">#{p.rank}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded mr-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${p.username} from ${GAMEMODE_LABELS[selectedGamemode]}?`)) {
                          deleteMutation.mutate({ id: p.id, params: { gamemode: selectedGamemode } });
                        }
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PlayerFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingPlayer}
        defaultGamemode={selectedGamemode}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["players"] });
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}

function GamemodesTab() {
  const { data: gamemodes, isLoading } = useListGamemodes();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateGamemode({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/gamemodes"] }); toast({ title: "Gamemode Created" }); }
    }
  });
  const deleteMutation = useDeleteGamemode({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/gamemodes"] }); toast({ title: "Gamemode Deleted" }); }
    }
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        name: fd.get("name") as string,
        slug: fd.get("slug") as string,
        defaultWeapon: fd.get("defaultWeapon") as string,
        description: fd.get("description") as string,
      }
    });
    e.currentTarget.reset();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-display uppercase tracking-widest mb-6">Active Modes</h2>
        <div className="space-y-3">
          {gamemodes?.map(g => (
            <div key={g.id} className="bg-background border border-border p-4 esports-clip-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <GamemodeIcon gamemode={g.slug} size="md" active />
                <div>
                  <h3 className="font-display text-xl">{g.name} <span className="text-muted-foreground text-sm">({g.slug})</span></h3>
                </div>
              </div>
              <button onClick={() => { if (confirm("Delete gamemode?")) deleteMutation.mutate({ id: g.id }); }} className="text-destructive hover:text-red-400 p-2">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background border border-border p-6 esports-clip-sm h-fit">
        <h2 className="text-2xl font-display uppercase tracking-widest mb-6">Register Mode</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Name</label><input name="name" required className="w-full bg-card border border-border p-2 focus:border-primary outline-none" placeholder="e.g. Crystal" /></div>
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Slug</label><input name="slug" required className="w-full bg-card border border-border p-2 focus:border-primary outline-none" placeholder="e.g. crystal" /></div>
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Default Weapon</label><input name="defaultWeapon" required className="w-full bg-card border border-border p-2 focus:border-primary outline-none" placeholder="e.g. Sword" /></div>
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Description</label><textarea name="description" className="w-full bg-card border border-border p-2 focus:border-primary outline-none min-h-[80px]" /></div>
          <EsportsButton type="submit" className="w-full py-2 text-base mt-4" disabled={createMutation.isPending}>Add Gamemode</EsportsButton>
        </form>
      </div>
    </div>
  );
}

const TIERS = ["HT1", "HT2", "HT3", "HT4", "HT5", "LT1", "LT2", "LT3", "LT4", "LT5"];

function getCustomSkinPreviewUrl(customSkinUrl: string, username: string): string {
  if (!customSkinUrl) return `https://visage.surgeplay.com/bust/128/${username || "Steve"}`;
  if (customSkinUrl.startsWith("http")) return customSkinUrl;
  return `https://visage.surgeplay.com/bust/128/${customSkinUrl}`;
}

function PlayerFormDialog({ isOpen, onClose, initialData, defaultGamemode, onSuccess }: any) {
  const { toast } = useToast();
  const [skinPreviewError, setSkinPreviewError] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    gamemode: defaultGamemode || "uhc",
    tier: "LT5",
    points: 0,
    region: "NA",
    customSkinUrl: "",
  });

  useEffect(() => {
    setSkinPreviewError(false);
    if (initialData) {
      setFormData({
        username: initialData.username,
        gamemode: initialData.gamemode || defaultGamemode,
        tier: initialData.tier,
        points: initialData.points,
        region: initialData.region || "NA",
        customSkinUrl: initialData.customSkinUrl || "",
      });
    } else {
      setFormData({ username: "", gamemode: defaultGamemode || "uhc", tier: "LT5", points: 0, region: "NA", customSkinUrl: "" });
    }
  }, [initialData, isOpen, defaultGamemode]);

  const createMutation = useCreatePlayer({
    mutation: {
      onSuccess: () => { toast({ title: "Player Added" }); onSuccess?.(); },
      onError: (err: any) => { toast({ title: "Error", description: err?.message || "Failed to add player", variant: "destructive" }); },
    }
  });
  const updateMutation = useUpdatePlayer({
    mutation: {
      onSuccess: () => { toast({ title: "Player Updated" }); onSuccess?.(); },
      onError: (err: any) => { toast({ title: "Error", description: err?.message || "Failed to update player", variant: "destructive" }); },
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      points: Number(formData.points),
      customSkinUrl: formData.customSkinUrl || null,
    };
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const handleChange = (e: any) => {
    setSkinPreviewError(false);
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none esports-clip-sm";
  const labelClass = "block text-xs font-display uppercase tracking-widest text-muted-foreground mb-1 mt-4";

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md esports-clip text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl uppercase tracking-widest text-primary">
            {initialData ? "Edit Player" : "Add Player"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <label className={labelClass}>Username</label>
          <input required name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="Minecraft username" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gamemode</label>
              <select required name="gamemode" value={formData.gamemode} onChange={handleChange} className={inputClass}>
                {VALID_GAMEMODES.map(gm => (
                  <option key={gm} value={gm}>{GAMEMODE_LABELS[gm]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tier</label>
              <select required name="tier" value={formData.tier} onChange={handleChange} className={inputClass}>
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Points</label>
              <input required type="number" name="points" value={formData.points} onChange={handleChange} className={inputClass} min="0" />
            </div>
            <div>
              <label className={labelClass}>Region</label>
              <select required name="region" value={formData.region} onChange={handleChange} className={inputClass}>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{REGION_LABELS[r]}</option>
                ))}
              </select>
            </div>
          </div>

          <label className={labelClass}>Custom Skin <span className="text-[#6b7280] normal-case font-sans tracking-normal">(username or image URL — leave blank for auto)</span></label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                name="customSkinUrl"
                value={formData.customSkinUrl}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Dream  or  https://visage.surgeplay.com/bust/200/Dream"
              />
              <p className="text-[10px] text-[#6b7280] mt-1">
                Enter a Minecraft username to use their skin, or paste a full image URL
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-16 h-16 bg-[#0d0f14] border border-[#2a2f42] rounded overflow-hidden flex items-center justify-center">
                {skinPreviewError ? (
                  <span className="text-[#6b7280] text-xs text-center px-1">No preview</span>
                ) : (
                  <img
                    key={formData.customSkinUrl || formData.username}
                    src={getCustomSkinPreviewUrl(formData.customSkinUrl, formData.username)}
                    alt="Skin preview"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={() => setSkinPreviewError(true)}
                  />
                )}
              </div>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wide">Preview</span>
              {formData.customSkinUrl && (
                <button
                  type="button"
                  onClick={() => { setFormData(p => ({ ...p, customSkinUrl: "" })); setSkinPreviewError(false); }}
                  className="text-[9px] text-red-400 hover:text-red-300 uppercase tracking-wide"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 font-display uppercase tracking-wider text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <EsportsButton type="submit" className="py-2 px-6 text-lg" disabled={isPending}>
              {isPending ? "Saving..." : initialData ? "Update" : "Save"}
            </EsportsButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [updatingSeed, setUpdatingSeed] = useState(false);

  async function handleUpdateSeed() {
    setUpdatingSeed(true);
    try {
      const res = await fetch("/api/admin/backup/update-seed", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Recovery data updated!", description: `${data.players} player entries saved. Future deploys will auto-restore this data.` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdatingSeed(false);
    }
  }

  async function handleDownload(endpoint: string, filename: string, label: string) {
    setDownloading(label);
    try {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: `${label} downloaded!` });
    } catch {
      toast({ title: "Download failed", description: "Make sure you are logged in as admin.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  }

  const ts = () => new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl uppercase tracking-wider text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#7c3aed]" />
          Backup & Recovery
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Download your data so you never lose it again after a redeploy.
        </p>
      </div>

      {/* Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DB JSON */}
        <div className="bg-[#0d0f14] border border-[#2a2f42] rounded-lg p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="font-display uppercase tracking-wider text-sm">Database (JSON)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Full export of all player data across every gamemode — JSON format, easy to re-import.
          </p>
          <button
            onClick={() => handleDownload("/api/admin/backup/db", `neotiers-db-${ts()}.json`, "DB JSON")}
            disabled={downloading === "DB JSON"}
            className="mt-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-display uppercase tracking-wider text-xs py-2 px-4 rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading === "DB JSON" ? "Downloading…" : "Download JSON"}
          </button>
        </div>

        {/* DB SQL */}
        <div className="bg-[#0d0f14] border border-[#2a2f42] rounded-lg p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="font-display uppercase tracking-wider text-sm">Database (SQL)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All player data as SQL INSERT statements — paste directly into any PostgreSQL database.
          </p>
          <button
            onClick={() => handleDownload("/api/admin/backup/sql", `neotiers-db-${ts()}.sql`, "DB SQL")}
            disabled={downloading === "DB SQL"}
            className="mt-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-display uppercase tracking-wider text-xs py-2 px-4 rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading === "DB SQL" ? "Downloading…" : "Download SQL"}
          </button>
        </div>

        {/* .env.example */}
        <div className="bg-[#0d0f14] border border-[#2a2f42] rounded-lg p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-yellow-400" />
            <span className="font-display uppercase tracking-wider text-sm">Env Variables</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Template of all required environment variables. Fill in your values when redeploying.
          </p>
          <button
            onClick={() => handleDownload("/api/admin/backup/env", ".env.example", "Env File")}
            disabled={downloading === "Env File"}
            className="mt-auto flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-display uppercase tracking-wider text-xs py-2 px-4 rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading === "Env File" ? "Downloading…" : "Download .env.example"}
          </button>
        </div>
      </div>

      {/* Shell Script */}
      <div className="bg-[#0d0f14] border border-[#2a2f42] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-5 h-5 text-[#7c3aed]" />
          <span className="font-display uppercase tracking-wider text-sm">Full Project Backup (Shell)</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Run this command in your Replit shell to zip the entire project including all source code:
        </p>
        <pre className="bg-[#050709] border border-[#1a1f2e] rounded p-3 text-xs text-emerald-400 overflow-x-auto select-all">
          bash scripts/backup.sh
        </pre>
        <p className="text-xs text-muted-foreground mt-2">
          This creates <span className="text-white font-mono">neotiers-backup-[date].zip</span> in the project root containing all source code, assets, and a database dump.
        </p>
      </div>

      {/* Deploy Guide */}
      <div className="bg-[#0d0f14] border border-[#2a2f42] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="w-5 h-5 text-[#7c3aed]" />
          <span className="font-display uppercase tracking-wider text-sm">Restore on a New Host</span>
        </div>
        <ol className="space-y-3 text-xs text-muted-foreground list-decimal list-inside">
          <li><span className="text-white">Download the SQL backup</span> using the button above.</li>
          <li><span className="text-white">Create a PostgreSQL database</span> on Render, Railway, Neon, or Supabase (all free tiers available).</li>
          <li><span className="text-white">Run the SQL file</span> against your new database: <code className="text-emerald-400 bg-[#050709] px-1 rounded">psql $DATABASE_URL &lt; neotiers-db.sql</code></li>
          <li><span className="text-white">Fork or clone this Replit project</span>, then set the environment variables from your <code className="text-yellow-400">.env.example</code> file.</li>
          <li><span className="text-white">For Render:</span> Deploy as a Web Service. Set build command: <code className="text-emerald-400 bg-[#050709] px-1 rounded">pnpm install && pnpm run build</code> and start command: <code className="text-emerald-400 bg-[#050709] px-1 rounded">pnpm run start</code>.</li>
          <li><span className="text-white">For Vercel / Netlify:</span> These are best for the frontend only. Deploy the <code className="text-emerald-400 bg-[#050709] px-1 rounded">artifacts/neotiers</code> folder as a static site and host the API server separately on Render.</li>
        </ol>
      </div>

      {/* Auto-Recovery Seed Update */}
      <div className="bg-[#0d0f14] border border-[#7c3aed]/40 rounded-lg p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#7c3aed] flex-shrink-0" />
            <div>
              <p className="font-display uppercase tracking-wider text-sm text-white">Auto-Recovery Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click this <span className="text-white">after adding or editing any players</span>. This saves the current player list so it auto-restores if the database is ever wiped on redeploy.
              </p>
            </div>
          </div>
          <button
            onClick={handleUpdateSeed}
            disabled={updatingSeed}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white font-display uppercase tracking-wider text-xs py-2 px-5 rounded transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            {updatingSeed ? "Saving…" : "Update Recovery Data"}
          </button>
        </div>
      </div>

      {/* Safety Tip */}
      <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 font-display uppercase tracking-wider text-xs mb-1">Best Practice — 2 Steps After Every Edit</p>
          <p className="text-xs text-muted-foreground">
            1. Click <span className="text-white">Update Recovery Data</span> above (protects against DB wipe on redeploy).
            <br />
            2. <span className="text-white">Download SQL</span> to your computer (your personal offline backup).
          </p>
        </div>
      </div>
    </div>
  );
}
