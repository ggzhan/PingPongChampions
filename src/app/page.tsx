
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, KeyRound, Globe, Lock, Search } from "lucide-react";
import { getLeagues } from "@/lib/data";
import { useState, useEffect, useMemo } from "react";
import type { League } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/user-context";

const LeagueCard = ({ league }: { league: League }) => (
  <Card key={league.id} className="flex flex-col hover:shadow-lg transition-shadow">
    <CardHeader>
        <CardTitle className="font-headline pr-4">{league.name}</CardTitle>
      <CardDescription className="flex-grow min-h-[40px] pt-2">{league.description || 'No description available.'}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
       <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{league.activePlayerCount} active players</span>
          <Badge variant="outline" className="capitalize flex gap-1.5 items-center shrink-0">
              {league.privacy === 'public' ? <Globe className="h-3 w-3"/> : <Lock className="h-3 w-3"/>}
              {league.privacy}
          </Badge>
       </div>
    </CardContent>
    <CardFooter>
      <Button asChild className="w-full">
        <Link href={`/leagues/${league.id}`}>View League</Link>
      </Button>
    </CardFooter>
  </Card>
);

const LeagueGrid = ({ leagues }: { leagues: League[] }) => {
    if (leagues.length === 0) {
        return null;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => <LeagueCard key={league.id} league={league} />)}
        </div>
    );
};


export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();

  useEffect(() => {
    async function fetchLeagues() {
      const allLeagues = await getLeagues();
      // Sort leagues alphabetically by name
      allLeagues.sort((a, b) => a.name.localeCompare(b.name));
      setLeagues(allLeagues);
      setLoading(false);
    }
    fetchLeagues();
  }, []);
  
  const { myLeagues, otherLeagues } = useMemo(() => {
    const filtered = leagues.filter(league => 
      league.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (!user) {
        return { myLeagues: [], otherLeagues: filtered };
    }

    const myLeagues = filtered.filter(league => 
        league.players.some(p => p.id === user.id && p.status === 'active')
    );
    const otherLeagues = filtered.filter(league => 
        !league.players.some(p => p.id === user.id && p.status === 'active')
    );

    return { myLeagues, otherLeagues };
  }, [leagues, user, searchTerm]);


  if (loading) {
    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Leagues</h1>
          </div>
           <div className="w-full md:w-64 h-10 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full mt-2 animate-pulse"></div>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Leagues</h1>
          <p className="text-muted-foreground">Compete with friends in your own ping pong league.</p>
        </div>
        <div className="flex w-full md:w-auto md:justify-end gap-2">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search leagues..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/leagues/create">
                <PlusCircle className="mr-2 h-4 w-4" /> 
                <span className="hidden sm:inline">Create League</span>
              </Link>
            </Button>
          </div>
      </div>
      
      {leagues.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No leagues found</h2>
          <p className="text-muted-foreground mt-2">Be the first to create one!</p>

          <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/leagues/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create League
            </Link>
          </Button>
        </div>
      ) : myLeagues.length === 0 && otherLeagues.length === 0 ? (
         <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No leagues match your search</h2>
          <p className="text-muted-foreground mt-2">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {myLeagues.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold font-headline">My Leagues</h2>
                    <LeagueGrid leagues={myLeagues} />
                </div>
            )}
            
            {otherLeagues.length > 0 && (
                 <div className="space-y-4">
                    <h2 className="text-2xl font-semibold font-headline">Discover Leagues</h2>
                    <LeagueGrid leagues={otherLeagues} />
                </div>
            )}
        </div>
      )}
    </div>
  );
}
