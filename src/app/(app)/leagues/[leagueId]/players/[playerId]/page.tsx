
import { getPlayerStats } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

type PlayerPageProps = {
  params: { leagueId: string, playerId: string };
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { leagueId, playerId } = params;
  const player = await getPlayerStats(leagueId, playerId);

  if (!player) {
    notFound();
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" asChild className="mb-4">
            <Link href={`/leagues/${leagueId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
            </Link>
        </Button>

      <h1 className="text-3xl font-bold font-headline">Player Stats</h1>
      
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-muted-foreground"/>
                </div>
                <div>
                    <CardTitle className="text-2xl">{player.name}</CardTitle>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold font-mono">{player.elo}</div>
            <p className="text-muted-foreground">Current ELO</p>
        </CardContent>
      </Card>
    </div>
  );
}
