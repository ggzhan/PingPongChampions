

import { getPlayerStats } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, User as UserIcon } from "lucide-react";
import { format, parseISO } from 'date-fns';
import EloChart from "./components/elo-chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type PlayerPageProps = {
  params: { leagueId: string, playerId: string };
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { leagueId, playerId } = params;
  const stats = await getPlayerStats(leagueId, playerId);

  if (!stats) {
    notFound();
  }

  const { player, rank, eloHistory, matchHistory, headToHead } = stats;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
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
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>ELO History</CardTitle>
            </CardHeader>
            <CardContent>
                <EloChart data={eloHistory} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Head-to-Head</CardTitle>
            </CardHeader>
            <CardContent>
                {Object.keys(headToHead).length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No head-to-head data yet.
                  </div>
                ) : (
                  <ScrollArea className="h-[250px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Opponent</TableHead>
                                <TableHead className="text-right">Record</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.values(headToHead).map(h2h => (
                                 <TableRow key={h2h.opponentName}>
                                    <TableCell className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                            <UserIcon className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                        {h2h.opponentName}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{h2h.wins} - {h2h.losses}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </ScrollArea>
                )}
            </CardContent>
        </Card>
      </div>

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
