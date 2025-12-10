
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/user-context";
import { getAllUsers, deleteUserAccount } from "@/lib/data";
import type { User } from "@/lib/types";
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

const superAdminEmails = ['markus.koenigreich@gmail.com', 'gerald.zhang@gmail.com'];

export default function UserManagementPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isSuperAdmin = user?.email ? superAdminEmails.includes(user.email) : false;

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    if (!isSuperAdmin) {
      router.push('/');
      return;
    }

    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        // Filter out users who have already been "deleted" (anonymized)
        const activeUsers = allUsers.filter(u => u.name !== "Deleted User");
        setUsers(activeUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          variant: "destructive",
          title: "Failed to load users",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [isSuperAdmin, router, user, toast]);

  const handleDeleteUser = async (userToDelete: User) => {
    if (!isSuperAdmin) {
        toast({ variant: "destructive", title: "Unauthorized" });
        return;
    }
    
    try {
      // This function now anonymizes league data and deletes the user document.
      // It does not and cannot delete the Firebase Auth user.
      await deleteUserAccount(userToDelete.id);

      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast({
        title: "User Deleted",
        description: `All data for ${userToDelete.name} has been anonymized and their user record has been removed.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting User",
        description: error.message,
      });
    }
  };


  if (loading) {
    return <div>Loading users...</div>;
  }

  if (!isSuperAdmin) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
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
                                This action cannot be undone. This will permanently anonymize the user '{u.name}' in all leagues and remove their user record. It will not delete their authentication record, and they will still be able to log in.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(u)}>
                                Delete User Data
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
