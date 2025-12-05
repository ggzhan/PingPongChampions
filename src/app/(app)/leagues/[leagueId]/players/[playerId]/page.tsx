import { getPlayerStats } from "@/lib/data";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { format, parseISO } from 'date-fns';
import EloChart from "./components/elo-chart";

type PlayerPageProps = {
  params: { leagueId: string, playerId: string };
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const stats = await getPlayerStats(params.leagueId, params.playerId);

  if (!stats) {
    notFound();
  }

  const { player, rank, eloHistory, matchHistory, headToHead } = stats;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 text-4xl">
            <AvatarImage src={player.avatarUrl} alt={player.name} />
            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{player.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 mt-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{player.elo}</span>
                <span>ELO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">#{rank}</span>
                <span>Rank</span>
              </div>
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
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={h2h.opponentAvatar} />
                                        <AvatarFallback>{h2h.opponentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {h2h.opponentName}
                                </TableCell>
                                <TableCell className="text-right font-mono">{h2h.wins} - {h2h.losses}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

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
                        <TableHead>ELO Change</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {matchHistory.map(match => {
                        const isPlayerA = match.playerAId === player.id;
                        const opponent = isPlayerA ? { name: match.playerBName, avatar: match.playerBAvatar } : { name: match.playerAName, avatar: match.playerAAvatar };
                        const won = match.winnerId === player.id;
                        const score = isPlayerA ? `${match.playerAScore}-${match.playerBScore}` : `${match.playerBScore}-${match.playerAScore}`;
                        const eloChange = isPlayerA ? match.eloChangeA : match.eloChangeB;

                        return (
                             <TableRow key={match.id}>
                                <TableCell className="flex items-center gap-2">
                                     <Avatar className="w-6 h-6">
                                        <AvatarImage src={opponent.avatar} />
                                        <AvatarFallback>{opponent.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
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
        </CardContent>
      </Card>
    </div>
  );
}
