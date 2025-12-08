
"use client";

import { getPlayerStats } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User as UserIcon, ArrowLeft, TrendingUp, ChevronsRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Metadata } from "next";
import EloChart from "./components/elo-chart";
import { useEffect, useState } from "react";
import type { PlayerStats } from "@/lib/types";

export default function PlayerPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const playerId = params.playerId as string;
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!leagueId || !playerId) return;
      const statsData = await getPlayerStats(leagueId, playerId);
      if (statsData) {
        setStats(statsData);
      }
      setLoading(false);
    }
    fetchStats();
  }, [leagueId, playerId]);


  if (loading) {
    return <div>Loading player stats...</div>;
  }

  if (!stats) {
    notFound();
  }

  const { player, rank, matchHistory, eloHistory, headToHeadStats } = stats;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold font-headline">Player Stats</h1>
          <Button variant="outline" asChild>
              <Link href={`/leagues/${leagueId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to League
              </Link>
          </Button>
       </div>
        
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-muted-foreground"/>
                </div>
                <div>
                    <CardTitle className="text-2xl">{player.name}</CardTitle>
                    <CardDescription>Rank #{rank} in this league</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                 <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold font-mono">{player.elo}</div>
                    <p className="text-sm text-muted-foreground">Current ELO</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold font-mono flex items-center justify-center gap-2">
                        <span className="text-green-500">{player.wins}</span>
                        <span>-</span>
                         <span className="text-red-500">{player.losses}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Win/Loss Record</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold font-mono">{matchHistory.length}</div>
                    <p className="text-sm text-muted-foreground">Matches Played</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5"/>
                ELO History
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <EloChart data={eloHistory} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ChevronsRight className="h-5 w-5"/>
                  Head-to-Head
                </CardTitle>
              </CardHeader>
              <CardContent>
                {headToHeadStats.length > 0 ? (
                  <div className="space-y-4">
                    {headToHeadStats.map(stat => (
                      <div key={stat.opponentId} className="flex items-center justify-between">
                        <span className="font-medium">{stat.opponentName}</span>
                        <span className="font-mono text-sm">
                          {stat.wins}-{stat.losses}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No head-to-head data yet.</p>
                )}
              </CardContent>
            </Card>
        </div>
      </div>


      <Card>
          <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="hidden sm:table-cell">Date</TableHead>
                          <TableHead>Matchup</TableHead>
                          <TableHead className="text-center">Result</TableHead>
                          <TableHead className="text-right">ELO Change</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {matchHistory.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No matches recorded yet for this player.
                            </TableCell>
                        </TableRow>
                      ) : (
                        matchHistory.slice(0, 10).map(match => {
                            const isPlayerA = match.playerAId === playerId;
                            const didWin = match.winnerId === playerId;
                            const opponentName = isPlayerA ? match.playerBName : match.playerAName;
                            const winnerScore = didWin ? (isPlayerA ? match.playerAScore : match.playerBScore) : (isPlayerA ? match.playerBScore : match.playerAScore);
                            const loserScore = didWin ? (isPlayerA ? match.playerBScore : match.playerAScore) : (isPlayerA ? match.playerAScore : match.playerBScore);
                            const eloChange = isPlayerA ? match.eloChangeA : match.eloChangeB;

                          return (
                              <TableRow key={match.id} className={didWin ? '' : 'text-muted-foreground'}>
                                  <TableCell className="hidden sm:table-cell">{format(new Date(match.createdAt), "MMM d, yyyy")}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Trophy className={`w-4 h-4 ${didWin ? 'text-amber-500' : 'text-transparent'}`}/>
                                        <div>
                                            <span className={`font-semibold ${didWin ? 'text-foreground' : ''}`}>{didWin ? "Win" : "Loss"}</span>
                                            <span className="text-xs"> vs {opponentName}</span>
                                        </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center font-mono">
                                    <span className={`font-semibold ${didWin ? 'text-foreground' : ''}`}>{winnerScore} - {loserScore}</span>
                                  </TableCell>
                                   <TableCell className="text-right font-mono text-xs">
                                     <span className={eloChange > 0 ? 'font-bold text-green-500' : 'font-bold text-red-500'}>
                                        {eloChange > 0 ? `+${eloChange}`: eloChange}
                                     </span>
                                  </TableCell>
                              </TableRow>
                          );
                      }))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

    </div>
  );
}
