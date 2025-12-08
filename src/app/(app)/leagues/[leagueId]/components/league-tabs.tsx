
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { League, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, PlusCircle, User as UserIcon, Search, Mail, Trophy, Minus } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const PlayerLink = ({ leagueId, player }: { leagueId: string, player: Player }) => {
  return (
    <div className="flex items-center gap-3">
        <Link href={`/leagues/${leagueId}/players/${player.id}`} className="font-bold hover:underline">
          {player.name}
        </Link>
        {player.showEmail && player.email && (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <a href={`mailto:${player.email}`} className="text-muted-foreground hover:text-primary">
                        <Mail className="h-4 w-4" />
                    </a>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{player.email}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        )}
    </div>
  );
};


export default function LeagueTabs({ league }: { league: League }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const activePlayers = league.players.filter(p => p.status === 'active');
  const sortedMatches = [...(league.matches || [])].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const playersWithTrend = activePlayers.map(player => {
      const lastMatch = sortedMatches.find(m => m.playerAId === player.id || m.playerBId === player.id);
      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (lastMatch) {
          trend = lastMatch.winnerId === player.id ? 'up' : 'down';
      }
      return { ...player, trend };
  });

  const sortedPlayersByRank = [...playersWithTrend].sort((a, b) => b.elo - a.elo);

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
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">ELO</TableHead>
                  <TableHead className="text-center w-[80px]">W/L</TableHead>
                  <TableHead className="text-center w-[80px]">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayersByRank.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell>
                      <PlayerLink leagueId={league.id} player={player} />
                    </TableCell>
                    <TableCell className="text-right font-mono">{player.elo}</TableCell>
                    <TableCell className="text-center">
                        <span className="text-green-500 font-semibold">{player.wins}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-red-500 font-semibold">{player.losses}</span>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex justify-center">
                            {player.trend === 'up' && <ArrowUp className="h-5 w-5 text-green-500" />}
                            {player.trend === 'down' && <ArrowDown className="h-5 w-5 text-red-500" />}
                            {player.trend === 'neutral' && <Minus className="h-5 w-5 text-muted-foreground" />}
                        </div>
                    </TableCell>
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
