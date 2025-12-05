import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Mock data, in a real app this would come from an API
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  bio: 'Just a casual ping pong enthusiast.',
};

const userLeagues = [
    { id: 'league-1', name: 'Office Champions League', rank: 2, elo: 1016 },
];

export default function ProfilePage() {
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
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Photo</Button>
                    </div>

                    <Separator />
                    
                    <form className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" defaultValue={user.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={user.email} />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input id="bio" defaultValue={user.bio} />
                        </div>
                        
                        <div className="pt-2">
                             <Button>Save Changes</Button>
                        </div>
                    </form>

                     <Separator />
                    
                    <div>
                        <h3 className="text-lg font-semibold">Change Password</h3>
                        <form className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button>Update Password</Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
