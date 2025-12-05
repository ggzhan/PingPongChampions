
import { getPlayerStats } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User as UserIcon, ArrowLeft, Trophy, Sword, Shield, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import RefreshButton from "./components/refresh-button";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

type PlayerPageProps = {
  params: { leagueId: string, playerId: string };
};

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { leagueId, playerId } = params;
  const stats = await getPlayerStats(leagueId, playerId);

  if (!stats) {
    return {
      title: "Player Not Found",
    };
  }

  return {
    title: `${stats.player.name} | Player Stats`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { leagueId, playerId } = params;
  const stats = await getPlayerStats(leagueId, playerId);

  if (!stats) {
    notFound();
  }

  const { player, rank, matchHistory } = stats;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold font-headline">Player Stats</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/leagues/${leagueId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to League
                </Link>
            </Button>
            <RefreshButton />
          </div>
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

      <Card>
          <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">ELO Change</TableHead>
                           <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {matchHistory.slice(0, 10).map(match => {
                          const isPlayerA = match.playerAId === playerId;
                          const opponentName = isPlayerA ? match.playerBName : match.playerAName;
                          const didWin = match.winnerId === playerId;
                          const eloChange = isPlayerA ? match.eloChangeA : match.eloChangeB;

                          return (
                              <TableRow key={match.id}>
                                  <TableCell className="font-medium">{opponentName}</TableCell>
                                  <TableCell>
                                      <span className={didWin ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                          {didWin ? 'Win' : 'Loss'}
                                      </span>
                                  </TableCell>
                                  <TableCell>{isPlayerA ? `${match.playerAScore} - ${match.playerBScore}`: `${match.playerBScore} - ${match.playerAScore}`}</TableCell>
                                  <TableCell className={`text-right font-mono ${eloChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {eloChange >= 0 ? `+${eloChange}` : eloChange}
                                  </TableCell>
                                   <TableCell className="text-right text-muted-foreground">
                                      {format(new Date(match.createdAt), "MMM d, yyyy")}
                                  </TableCell>
                              </TableRow>
                          );
                      })}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

    </div>
  );
}
