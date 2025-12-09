
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLeagueById, recordMatch, calculateEloChange } from "@/lib/data";
import { useRouter, notFound, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import type { Player, League } from "@/lib/types";
import { ArrowLeft, Users, TrendingUp, TrendingDown } from "lucide-react";
import Link from 'next/link';
import { useApp } from "@/context/app-context";
import { PlayerCombobox } from "./components/player-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";


const formSchema = z.object({
  playerAId: z.string().min(1, "Player A is required."),
  playerBId: z.string().min(1, "Player B is required."),
  playerAScore: z.coerce.number({required_error: "Score is required."}).min(0).max(3),
  playerBScore: z.coerce.number({required_error: "Score is required."}).min(0).max(3),
}).refine(data => data.playerAId !== data.playerBId, {
    message: "Players cannot play against themselves.",
    path: ["playerBId"],
}).refine(data => data.playerAScore !== data.playerBScore, {
    message: "Scores cannot be tied. A winner must be decided.",
    path: ["playerBScore"],
});


export default function RecordMatchPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const { refresh } = useApp();

  useEffect(() => {
    async function fetchLeague() {
      const leagueData = await getLeagueById(leagueId);
      if (leagueData) {
        setLeague(leagueData);
      } else {
        notFound();
      }
      setLoading(false);
    }
    if (leagueId) {
      fetchLeague();
    }
  }, [leagueId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerAId: "",
      playerBId: "",
    }
  });

  const playerAId = form.watch("playerAId");
  const playerBId = form.watch("playerBId");

  const activePlayers = league?.players.filter(p => p.status === 'active') || [];
  const canRecordMatch = activePlayers.length >= 2;

  const potentialEloChange = useMemo(() => {
    if (!user || !playerAId || !playerBId || playerAId === playerBId) return null;

    const currentUserIsPlayer = user.id === playerAId || user.id === playerBId;
    if (!currentUserIsPlayer) return null;

    const self = activePlayers.find(p => p.id === user.id);
    const opponentId = user.id === playerAId ? playerBId : playerAId;
    const opponent = activePlayers.find(p => p.id === opponentId);

    if (!self || !opponent) return null;

    const selfMatchesPlayed = self.wins + self.losses;

    const eloWin = calculateEloChange(self.elo, opponent.elo, selfMatchesPlayed, 'win');
    const eloLoss = calculateEloChange(self.elo, opponent.elo, selfMatchesPlayed, 'loss');

    return { win: eloWin, loss: eloLoss };
  }, [playerAId, playerBId, user, activePlayers]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!league || !canRecordMatch) return;

    const winnerId = values.playerAScore > values.playerBScore ? values.playerAId : values.playerBId;

    try {
      await recordMatch(league.id, {...values, winnerId});
      toast({
        title: "Match Recorded!",
        description: "The results have been saved and ELOs updated.",
      });
      refresh();
      router.push(`/leagues/${league.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: (error as Error).message || "Could not record the match.",
      });
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (!league) notFound();

  const scoreOptions = ["0", "1", "2", "3"];

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" asChild className="mb-4">
            <Link href={`/leagues/${league.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
            </Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Record a Match</CardTitle>
          <CardDescription>
            Enter the match results for &quot;{league.name}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canRecordMatch ? (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Not Enough Players</h3>
                <p className="text-muted-foreground mt-2">
                    You need at least two active players in the league to record a match.
                </p>
             </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-[1fr_120px] gap-x-4 gap-y-6 items-end">
                  {/* Row 1: Player A */}
                  <FormField
                    control={form.control}
                    name="playerAId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player A</FormLabel>
                        <PlayerCombobox
                          players={activePlayers}
                          value={field.value}
                          onChange={field.onChange}
                          disabledPlayerId={playerBId}
                          placeholder="Select Player A"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="playerAScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {scoreOptions.map(score => (
                              <SelectItem key={`a-${score}`} value={score}>{score}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="absolute" />
                      </FormItem>
                    )}
                  />

                  {/* Row 2: Player B */}
                   <FormField
                    control={form.control}
                    name="playerBId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player B</FormLabel>
                        <PlayerCombobox
                          players={activePlayers}
                          value={field.value}
                          onChange={field.onChange}
                          disabledPlayerId={playerAId}
                          placeholder="Select Player B"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="playerBScore"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel className="opacity-0 hidden sm:block">Score</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {scoreOptions.map(score => (
                              <SelectItem key={`b-${score}`} value={score}>{score}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="absolute" />
                      </FormItem>
                    )}
                  />
                </div>

                {potentialEloChange && (
                   <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <h4 className="font-semibold mb-2">Potential ELO Change</h4>
                        <div className="flex justify-center items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <div>
                                    <span className="font-bold text-green-500">+{potentialEloChange.win}</span>
                                    <span className="text-muted-foreground"> for a win</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-500" />
                                <div>
                                    <span className="font-bold text-red-500">{potentialEloChange.loss}</span>
                                    <span className="text-muted-foreground"> for a loss</span>
                                </div>
                            </div>
                        </div>
                   </div>
                )}

                <Button type="submit">Submit Result</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
