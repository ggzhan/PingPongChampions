
"use client";

import { getLeagueById, addUserToLeague, removePlayerFromLeague } from "@/lib/data";
import { notFound, useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus, LogOut, Globe, Lock, EyeOff, PlusCircle, LogIn, ShieldQuestion } from "lucide-react";
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
  const [fetchError, setFetchError] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const fetchLeague = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);
    setFetchError(false);
    try {
      const leagueData = await getLeagueById(leagueId);
      if (leagueData) {
        setLeague(leagueData);
      } else {
        // This case will be hit for logged-out users on private leagues
        setLeague(null);
        setFetchError(true);
      }
    } catch (error) {
      console.error("Failed to fetch league:", error);
      setLeague(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeague();
  }, [fetchLeague, user]); // Re-fetch when user logs in/out
  
  if (loading) {
    return <div>Loading...</div>; // Or a skeleton loader
  }
  
  // Special case for logged-out users trying to access a page they can't see
  if (!user && (fetchError || !league)) {
     return (
       <Card className="text-center p-8">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full h-16 w-16 flex items-center justify-center">
            <ShieldQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">Access Restricted</CardTitle>
          <CardDescription>You need to be logged in to view the details of this league.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register"><UserPlus className="mr-2 h-4 w-4"/>Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
     );
  }

  if (!league) {
    notFound();
  }

  const isAdmin = user && (league.adminIds.includes(user.id) || user.email === 'markus.koenigreich@gmail.com');
  const isMember = user && league.players.some(p => p.id === user.id && p.status === 'active');
  const activePlayers = league.players.filter(p => p.status === 'active');
  const canRecordMatch = activePlayers.length >= 2;


  const handleJoinLeague = async () => {
    if (user && !isMember && league.privacy === 'public') {
      await addUserToLeague(league.id, user);
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
                          <Button variant="success" asChild disabled={!canRecordMatch} aria-disabled={!canRecordMatch} className={!canRecordMatch ? "pointer-events-none" : ""}>
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
               {showJoinForm && (
                  <JoinPrivateLeagueForm leagueId={league.id} onLeagueJoined={fetchLeague}/>
              )}
              {isAdmin && (
                <Button variant="secondary" asChild>
                  <Link href={`/leagues/${league.id}/admin`}>
                    <Settings className="mr-2 h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
            </div>
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
