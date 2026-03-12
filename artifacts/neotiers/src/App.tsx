import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Stats from "@/pages/stats";

export const ALL_GAMEMODES = ["overall", "uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword"] as const;
export const RANKED_GAMEMODES = ["uhc", "nethpot", "smp", "axe", "mace", "spear", "lifesteal", "crystal", "sword"] as const;
export type GamemodeSlug = typeof ALL_GAMEMODES[number];

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/stats" component={Stats} />
      {/* Profile by username */}
      <Route path="/player/:username" component={Profile} />
      {/* Overall leaderboard at /leaderboard */}
      <Route path="/leaderboard">{() => <Leaderboard gamemode="overall" />}</Route>
      {/* Per-gamemode routes */}
      {ALL_GAMEMODES.map((gm) => (
        <Route key={gm} path={`/${gm}`}>{() => <Leaderboard gamemode={gm} />}</Route>
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
