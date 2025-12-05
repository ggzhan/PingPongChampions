
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, KeyRound, Globe, Lock } from "lucide-react";
import { getLeagues } from "@/lib/data";
import { useState, useEffect } from "react";
import type { League } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeagues() {
      const allLeagues = await getLeagues();
      setLeagues(allLeagues);
      setLoading(false);
    }
    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Leagues</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/leagues/join">
                <KeyRound className="mr-2 h-4 w-4" /> Join with Code
              </Link>
            </Button>
            <Button asChild>
              <Link href="/leagues/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create League
              </Link>
            </Button>
          </div>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Leagues</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/leagues/join">
                <KeyRound className="mr-2 h-4 w-4" /> Join with Code
              </Link>
            </Button>
            <Button asChild>
              <Link href="/leagues/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create League
              </Link>
            </Button>
          </div>
      </div>
      
      {leagues.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No leagues found</h2>
          <p className="text-muted-foreground mt-2">Be the first to create one!</p>

          <Button asChild className="mt-4">
            <Link href="/leagues/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create League
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <Card key={league.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline pr-4">{league.name}</CardTitle>
                    <Badge variant="outline" className="capitalize flex gap-1.5 items-center">
                        {league.privacy === 'public' ? <Globe className="h-3 w-3"/> : <Lock className="h-3 w-3"/>}
                        {league.privacy}
                    </Badge>
                </div>
                <CardDescription className="flex-grow min-h-[40px] pt-2">{league.description || 'No description available.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <div className="text-sm text-muted-foreground">
                    {league.players.filter(p => p.status === 'active').length} active players
                 </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/leagues/${league.id}`}>View League</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
