
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
import { getAuth, deleteUser } from "firebase/auth";
import { useFirebase } from "@/firebase";

export default function UserManagementPage() {
  const { user } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isSuperAdmin = user?.email === 'markus.koenigreich@gmail.com';

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/');
      return;
    }

    async function fetchUsers() {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setLoading(false);
    }

    fetchUsers();
  }, [isSuperAdmin, router]);

  const handleDeleteUser = async (userToDelete: User) => {
    if (!isSuperAdmin) {
        toast({ variant: "destructive", title: "Unauthorized" });
        return;
    }
    
    try {
      // This is a complex operation. We need to delete the user from our db,
      // and also from Firebase Auth. This is a client-side operation and
      // requires re-authentication for security reasons, which we cannot do here.
      // So, we will only "soft delete" by removing their data from our firestore db.
      // The auth user will remain.
      await deleteUserAccount(userToDelete.id);

      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast({
        title: "User Data Anonymized",
        description: `All data for ${userToDelete.name} has been anonymized. Their auth account still exists.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
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
                    {user?.id !== u.id && (
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
                                    This action cannot be undone. This will permanently anonymize the user '{u.name}' and their associated data. It will not delete their authentication record.
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
                    )}
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
