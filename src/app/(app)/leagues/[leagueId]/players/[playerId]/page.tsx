
import { getPlayerStats } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, User as UserIcon, ArrowLeft } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import type { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
       <Button variant="outline" asChild className="mb-4">
            <Link href={`/leagues/${leagueId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
            </Link>
        </Button>
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-muted-foreground"/>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <h1 className="text-3xl font-bold font-headline">{player.name}</h1>
                        {player.status === 'inactive' && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 mt-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{player.elo}</span>
                        <span>ELO</span>
                    </div>
                    {rank > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">#{rank}</span>
                            <span>Rank</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-green-600">{player.wins}W</span>
                        <span>-</span>
                        <span className="font-semibold text-foreground text-red-600">{player.losses}L</span>
                    </div>
                    </div>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
            {matchHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No matches recorded yet.</p>
              </div>
            ) : (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>ELO Change</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {matchHistory.map(match => {
                          const isPlayerA = match.playerAId === player.id;
                          const opponent = isPlayerA ? { name: match.playerBName } : { name: match.playerAName };
                          const won = match.winnerId === player.id;
                          const score = isPlayerA ? `${match.playerAScore}-${match.playerBScore}` : `${match.playerBScore}-${match.playerAScore}`;
                          const eloChange = isPlayerA ? match.eloChangeA : match.eloChangeB;

                          return (
                               <TableRow key={match.id}>
                                  <TableCell className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                          <UserIcon className="w-3 h-3 text-muted-foreground" />
                                      </div>
                                      {opponent.name}
                                  </TableCell>
                                  <TableCell>{won ? <span className="text-green-600 font-semibold">Win</span> : <span className="text-red-600 font-semibold">Loss</span>}</TableCell>
                                  <TableCell className="font-mono">{score}</TableCell>
                                  <TableCell className={`flex items-center font-semibold ${eloChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {eloChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1"/> : <ArrowDown className="w-4 h-4 mr-1"/>}
                                      {Math.abs(eloChange)}
                                  </TableCell>
                                  <TableCell className="text-right text-muted-foreground">{format(parseISO(match.createdAt), 'MMM d, yyyy')}</TableCell>
                              </TableRow>
                          );
                      })}
                  </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
