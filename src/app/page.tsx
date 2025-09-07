
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, FormEvent, useEffect } from "react"
import { AppLogo } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/user-context"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setUser } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    // This effect handles auto-redirection if a user is already logged in.
    const storedUser = localStorage.getItem('userProfile');
    if (user || storedUser) {
      router.push('/dashboard');
    } else {
      setPageLoading(false);
    }
  }, [user, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        setUser(userData);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`,
        });
        router.push("/dashboard");
      } else {
        throw new Error("User data not found in Firestore.");
      }
    } catch (error: any) {
       const errorMessage = "Invalid email or password. Please try again.";
       setError(errorMessage);
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
        setLoading(false)
    }
  }

  if (pageLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
               <div className="mt-4 text-center text-sm">
                <Skeleton className="h-4 w-48 mx-auto" />
               </div>
            </CardContent>
          </Card>
       </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AppLogo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Tartones</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                placeholder="Password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Sign up</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
