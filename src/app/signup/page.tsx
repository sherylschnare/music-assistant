
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, FormEvent } from "react"
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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const auth = getAuth();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Check if any users already exist
      const usersCollectionRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollectionRef);
      const isFirstUser = usersSnapshot.empty;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: isFirstUser ? 'Music Director' : 'Musician',
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      toast({
        title: "Account Created",
        description: "Your account has been successfully created. Please log in.",
      })
      router.push("/");
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "An unknown error occurred.";
      switch (errorCode) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. It must be at least 6 characters long.';
          break;
        default:
          errorMessage = 'Failed to create an account. Please try again.';
          break;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AppLogo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
