
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useFirebase } from "@/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUserById, createUserProfile } from "@/lib/data";


export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('verified') === 'false') {
      setShowVerificationMessage(true);
    }
  }, [searchParams]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force a reload of the user's profile to get the latest emailVerified status
      await userCredential.user.reload();
      const freshUser = userCredential.user;

      if (!freshUser.emailVerified) {
         await sendEmailVerification(freshUser);
         toast({
           variant: "destructive",
           title: "Email not verified",
           description: "Please check your inbox (and spam folder) to verify your email. A new verification link has been sent.",
         });
         return;
      }
      
      // Ensure user profile exists after login
      let userProfile = await getUserById(freshUser.uid);
      if (!userProfile) {
        const newUserProfile = {
            id: freshUser.uid,
            name: freshUser.displayName || 'New User',
            email: freshUser.email!,
            showEmail: false
        };
        await createUserProfile(newUserProfile);
      }


      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };
  
  return (
    <>
        {showVerificationMessage && (
            <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
                <MailCheck className="h-4 w-4 !text-blue-500" />
                <AlertTitle>Verify Your Email</AlertTitle>
                <AlertDescription>
                    A verification link has been sent to your email address. Please check your inbox and spam folder.
                </AlertDescription>
            </Alert>
        )}
        <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <div className="grid gap-2">
            <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            </div>
            <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <Button type="submit" className="w-full">
            Login
        </Button>
        </form>
    </>
  );
}
