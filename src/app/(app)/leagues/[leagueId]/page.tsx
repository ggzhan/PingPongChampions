
"use client";

import { getLeagueById, addUserToLeague, removePlayerFromLeague } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus, Share2, LogOut, Globe, Lock, EyeOff } from "lucide-react";
import LeagueTabs from "./components/league-tabs";
import { useUser } from "@/context/user-context";
import { useState, useEffect } from "react";
import type { League } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import JoinPrivateLeagueForm from "./components/join-private-league-form";

type LeaguePageProps = {
  params: { leagueId: string };
};

export default function LeaguePage({ params }: LeaguePageProps) {
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const fetchLeague = async () => {
    setLoading(true);
    const leagueData = await getLeagueById(params.leagueId);
    if (leagueData) {
      setLeague(leagueData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeague();
  }, [params.leagueId]);
  
  if (loading) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!league) {
    notFound();
  }

  const isAdmin = user && league.adminIds.includes(user.id);
  const isMember = user && league.players.some(p => p.id === user.id && p.status === 'active');

  const handleJoinLeague = async () => {
    if (user && !isMember && league.privacy === 'public') {
      await addUserToLeague(league.id, user.id);
      fetchLeague();
      toast({
        title: "League Joined!",
        description: `You are now a member of ${league.name}.`,
      });
    }
  };

  const handleLeaveLeague = async () => {
    if (user && isMember) {
      await removePlayerFromLeague(league.id, user.id);
      fetchLeague();
      toast({
        title: "You have left the league.",
        description: `You are no longer a member of ${league.name}.`,
      });
    }
  };

  const handleShare = () => {
     if (league.privacy === 'private' && league.inviteCode && (isMember || isAdmin)) {
      navigator.clipboard.writeText(league.inviteCode);
      toast({
        title: "Invite Code Copied!",
        description: "The invite code for this private league has been copied to your clipboard.",
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
       toast({
        title: "Link Copied!",
        description: "The link to this league has been copied to your clipboard.",
      });
    }
  };
  
  const showJoinForm = user && league.privacy === 'private' && !isMember;
  const showLeaderboard = league.privacy === 'public' || (league.privacy === 'private' && league.leaderboardVisible) || isMember || isAdmin;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div>
               <div className="flex items-center gap-4 mb-2">
                <CardTitle className="text-3xl font-bold font-headline">{league.name}</CardTitle>
                <Badge variant="outline" className="capitalize flex gap-1.5 items-center">
                    {league.privacy === 'public' ? <Globe className="h-3 w-3"/> : <Lock className="h-3 w-3"/>}
                    {league.privacy}
                </Badge>
                {league.privacy === 'private' && !league.leaderboardVisible && (
                  <Badge variant="secondary" className="capitalize flex gap-1.5 items-center">
                    <EyeOff className="h-3 w-3"/> Hidden Leaderboard
                  </Badge>
                )}
              </div>
              <CardDescription className="max-w-2xl">{league.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
               {!isMember && user && league.privacy === 'public' && (
                <Button onClick={handleJoinLeague}>
                  <UserPlus className="mr-2 h-4 w-4" /> Join League
                </Button>
              )}
               {isMember && user && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Leave League
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be removed from the leaderboard, but your match history will be kept. 
                        You can rejoin the league at any time if it's public.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLeaveLeague}>
                        Leave League
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
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
         {showJoinForm && (
            <CardContent>
                <JoinPrivateLeagueForm leagueId={league.id} onLeagueJoined={fetchLeague}/>
            </CardContent>
         )}
      </Card>

      {showLeaderboard && <LeagueTabs league={league} />}
      {!showLeaderboard && !isMember && (
         <Card className="text-center p-8">
            <CardHeader>
                <CardTitle>Leaderboard is Hidden</CardTitle>
                <CardDescription>The administrator of this league has chosen to hide the leaderboard from non-members.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
