
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { League, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, PlusCircle, User as UserIcon } from "lucide-react";
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

const PlayerCardLink = ({ leagueId, player }: { leagueId: string, player: Player }) => {
    const hasPlayed = player.wins > 0 || player.losses > 0;
    const content = (
         <div className="flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors hover:bg-accent/10 hover:border-primary/50">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="font-semibold text-center">{player.name}</span>
            <span className="text-sm text-muted-foreground font-mono">{player.elo} ELO</span>
            <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-green-600">{player.wins}W</span>
                <span className="mx-1">/</span>
                <span className="font-semibold text-red-600">{player.losses}L</span>
            </span>
        </div>
    );
    
    if (hasPlayed) {
        return (
            <Link key={player.id} href={`/leagues/${leagueId}/players/${player.id}`}>
                {content}
            </Link>
        );
    }

    return (
        <div key={player.id} className="opacity-70 cursor-not-allowed">
            {content}
        </div>
    );
};


export default function LeagueTabs({ league }: { league: League }) {
  const activePlayers = league.players.filter(p => p.status === 'active');
  const sortedPlayers = [...activePlayers].sort((a, b) => b.elo - a.elo);
  const sortedMatches = [...(league.matches || [])].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const canRecordMatch = activePlayers.length >= 2;

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
                {sortedPlayers.map((player, index) => (
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Match History</CardTitle>
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block"> 
                    <Button asChild disabled={!canRecordMatch} aria-disabled={!canRecordMatch} className={!canRecordMatch ? "pointer-events-none" : ""}>
                      <Link href={`/leagues/${league.id}/matches/record`}>
                          <PlusCircle className="mr-2 h-4 w-4"/>Record Match
                      </Link>
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canRecordMatch && (
                  <TooltipContent>
                    <p>At least 2 active players are needed to record a match.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activePlayers.map(player => (
                    <PlayerCardLink key={player.id} leagueId={league.id} player={player} />
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
