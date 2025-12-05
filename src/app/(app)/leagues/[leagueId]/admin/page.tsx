
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
import { getLeagueById, updateLeague } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { useState, useEffect } from "react";
import type { League } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "League name must be at least 3 characters.",
  }).max(50, {
      message: "League name must not be longer than 50 characters."
  }),
  description: z.string().max(300, {
    message: "Description must not be longer than 300 characters."
  }).optional(),
});

export default function LeagueAdminPage({ params }: { params: { leagueId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

   useEffect(() => {
    async function fetchLeague() {
      const leagueData = await getLeagueById(params.leagueId);
      if (leagueData) {
        setLeague(leagueData);
        form.reset({
            name: leagueData.name,
            description: leagueData.description,
        });

        // Security check: Only admins should be on this page
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

  if (loading || !league) {
    return <div>Loading admin panel...</div>
  }

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
                        <Button type="submit">Save Changes</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
