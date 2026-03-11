import { Switch, Route, Router as WouterRouter, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
import Home from "@/pages/home";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";

const queryClient = new QueryClient();

// Helper component to pass the URL param to the Leaderboard component
function GamemodeRoute() {
  const [match, params] = useRoute("/:gamemode");
  // Ensure we only match known gamemodes otherwise fall through to 404
  const validGamemodes = ["smp", "uhc", "nethpot", "pvp", "bedwars"];
  
  if (match && params && validGamemodes.includes(params.gamemode.toLowerCase())) {
    return <Leaderboard gamemodeFilter={params.gamemode} />;
  }
  return <NotFound />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/player/:id" component={Profile} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* Gamemode Routes - dynamically checks if the param is a valid mode */}
      <Route path="/:gamemode" component={GamemodeRoute} />
      
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
