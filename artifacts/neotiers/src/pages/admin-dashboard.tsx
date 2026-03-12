import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { EsportsButton, LoadingSpinner, TierBadge } from "@/components/ui-elements";
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
import { LogOut, Plus, Edit, Trash2, Settings, Users, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const VALID_GAMEMODES = ["uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal"] as const;
const GAMEMODE_LABELS: Record<string, string> = {
  uhc: "UHC", nethpot: "NethPot", smp: "SMP",
  axe: "Axe", mace: "Mace", spear: "Spear",
  lifesteal: "Lifesteal", crystal: "Crystal",
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
          {activeTab === "settings" && (
            <div className="text-center py-20 text-muted-foreground font-display text-2xl uppercase">
              Settings Module — Coming Soon
            </div>
          )}
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
        queryClient.invalidateQueries({ queryKey: ["players", selectedGamemode] });
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
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors
                ${selectedGamemode === gm
                  ? "bg-primary text-black font-bold"
                  : "bg-[#1e2130] text-[#9ca3af] hover:text-white border border-[#2a2f42]"
                }`}
            >
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
                {["ID", "Skin", "Username", "Tier", "Points", "Weapon", "Rank", "Actions"].map(h => (
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
                      src={`https://visage.surgeplay.com/face/32/${p.username}`}
                      alt={p.username}
                      className="w-8 h-8 rounded"
                      onError={(e) => { e.currentTarget.src = `https://mc-heads.net/avatar/${p.username}/32`; }}
                    />
                  </td>
                  <td className="p-3 font-bold">{p.username}</td>
                  <td className="p-3"><TierBadge tier={p.tier} /></td>
                  <td className="p-3 font-display text-lg">{p.points.toLocaleString()}</td>
                  <td className="p-3 text-sm text-[#9ca3af]">{p.weapon}</td>
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
          queryClient.invalidateQueries({ queryKey: ["players", selectedGamemode] });
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
              <div>
                <h3 className="font-display text-xl">{g.name} <span className="text-muted-foreground text-sm">({g.slug})</span></h3>
                <p className="text-sm text-muted-foreground">Default weapon: {g.defaultWeapon}</p>
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

function PlayerFormDialog({ isOpen, onClose, initialData, defaultGamemode, onSuccess }: any) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    gamemode: defaultGamemode || "uhc",
    tier: "LT5",
    points: 0,
    weapon: "Sword",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        gamemode: initialData.gamemode || defaultGamemode,
        tier: initialData.tier,
        points: initialData.points,
        weapon: initialData.weapon,
      });
    } else {
      setFormData({ username: "", gamemode: defaultGamemode || "uhc", tier: "LT5", points: 0, weapon: "Sword" });
    }
  }, [initialData, isOpen, defaultGamemode]);

  const createMutation = useCreatePlayer({
    mutation: { onSuccess: () => { toast({ title: "Player Added" }); onSuccess?.(); } }
  });
  const updateMutation = useUpdatePlayer({
    mutation: { onSuccess: () => { toast({ title: "Player Updated" }); onSuccess?.(); } }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, points: Number(formData.points) };
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const handleChange = (e: any) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const inputClass = "w-full bg-background border border-border px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none esports-clip-sm";
  const labelClass = "block text-xs font-display uppercase tracking-widest text-muted-foreground mb-1 mt-4";

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
              <label className={labelClass}>Weapon</label>
              <input required name="weapon" value={formData.weapon} onChange={handleChange} className={inputClass} placeholder="e.g. Sword" />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 font-display uppercase tracking-wider text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <EsportsButton type="submit" className="py-2 px-6 text-lg" disabled={createMutation.isPending || updateMutation.isPending}>
              {initialData ? "Update" : "Save"}
            </EsportsButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
