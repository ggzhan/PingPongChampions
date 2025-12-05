
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createLeague } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { Lock, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "League name must be at least 3 characters.",
  }).max(50, {
      message: "League name must not be longer than 50 characters."
  }),
  description: z.string().max(300, {
    message: "Description must not be longer than 300 characters."
  }).optional(),
  privacy: z.enum(["public", "private"], {
    required_error: "You need to select a privacy setting.",
  }),
  leaderboardVisible: z.boolean().default(true),
});

export default function CreateLeaguePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
      leaderboardVisible: true,
    },
  });

  const privacyValue = form.watch("privacy");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a league.",
        });
        return;
    }
    
    try {
      const newLeague = await createLeague({
          name: values.name,
          description: values.description || '',
          privacy: values.privacy,
          leaderboardVisible: values.leaderboardVisible,
          adminIds: [user.id],
      });
      toast({
        title: "League Created!",
        description: `"${values.name}" is ready for players.`,
      });
      router.refresh();
      router.push(`/leagues/${newLeague.id}`);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Oh no!",
        description: "Something went wrong while creating the league.",
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">Create a New League</CardTitle>
                <CardDescription>
                    Fill out the details below to start your own ping pong league.
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
                            <FormDescription>
                                This is your league's public display name.
                            </FormDescription>
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
                             <FormDescription>
                                A brief description of your league's purpose, rules, or members.
                            </FormDescription>
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
                               <FormDescription>
                                Choose who can see and join your league.
                            </FormDescription>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                  <FormItem>
                                     <Label
                                        htmlFor="public"
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                     >
                                        <RadioGroupItem value="public" id="public" className="sr-only" />
                                        <Globe className="mb-3 h-6 w-6" />
                                        Public
                                        <p className="text-sm font-normal text-muted-foreground mt-2 text-center">Anyone can find and join this league.</p>
                                    </Label>
                                  </FormItem>
                                  <FormItem>
                                    <Label
                                      htmlFor="private"
                                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <RadioGroupItem value="private" id="private" className="sr-only" />
                                        <Lock className="mb-3 h-6 w-6" />
                                        Private
                                        <p className="text-sm font-normal text-muted-foreground mt-2 text-center">Only people with an invite code can join.</p>
                                    </Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {privacyValue === 'private' && (
                           <FormField
                                control={form.control}
                                name="leaderboardVisible"
                                render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                   <div className="space-y-0.5">
                                      <FormLabel>Visible Leaderboard</FormLabel>
                                      <FormDescription>
                                        Can non-members see the league's leaderboard and matches?
                                      </FormDescription>
                                    </div>
                                   <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                   </FormControl>
                                 </FormItem>
                                )}
                                />
                        )}
                        <Button type="submit">Create League</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
