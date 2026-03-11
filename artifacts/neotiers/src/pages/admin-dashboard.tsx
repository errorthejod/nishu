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
  useDeleteGamemode
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Edit, Trash2, Settings, Users, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sub-components to keep the file manageable
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'players' | 'gamemodes' | 'settings'>('players');

  // Auth check
  const { data: auth, isLoading: isAuthLoading, isError: isAuthError } = useAdminMe({
    query: { retry: false }
  });

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        toast({ title: "Logged out successfully" });
        setLocation("/admin");
      }
    }
  });

  useEffect(() => {
    if (isAuthError || (auth && !auth.isAdmin)) {
      setLocation("/admin");
    }
  }, [auth, isAuthError, setLocation]);

  if (isAuthLoading) return <Layout><LoadingSpinner /></Layout>;
  if (!auth?.isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
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
          {[
            { id: 'players', icon: Users, label: "Player Database" },
            { id: 'gamemodes', icon: Gamepad2, label: "Gamemodes" },
            { id: 'settings', icon: Settings, label: "Site Config" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center px-6 py-4 font-display text-xl tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'}
              `}
            >
              <tab.icon className="w-5 h-5 mr-3" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border p-6 esports-clip-sm min-h-[500px]">
          {activeTab === 'players' && <PlayersTab />}
          {activeTab === 'gamemodes' && <GamemodesTab />}
          {activeTab === 'settings' && <div className="text-center py-20 text-muted-foreground font-display text-2xl uppercase">Settings Module Offline - Check API Specs</div>}
        </div>
      </div>
    </Layout>
  );
}

// --- Players Tab ---
function PlayersTab() {
  const { data: players, isLoading } = useListPlayers();
  const deleteMutation = useDeletePlayer({
    mutation: {
      onSuccess: () => {
        useQueryClient().invalidateQueries({ queryKey: ['/api/players'] });
        useToast().toast({ title: "Player deleted" });
      }
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  const openAdd = () => { setEditingPlayer(null); setIsFormOpen(true); };
  const openEdit = (p: any) => { setEditingPlayer(p); setIsFormOpen(true); };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display uppercase tracking-widest">Registered Entities</h2>
        <EsportsButton onClick={openAdd} className="py-2 px-4 text-base"><Plus className="w-4 h-4 mr-2"/> Add Player</EsportsButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="p-4 font-display text-lg uppercase text-muted-foreground">ID</th>
              <th className="p-4 font-display text-lg uppercase text-muted-foreground">Username</th>
              <th className="p-4 font-display text-lg uppercase text-muted-foreground">Mode</th>
              <th className="p-4 font-display text-lg uppercase text-muted-foreground">Tier</th>
              <th className="p-4 font-display text-lg uppercase text-muted-foreground">Points</th>
              <th className="p-4 font-display text-lg uppercase text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players?.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-4 text-muted-foreground">#{p.id}</td>
                <td className="p-4 font-bold">{p.username}</td>
                <td className="p-4 capitalize">{p.gamemode}</td>
                <td className="p-4"><TierBadge tier={p.tier} /></td>
                <td className="p-4 font-display text-xl">{p.points}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(p)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded mr-2"><Edit className="w-5 h-5"/></button>
                  <button 
                    onClick={() => { if(confirm('Delete player?')) deleteMutation.mutate({ id: p.id }) }} 
                    className="p-2 text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-5 h-5"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PlayerFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={editingPlayer} 
      />
    </div>
  );
}

// --- Gamemodes Tab ---
function GamemodesTab() {
  const { data: gamemodes, isLoading } = useListGamemodes();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateGamemode({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/gamemodes'] });
        toast({ title: "Gamemode Created" });
      }
    }
  });

  const deleteMutation = useDeleteGamemode({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/gamemodes'] });
        toast({ title: "Gamemode Deleted" });
      }
    }
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        name: fd.get('name') as string,
        slug: fd.get('slug') as string,
        defaultWeapon: fd.get('defaultWeapon') as string,
        description: fd.get('description') as string,
      }
    });
    e.currentTarget.reset();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-display uppercase tracking-widest mb-6">Active Modes</h2>
        <div className="space-y-4">
          {gamemodes?.map(g => (
            <div key={g.id} className="bg-background border border-border p-4 esports-clip-sm flex justify-between items-center">
              <div>
                <h3 className="font-display text-xl">{g.name} <span className="text-muted-foreground text-sm">({g.slug})</span></h3>
                <p className="text-sm text-muted-foreground">Default: {g.defaultWeapon}</p>
              </div>
              <button 
                onClick={() => { if(confirm('Delete gamemode?')) deleteMutation.mutate({ id: g.id }) }}
                className="text-destructive hover:text-red-400 p-2"
              >
                <Trash2 className="w-5 h-5"/>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border p-6 esports-clip-sm h-fit">
        <h2 className="text-2xl font-display uppercase tracking-widest mb-6">Register Mode</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Name</label><input name="name" required className="w-full bg-card border border-border p-2 focus:border-primary outline-none" placeholder="e.g. BedWars" /></div>
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Slug</label><input name="slug" required className="w-full bg-card border border-border p-2 focus:border-primary outline-none" placeholder="e.g. bedwars" /></div>
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Default Weapon</label><input name="defaultWeapon" required className="w-full bg-card border border-border p-2 focus:border-primary outline-none" placeholder="e.g. Sword" /></div>
          <div><label className="text-xs uppercase text-muted-foreground block mb-1">Description</label><textarea name="description" className="w-full bg-card border border-border p-2 focus:border-primary outline-none min-h-[80px]" /></div>
          <EsportsButton type="submit" className="w-full py-2 text-base mt-4" disabled={createMutation.isPending}>Submit</EsportsButton>
        </form>
      </div>
    </div>
  );
}

// --- Player Form Dialog ---
function PlayerFormDialog({ isOpen, onClose, initialData }: any) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: gamemodes } = useListGamemodes();

  const [formData, setFormData] = useState({
    username: "", gamemode: "", tier: "LT1", points: 0, weapon: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username, gamemode: initialData.gamemode,
        tier: initialData.tier, points: initialData.points, weapon: initialData.weapon
      });
    } else {
      setFormData({ username: "", gamemode: gamemodes?.[0]?.slug || "", tier: "C", points: 0, weapon: "Sword" });
    }
  }, [initialData, isOpen, gamemodes]);

  const createMutation = useCreatePlayer({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/players'] }); toast({ title: "Player Added" }); onClose(); } }
  });
  const updateMutation = useUpdatePlayer({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/players'] }); toast({ title: "Player Updated" }); onClose(); } }
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
            {initialData ? 'Edit Entity' : 'Register Entity'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <label className={labelClass}>Username</label>
          <input required name="username" value={formData.username} onChange={handleChange} className={inputClass} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gamemode</label>
              <select required name="gamemode" value={formData.gamemode} onChange={handleChange} className={inputClass}>
                <option value="">Select Mode...</option>
                {gamemodes?.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tier</label>
              <select required name="tier" value={formData.tier} onChange={handleChange} className={inputClass}>
                {['HT1','HT2','HT3','HT4','HT5','LT1','LT2','LT3','LT4','LT5'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Points</label>
              <input required type="number" name="points" value={formData.points} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weapon</label>
              <input required name="weapon" value={formData.weapon} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 font-display uppercase tracking-wider text-muted-foreground hover:text-foreground">Cancel</button>
            <EsportsButton type="submit" className="py-2 px-6 text-lg" disabled={createMutation.isPending || updateMutation.isPending}>
              {initialData ? 'Update' : 'Save'}
            </EsportsButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
