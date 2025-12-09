
"use client";

import { getPlayerStats, deleteMatch } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User as UserIcon, ArrowLeft, TrendingUp, ChevronsRight, Trophy, Trash2, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, differenceInHours } from "date-fns";
import EloChart from "./components/elo-chart";
import { useEffect, useState, useCallback } from "react";
import type { PlayerStats } from "@/lib/types";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/app-context";
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


export default function PlayerPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const playerId = params.playerId as string;
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const { refresh } = useApp();

  const fetchStats = useCallback(async () => {
    if (!leagueId || !playerId) return;
    setLoading(true);
    try {
      const statsData = await getPlayerStats(leagueId, playerId);
      if (statsData) {
        setStats(statsData);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error("Failed to fetch player stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [leagueId, playerId]);
  
  useEffect(() => {
      if (!userLoading) {
          fetchStats();
      }
  }, [fetchStats, userLoading, refresh]);


  const handleDeleteMatch = async (matchId: string) => {
    if (!user) return;
    try {
      await deleteMatch(leagueId, matchId, user.id);
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

  if (loading || userLoading) {
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
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">{player.name}</CardTitle>
                      {player.showEmail && player.email && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a href={`mailto:${player.email}`} className="text-muted-foreground hover:text-primary">
                                  <Mail className="h-5 w-5" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{player.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
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
                          <TableHead>Opponent</TableHead>
                          <TableHead className="text-center">Result</TableHead>
                           <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-right">ELO Change</TableHead>
                          <TableHead className="w-[50px] text-right"></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {matchHistory.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No matches recorded yet for this player.
                            </TableCell>
                        </TableRow>
                      ) : (
                        matchHistory.slice(0, 10).map(match => {
                            const isPlayerA = match.playerAId === playerId;
                            const didWin = match.winnerId === playerId;
                            const opponentName = isPlayerA ? match.playerBName : match.playerAName;
                            const opponentId = isPlayerA ? match.playerBId : match.playerAId;
                            
                            const playerScore = didWin ? Math.max(match.playerAScore, match.playerBScore) : Math.min(match.playerAScore, match.playerBScore);
                            const opponentScore = didWin ? Math.min(match.playerAScore, match.playerBScore) : Math.max(match.playerAScore, match.playerBScore);

                            const eloChange = isPlayerA ? match.eloChangeA : match.eloChangeB;

                            const isParticipant = user && (user.id === match.playerAId || user.id === match.playerBId);
                            const isRecent = differenceInHours(new Date(), new Date(match.createdAt)) < 12;
                            const canDelete = isParticipant && isRecent;

                          return (
                              <TableRow key={match.id}>
                                  <TableCell className="hidden sm:table-cell text-muted-foreground">{format(new Date(match.createdAt), "MMM d, yyyy")}</TableCell>
                                  <TableCell>
                                      <Link href={`/leagues/${leagueId}/players/${opponentId}`} className="hover:underline">
                                        {opponentName}
                                      </Link>
                                  </TableCell>
                                  <TableCell className={`text-center font-semibold ${didWin ? 'text-green-500' : 'text-red-500'}`}>
                                    {didWin ? "Win" : "Loss"}
                                  </TableCell>
                                  <TableCell className="text-center font-mono whitespace-nowrap">
                                    {playerScore} - {opponentScore}
                                  </TableCell>
                                   <TableCell className="text-right font-mono text-xs whitespace-nowrap">
                                     <span className={eloChange >= 0 ? 'font-bold text-green-500' : 'font-bold text-red-500'}>
                                        {eloChange >= 0 ? `+${eloChange}`: eloChange}
                                     </span>
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
                      }))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

    </div>
  );
}

    