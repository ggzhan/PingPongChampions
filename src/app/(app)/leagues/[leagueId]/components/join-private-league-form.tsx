
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
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  inviteCode: z.string().min(6, "Invite code must be 6 characters.").max(6, "Invite code must be 6 characters."),
});

type JoinPrivateLeagueFormProps = {
  leagueId: string;
  onLeagueJoined: () => void;
};

export default function JoinPrivateLeagueForm({ leagueId, onLeagueJoined }: JoinPrivateLeagueFormProps) {
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
      const joinedLeague = await joinLeagueByInviteCode(values.inviteCode.toUpperCase(), user.id, leagueId);
      toast({
        title: "League Joined!",
        description: `You are now a member of "${joinedLeague.name}".`,
      });
      onLeagueJoined(); // Callback to refresh the parent page
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Oh no!",
        description: (error as Error).message || "Something went wrong.",
      });
    }
  }

  return (
    <>
        <Separator className="mb-6"/>
        <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold">Join This Private League</h3>
            <p className="text-sm text-muted-foreground mb-4">
                This league is private. Enter an invite code to join.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                    <FormField
                    control={form.control}
                    name="inviteCode"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormLabel className="sr-only">Invite Code</FormLabel>
                        <FormControl>
                            <Input placeholder="ABCXYZ" {...field} className="uppercase font-mono tracking-widest text-lg"/>
                        </FormControl>
                        <FormMessage className="mt-2" />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">Join League</Button>
                </form>
            </Form>
        </div>
    </>
  );
}

