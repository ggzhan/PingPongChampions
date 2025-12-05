
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User as UserIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


// Mock data, in a real app this would come from an API
const user = {
  name: 'AlpacaRacer',
  email: 'john.doe@example.com',
  showEmail: false,
};

const userLeagues = [
    { id: 'league-1', name: 'Office Champions League', rank: 2, elo: 1016 },
];

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email(),
  showEmail: z.boolean().default(false),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;


// This can be used in a real app to mock a password update
const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function ProfilePage() {
    const { toast } = useToast();

    const accountForm = useForm<AccountFormValues>({
        resolver: zodResolver(accountFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            showEmail: user.showEmail,
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    function onAccountSubmit(data: AccountFormValues) {
        // In a real app, you'd call an API to update the user
        console.log("Account data submitted:", data);
        toast({
            title: "Account Updated",
            description: "Your account settings have been saved.",
        });
        // To see the changes reflected, you'd re-fetch user data here
    }

    function onPasswordSubmit(data: PasswordFormValues) {
        // In a real app, you'd call an API to update the password
        console.log("Password data submitted:", data);
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
        passwordForm.reset();
    }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Leagues</CardTitle>
                </CardHeader>
                <CardContent>
                    {userLeagues.length > 0 ? (
                        <ul className="space-y-4">
                            {userLeagues.map(league => (
                                <li key={league.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{league.name}</p>
                                        <p className="text-sm text-muted-foreground">Rank: #{league.rank}, ELO: {league.elo}</p>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">You haven't joined any leagues yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your personal information and account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-muted-foreground"/>
                        </div>
                        <p className="font-semibold text-lg">{accountForm.watch('name')}</p>
                    </div>

                    <Separator />
                    
                    <Form {...accountForm}>
                        <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                             <FormField
                                control={accountForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={accountForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />

                            <FormField
                                control={accountForm.control}
                                name="showEmail"
                                render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                   <div className="space-y-0.5">
                                      <FormLabel>Show Email on Profile</FormLabel>
                                      <FormDescription>
                                        Allow other users to see your email address.
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
                        
                            <div className="pt-2">
                                 <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </Form>

                     <Separator />
                    
                    <div>
                        <h3 className="text-lg font-semibold">Change Password</h3>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                </div>
                                <div className="pt-2">
                                    <Button type="submit">Update Password</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    