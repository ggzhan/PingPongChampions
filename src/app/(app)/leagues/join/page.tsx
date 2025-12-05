
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { joinLeagueByInviteCode } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";

const formSchema = z.object({
  inviteCode: z.string().min(6, {
    message: "Invite code must be 6 characters.",
  }).max(6, {
      message: "Invite code must be 6 characters."
  }),
});

export default function JoinLeaguePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to join a league.",
        });
        return;
    }
    
    try {
      const joinedLeague = await joinLeagueByInviteCode(values.inviteCode.toUpperCase(), user.id);
      toast({
        title: "League Joined!",
        description: `You are now a member of "${joinedLeague.name}".`,
      });
      router.push(`/leagues/${joinedLeague.id}`);
      router.refresh();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Oh no!",
        description: (error as Error).message || "Something went wrong.",
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">Join a Private League</CardTitle>
                <CardDescription>
                    Enter the invite code you received to join a private league.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                        control={form.control}
                        name="inviteCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Invite Code</FormLabel>
                            <FormControl>
                                <Input placeholder="ABCXYZ" {...field} className="uppercase font-mono tracking-widest text-lg"/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit">Join League</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
