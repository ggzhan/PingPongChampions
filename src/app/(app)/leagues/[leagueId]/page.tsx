
"use client";

import { getLeagueById, addUserToLeague, removePlayerFromLeague } from "@/lib/data";
import { notFound, useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus, Share2, LogOut, Globe, Lock, EyeOff, PlusCircle } from "lucide-react";
import LeagueTabs from "./components/league-tabs";
import { useUser } from "@/context/user-context";
import { useState, useEffect, useCallback } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export default function LeaguePage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const fetchLeague = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const leagueData = await getLeagueById(leagueId);
      setLeague(leagueData);
    } catch (error) {
      console.error("Failed to fetch league:", error);
      setLeague(null);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeague();
  }, [fetchLeague]);
  
  if (loading) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!league) {
    notFound();
  }

  const isAdmin = user && league.adminIds.includes(user.id);
  const isMember = user && league.players.some(p => p.id === user.id && p.status === 'active');
  const activePlayers = league.players.filter(p => p.status === 'active');
  const canRecordMatch = activePlayers.length >= 2;


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
        <CardHeader className="pb-4">
          <div className="flex-1">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
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
        </CardHeader>
        <CardContent>
            <Separator className="mb-4"/>
            <div className="flex items-center gap-2 flex-wrap">
                {!isMember && user && league.privacy === 'public' && (
                <Button onClick={handleJoinLeague}>
                  <UserPlus className="mr-2 h-4 w-4" /> Join League
                </Button>
              )}
                {isMember && user && (
                  <>
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
                  </>
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
            {showJoinForm && (
              <div className="mt-6">
                  <JoinPrivateLeagueForm leagueId={league.id} onLeagueJoined={fetchLeague}/>
              </div>
            )}
        </CardContent>
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
