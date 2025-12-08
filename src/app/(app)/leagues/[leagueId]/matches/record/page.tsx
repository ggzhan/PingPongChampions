
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLeagueById, recordMatch } from "@/lib/data";
import { useRouter, notFound, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Player, League } from "@/lib/types";
import { ArrowLeft, User as UserIcon, Users } from "lucide-react";
import Link from 'next/link';
import { useApp } from "@/context/app-context";
import { PlayerCombobox } from "./components/player-combobox";

const formSchema = z.object({
  playerAId: z.string().min(1, "Player A is required."),
  playerBId: z.string().min(1, "Player B is required."),
  playerAScore: z.coerce.number().min(0, "Score must be a positive number."),
  playerBScore: z.coerce.number().min(0, "Score must be a positive number."),
  winnerId: z.string().min(1, "A winner must be selected."),
}).refine(data => data.playerAId !== data.playerBId, {
    message: "Players cannot play against themselves.",
    path: ["playerBId"],
}).refine(data => data.playerAScore !== data.playerBScore, {
    message: "Scores cannot be tied. A winner must be decided.",
    path: ["playerBScore"],
}).refine(data => {
    if (data.winnerId === data.playerAId && data.playerAScore < data.playerBScore) return false;
    if (data.winnerId === data.playerBId && data.playerBScore < data.playerAScore) return false;
    return true;
}, {
    message: "Winner's score must be higher than the opponent's.",
    path: ["winnerId"],
});


export default function RecordMatchPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const router = useRouter();
  const { toast } = useToast();
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
      playerAScore: '' as any,
      playerBScore: '' as any,
      winnerId: "",
    }
  });

  const playerAId = form.watch("playerAId");
  const playerBId = form.watch("playerBId");

  const activePlayers = league?.players.filter(p => p.status === 'active') || [];
  const playerA = activePlayers.find(p => p.id === playerAId);
  const playerB = activePlayers.find(p => p.id === playerBId);
  const canRecordMatch = activePlayers.length >= 2;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!league || !canRecordMatch) return;

    try {
      await recordMatch(league.id, values);
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
            Enter the match results in sets (e.g., 3-2) for &quot;{league.name}&quot;.
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <FormControl>
                          <Input type="number" placeholder="e.g. 3" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="number" placeholder="e.g. 2" {...field} />
                        </FormControl>
                        <FormMessage className="absolute" />
                      </FormItem>
                    )}
                  />
                </div>

              {playerA && playerB && (
                  <FormField
                  control={form.control}
                  name="winnerId"
                  render={({ field }) => (
                      <FormItem className="space-y-3">
                      <FormLabel>Who won?</FormLabel>
                      <FormControl>
                          <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                          >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                  <RadioGroupItem value={playerA.id} />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  {playerA.name}
                              </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                  <RadioGroupItem value={playerB.id} />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  {playerB.name}
                              </FormLabel>
                          </FormItem>
                          </RadioGroup>
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
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
