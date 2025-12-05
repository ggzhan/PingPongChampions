
"use client";

import { getLeagueById, addUserToLeague } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus, Share2 } from "lucide-react";
import LeagueTabs from "./components/league-tabs";
import { useUser } from "@/context/user-context";
import { useState, useEffect } from "react";
import type { League } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type LeaguePageProps = {
  params: { leagueId: string };
};

export default function LeaguePage({ params }: LeaguePageProps) {
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const leagueId = params.leagueId;
    async function fetchLeague() {
      const leagueData = await getLeagueById(leagueId);
      if (leagueData) {
        setLeague(leagueData);
      }
      setLoading(false);
    }
    fetchLeague();
  }, [params.leagueId]);
  
  if (loading) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!league) {
    notFound();
  }

  const isAdmin = user && league.adminIds.includes(user.id);
  const isMember = user && league.players.some(p => p.id === user.id);

  const handleJoinLeague = async () => {
    if (user && !isMember) {
      await addUserToLeague(league.id, user.id);
      // Immediately fetch the updated league data to refresh the state
      const updatedLeague = await getLeagueById(league.id);
      if (updatedLeague) {
        setLeague(updatedLeague);
      }
      toast({
        title: "League Joined!",
        description: `You are now a member of ${league.name}.`,
      });
      // Refresh server-side data for other pages
      router.refresh(); 
    }
  };


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
               {!isMember && user && (
                <Button onClick={handleJoinLeague}>
                  <UserPlus className="mr-2 h-4 w-4" /> Join League
                </Button>
              )}
              <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
              {isAdmin && (
                <Button variant="secondary" asChild>
                  <Link href={`/leagues/${league.id}/admin`}>
                    <Settings className="mr-2 h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <LeagueTabs league={league} />
    </div>
  );
}
