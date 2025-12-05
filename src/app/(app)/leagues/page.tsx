import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, Swords } from "lucide-react";
import { getLeagues } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function LeaguesPage() {
  const leagues = await getLeagues();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Leagues</h1>
        <Button asChild>
          <Link href="/leagues/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create League
          </Link>
        </Button>
      </div>
      
      {leagues.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No leagues found</h2>
          <p className="text-muted-foreground mt-2">Be the first to create one!</p>
          <Button asChild className="mt-4">
            <Link href="/leagues/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create League
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <Card key={league.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="font-headline">{league.name}</CardTitle>
                <CardDescription>{league.description || 'No description available.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <div className="flex items-center">
                    <Users className="mr-1.5 h-4 w-4" />
                    <span>{league.players.length} Players</span>
                  </div>
                  <div className="flex items-center">
                    <Swords className="mr-1.5 h-4 w-4" />
                    <span>{league.matches.length} Matches</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/leagues/${league.id}`}>View League</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
