
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { League, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, PlusCircle, User as UserIcon, Search, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const PlayerLink = ({ leagueId, player }: { leagueId: string, player: Player }) => {
  const hasPlayed = player.wins > 0 || player.losses > 0;
  const content = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <UserIcon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="font-medium">{player.name}</span>
    </div>
  );

  if (hasPlayed) {
    return (
      <Link href={`/leagues/${leagueId}/players/${player.id}`} className="hover:underline">
        {content}
      </Link>
    );
  }

  return content;
};


export default function LeagueTabs({ league }: { league: League }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const activePlayers = league.players.filter(p => p.status === 'active');

  const playersWithMatchCount = activePlayers.map(player => ({
      ...player,
      matchesPlayed: (league.matches || []).filter(m => m.playerAId === player.id || m.playerBId === player.id).length
  }));

  const sortedPlayersByRank = [...activePlayers].sort((a, b) => b.elo - a.elo);
  const sortedPlayersByMatches = [...playersWithMatchCount].sort((a,b) => b.matchesPlayed - a.matchesPlayed);

  const filteredPlayers = sortedPlayersByMatches.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMatches = [...(league.matches || [])].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Tabs defaultValue="rankings" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="rankings">Rankings</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
        <TabsTrigger value="players">Players</TabsTrigger>
      </TabsList>
      <TabsContent value="rankings">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">ELO</TableHead>
                  <TableHead className="text-right">W/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayersByRank.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <PlayerLink leagueId={league.id} player={player} />
                    </TableCell>
                    <TableCell className="text-right font-mono">{player.elo}</TableCell>
                    <TableCell className="text-right">{player.wins}/{player.losses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="matches">
        <Card>
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {sortedMatches.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No matches recorded yet.
                </div>
            )}
             {sortedMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{match.playerAName}</span>
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                                {match.eloChangeA >= 0 ? <ArrowUp className="w-3 h-3 text-green-500"/> : <ArrowDown className="w-3 h-3 text-red-500"/>}
                                {Math.abs(match.eloChangeA)} ELO
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">{match.playerAScore} - {match.playerBScore}</div>
                            <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}</div>
                        </div>
                        <div className="flex flex-col items-start">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <span className="font-semibold">{match.playerBName}</span>
                            </div>
                             <div className="text-xs text-muted-foreground flex items-center">
                                {match.eloChangeB >= 0 ? <ArrowUp className="w-3 h-3 text-green-500"/> : <ArrowDown className="w-3 h-3 text-red-500"/>}
                                {Math.abs(match.eloChangeB)} ELO
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="players">
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>
                A list of all active players in this league, sorted by matches played.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search players..."
                        className="pl-8 w-full md:w-1/2 lg:w-1/3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Matches Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <PlayerLink leagueId={league.id} player={player} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {player.showEmail ? (
                             <a href={`mailto:${player.email}`} className="flex items-center gap-2 hover:underline">
                                <Mail className="h-4 w-4"/>
                                {player.email}
                             </a>
                        ) : (
                            <span className="italic">Not shared</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right font-mono">{player.matchesPlayed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPlayers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No players found matching your search.
                </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
