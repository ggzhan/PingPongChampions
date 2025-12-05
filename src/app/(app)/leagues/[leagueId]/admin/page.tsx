
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLeagueById, updateLeague, deleteLeague, regenerateInviteCode } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { useState, useEffect } from "react";
import type { League } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, KeyRound, RefreshCw, Copy, Lock, Globe } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "League name must be at least 3 characters.",
  }).max(50, {
      message: "League name must not be longer than 50 characters."
  }),
  description: z.string().max(300, {
    message: "Description must not be longer than 300 characters."
  }).optional(),
  privacy: z.enum(["public", "private"]),
});

export default function LeagueAdminPage({ params }: { params: { leagueId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
    },
  });

  const privacyValue = form.watch("privacy");

   useEffect(() => {
    async function fetchLeague() {
      const leagueData = await getLeagueById(params.leagueId);
      if (leagueData) {
        setLeague(leagueData);
        setInviteCode(leagueData.inviteCode);
        form.reset({
            name: leagueData.name,
            description: leagueData.description,
            privacy: leagueData.privacy,
        });

        if (!user || !leagueData.adminIds.includes(user.id)) {
            toast({ variant: "destructive", title: "Unauthorized", description: "You are not an admin for this league." });
            router.push(`/leagues/${params.leagueId}`);
        }

      } else {
        notFound();
      }
      setLoading(false);
    }

    if (user) {
        fetchLeague();
    }
  }, [params.leagueId, user, router, toast, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!league) return;
    
    try {
      await updateLeague(league.id, values);
      toast({
        title: "League Updated!",
        description: `Your league settings have been saved.`,
      });
      router.push(`/leagues/${league.id}`);
      router.refresh();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Oh no!",
        description: "Something went wrong while updating the league.",
      });
    }
  }

  async function handleRegenerateCode() {
    if (!league) return;
    const newCode = await regenerateInviteCode(league.id);
    setInviteCode(newCode);
    toast({ title: "Invite code regenerated." });
  }

  function copyInviteCode() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    toast({ title: "Copied to clipboard!" });
  }

  async function handleDeleteLeague() {
    if (!league) return;
    try {
      await deleteLeague(league.id);
      toast({
        title: "League Deleted",
        description: `The league "${league.name}" has been permanently deleted.`,
      });
      router.push('/leagues');
      router.refresh();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Oh no!",
            description: "Something went wrong while deleting the league.",
        });
    }
  }


  if (loading || !league) {
    return <div>Loading admin panel...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" asChild className="mb-4">
            <Link href={`/leagues/${league.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
            </Link>
        </Button>
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">League Administration</CardTitle>
                <CardDescription>
                    Update the settings for your league, &quot;{league.name}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>League Name</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g. Office Champions" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                  <Textarea
                                      placeholder="Tell us a little bit about your league"
                                      className="resize-none"
                                      {...field}
                                      />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="privacy"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Privacy</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2">
                                     <RadioGroupItem value="public" id="public" />
                                     <Label htmlFor="public" className="font-normal flex items-center gap-2"><Globe className="h-4 w-4"/>Public</Label>
                                  </FormItem>
                                   <FormItem className="flex items-center space-x-2">
                                     <RadioGroupItem value="private" id="private" />
                                     <Label htmlFor="private" className="font-normal flex items-center gap-2"><Lock className="h-4 w-4"/>Private</Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {privacyValue === 'private' && (
                            <div className="space-y-2">
                                <Label>Invite Code</Label>
                                <div className="flex gap-2">
                                    <Input value={inviteCode} readOnly className="font-mono text-lg tracking-widest"/>
                                    <Button type="button" variant="secondary" size="icon" onClick={copyInviteCode}><Copy className="h-4 w-4"/></Button>
                                    <Button type="button" variant="outline" size="icon" onClick={handleRegenerateCode}><RefreshCw className="h-4 w-4"/></Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Share this code with people you want to invite to the league.
                                </p>
                            </div>
                        )}

                        <Button type="submit">Save Changes</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Danger Zone</CardTitle>
                <CardDescription>This action is permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete League</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            &quot;{league.name}&quot; league and all of its associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteLeague}>
                                Delete League
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    </div>
  );
}
