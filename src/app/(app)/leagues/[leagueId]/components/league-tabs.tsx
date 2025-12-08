
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { League, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, PlusCircle, User as UserIcon, Search, Mail, Trophy } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const PlayerLink = ({ leagueId, player }: { leagueId: string, player: Player }) => {
  const hasPlayed = player.wins > 0 || player.losses > 0;
  const content = (
    <div className="flex items-center gap-3">
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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="rankings">Rankings</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
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
          <CardContent>
             {sortedMatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No matches recorded yet.
                </div>
            ) : (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-1/4">Date</TableHead>
                          <TableHead>Players</TableHead>
                          <TableHead className="text-right w-1/4">Result</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMatches.map((match) => {
                      const winner = match.winnerId === match.playerAId ? match.playerAName : match.playerBName;
                      const loser = match.winnerId === match.playerAId ? match.playerBName : match.playerAName;
                      const winnerScore = match.winnerId === match.playerAId ? match.playerAScore : match.playerBScore;
                      const loserScore = match.winnerId === match.playerAId ? match.playerBScore : match.playerAScore;

                      return (
                          <TableRow key={match.id}>
                              <TableCell className="text-muted-foreground hidden sm:table-cell">{format(new Date(match.createdAt), "MMM d, yyyy")}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-amber-500"/>
                                  <span className="font-semibold">{winner}</span>
                                  <span className="text-muted-foreground">vs</span>
                                  <span>{loser}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {winnerScore} - {loserScore}
                              </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
