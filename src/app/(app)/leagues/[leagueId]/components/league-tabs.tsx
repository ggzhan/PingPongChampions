
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { League, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, PlusCircle, User as UserIcon, Search, Mail, Trophy, Minus, TrendingUp, TrendingDown, Trash2, Shield } from "lucide-react";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from '@/context/user-context';
import { calculateEloChange, deleteMatch } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { useApp } from '@/context/app-context';


export default function LeagueTabs({ league }: { league: League }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();
  const { toast } = useToast();
  const { refresh } = useApp();
  
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
  const currentUserPlayer = user ? activePlayers.find(p => p.id === user.id) : null;

  const handleDeleteMatch = async (matchId: string) => {
    if (!user) return;
    try {
      await deleteMatch(league.id, matchId, user.id);
      toast({
        title: "Match Deleted",
        description: "The match has been removed and stats have been reverted.",
      });
      refresh(); // Re-fetch all data to ensure UI is consistent
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting Match",
        description: error.message,
      });
    }
  };


  return (
    <Tabs defaultValue="rankings" className="w-full">
      <TabsList className="flex w-full h-auto">
        <TabsTrigger value="rankings" className="py-2.5 text-base flex-1 text-muted-foreground data-[state=active]:text-foreground">Rankings</TabsTrigger>
        <TabsTrigger value="matches" className="py-2.5 text-base flex-1 text-muted-foreground data-[state=active]:text-foreground">Matches</TabsTrigger>
      </TabsList>
      <TabsContent value="rankings" className="py-4">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">ELO</TableHead>
                  <TableHead className="text-center w-[80px]">W/L</TableHead>
                  <TableHead className="text-center w-[80px]">Trend</TableHead>
                  <TableHead className="text-center w-[120px]">ELO +/-</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayersByRank.map((player, index) => {
                  const isAdmin = league.adminIds.includes(player.id);
                  let potentialEloChange: { win: number; loss: number; } | null = null;

                  if (currentUserPlayer && player.id !== currentUserPlayer.id) {
                    const selfMatchesPlayed = currentUserPlayer.wins + currentUserPlayer.losses;
                    const eloWin = calculateEloChange(currentUserPlayer.elo, player.elo, selfMatchesPlayed, 'win');
                    const eloLoss = calculateEloChange(currentUserPlayer.elo, player.elo, selfMatchesPlayed, 'loss');
                    potentialEloChange = { win: eloWin, loss: eloLoss };
                  }
                  
                  return (
                     <TableRow key={player.id} className={player.id === currentUserPlayer?.id ? 'bg-muted/50 hover:bg-muted' : ''}>
                        <TableCell className="font-medium text-center">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Link href={`/leagues/${league.id}/players/${player.id}`} className="font-bold hover:underline">
                              {player.name}
                            </Link>
                             {isAdmin && (
                                <TooltipProvider>
                                    <Tooltip>
                                    <TooltipTrigger>
                                        <Shield className="h-4 w-4 text-primary" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>League Administrator</p>
                                    </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
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
                        <TableCell className="text-center font-mono text-xs">
                          {potentialEloChange ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-green-500 font-bold">+{potentialEloChange.win}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-red-500 font-bold">{potentialEloChange.loss}</span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="matches" className="py-4">
          <Card>
              <CardHeader>
                  <CardTitle>Match History</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="hidden sm:table-cell">Date</TableHead>
                              <TableHead>Players</TableHead>
                              <TableHead className="text-center">Result</TableHead>
                              <TableHead className="text-right">ELO Change</TableHead>
                              <TableHead className="w-[50px] text-right"></TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMatches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center text-center p-8">
                                    <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">No Matches Yet</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Record the first match to get the competition started!
                                    </p>
                                </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedMatches.map((match) => {
                            const winnerIsPlayerA = match.winnerId === match.playerAId;
                            const winner = winnerIsPlayerA ? match.playerAName : match.playerBName;
                            const loser = winnerIsPlayerA ? match.playerBName : match.playerAName;
                            const winnerScore = winnerIsPlayerA ? match.playerAScore : match.playerBScore;
                            const loserScore = winnerIsPlayerA ? match.playerBScore : match.playerAScore;
                            const winnerEloChange = winnerIsPlayerA ? match.eloChangeA : match.eloChangeB;
                            const loserEloChange = winnerIsPlayerA ? match.eloChangeB : match.eloChangeA;
                            
                            const isParticipant = user && (user.id === match.playerAId || user.id === match.playerBId);
                            const isRecent = differenceInHours(new Date(), new Date(match.createdAt)) < 12;
                            const canDelete = isParticipant && isRecent;

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
                                    <TableCell className="text-center font-mono font-semibold whitespace-nowrap">
                                      {winnerScore} - {loserScore}
                                    </TableCell>
                                     <TableCell className="text-right font-mono text-xs whitespace-nowrap">
                                       <div>
                                        <span className="font-bold text-green-500">+{winnerEloChange}</span>
                                        <span className="text-muted-foreground"> / </span> 
                                        <span className="font-bold text-red-500">{loserEloChange}</span>
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {canDelete && (
                                         <AlertDialog>
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </AlertDialogTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Delete Match</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  This will permanently delete the match record and revert the ELO and stats changes. This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteMatch(match.id)}>
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                      )}
                                    </TableCell>
                                </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
      </TabsContent>
    </Tabs>
  );
}

    