import { Layout } from "@/components/layout";
import { PlayerRow } from "@/components/player-row";
import { LoadingSpinner } from "@/components/ui-elements";
import { useListPlayers } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Search, Swords } from "lucide-react";
import { useState } from "react";
import { ListPlayersSortBy } from "@workspace/api-client-react";

export default function Leaderboard({ gamemodeFilter }: { gamemodeFilter?: string }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ListPlayersSortBy>(ListPlayersSortBy.rank);
  
  // Dynamic page title based on route param (passed from App.tsx)
  const title = gamemodeFilter ? `${gamemodeFilter.toUpperCase()} Rankings` : "Global Rankings";

  const { data: players, isLoading, error } = useListPlayers({
    gamemode: gamemodeFilter,
    search: search || undefined,
    sortBy: sortBy,
    limit: 100
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl md:text-7xl font-display text-foreground uppercase text-glow">{title}</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {gamemodeFilter ? `Top players in the ${gamemodeFilter} gamemode.` : "The definitive top 100 players across all gamemodes."}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search player..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card border border-border pl-10 pr-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 font-sans esports-clip-sm"
              />
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ListPlayersSortBy)}
              className="bg-card border border-border px-4 py-2 text-foreground focus:outline-none focus:border-primary font-display text-xl uppercase tracking-wider cursor-pointer esports-clip-sm"
            >
              <option value="rank">Sort: Rank</option>
              <option value="points">Sort: Points</option>
              <option value="tier">Sort: Tier</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-background border border-border/50 p-2 md:p-6 esports-clip-sm">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-20 text-destructive font-display text-2xl uppercase">
              Failed to load rankings. Please try again.
            </div>
          ) : players && players.length > 0 ? (
            <div className="flex flex-col">
              {players.map((player, index) => (
                <PlayerRow key={player.id} player={player} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 flex flex-col items-center opacity-50">
              <Swords className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-display text-3xl text-foreground uppercase">No Players Found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
