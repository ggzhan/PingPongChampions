
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { getLeagues, deleteLeague } from "@/lib/data";
import type { League } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LeagueManagementPage() {
  const { user } = useUser();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isSuperAdmin = user?.email === 'markus.koenigreich@gmail.com';

  useEffect(() => {
    if (!user) return;
    if (!isSuperAdmin) {
      router.push('/');
      return;
    }

    async function fetchLeagues() {
      try {
        const allLeagues = await getLeagues();
        setLeagues(allLeagues);
      } catch (error) {
        console.error("Failed to fetch leagues:", error);
        toast({
          variant: "destructive",
          title: "Failed to load leagues",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, [isSuperAdmin, router, user, toast]);

  const handleDeleteLeague = async (leagueToDelete: League) => {
    if (!isSuperAdmin) {
        toast({ variant: "destructive", title: "Unauthorized" });
        return;
    }
    
    try {
      await deleteLeague(leagueToDelete.id);
      setLeagues(leagues.filter((l) => l.id !== leagueToDelete.id));
      toast({
        title: "League Deleted",
        description: `The league "${leagueToDelete.name}" has been permanently deleted.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting League",
        description: error.message,
      });
    }
  };

  if (loading) {
    return <div>Loading leagues...</div>;
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>League Management</CardTitle>
          <CardDescription>View and manage all leagues in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>League Name</TableHead>
                <TableHead className="text-center">Players</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => (
                <TableRow key={league.id}>
                  <TableCell className="font-medium">{league.name}</TableCell>
                  <TableCell className="text-center">{league.activePlayerCount || 0}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(league.createdAt instanceof Date ? league.createdAt : new Date(league.createdAt as string), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {league.lastActivity ? formatDistanceToNow(new Date(league.lastActivity), { addSuffix: true }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the league "{league.name}" and all its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteLeague(league)}>
                            Delete League
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
