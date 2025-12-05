
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
import { createLeague } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";

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

export default function CreateLeaguePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

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
          adminIds: [user.id],
      });
      toast({
        title: "League Created!",
        description: `"${values.name}" is ready for players.`,
      });
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
                        <Button type="submit">Create League</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
