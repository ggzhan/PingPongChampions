import { getLeagueById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus, Share2 } from "lucide-react";
import LeagueTabs from "./components/league-tabs";

type LeaguePageProps = {
  params: { leagueId: string };
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const league = await getLeagueById(params.leagueId);

  if (!league) {
    notFound();
  }

  // Mock admin check
  const isAdmin = league.adminIds.includes('user-1');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div>
              <CardTitle className="text-3xl font-bold font-headline mb-2">{league.name}</CardTitle>
              <CardDescription className="max-w-2xl">{league.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Join League</Button>
              <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
              {isAdmin && (
                <Button variant="secondary"><Settings className="mr-2 h-4 w-4" /> Admin</Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <LeagueTabs league={league} />
    </div>
  );
}
