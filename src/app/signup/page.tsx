
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLogo } from "@/components/icons"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      setError(null)
      
      const form = e.currentTarget;
      const formData = new FormData(form);
      const firstName = formData.get("first-name") as string;
      const lastName = formData.get("last-name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirm-password") as string;

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false)
        return;
      }
      
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setLoading(false)
        return;
      }

      try {
        const auth = getAuth()
        const usersCollectionRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);
        const isFirstUser = usersSnapshot.empty;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user;

        // Assign role based on whether this is the first user
        const userRole = isFirstUser ? "Music Director" : "Musician";

        // Create a new user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            name: `${firstName} ${lastName}`,
            email: email,
            role: userRole,
        });
        
        toast({
          title: "Account Created",
          description: `Your account has been successfully created as a ${userRole}.`,
        })
        router.push("/dashboard");

      } catch (error: any) {
        const errorCode = error.code;
        let errorMessage = "An unknown error occurred.";
        switch (errorCode) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already in use.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'The password is too weak. Please choose a stronger password.';
                break;
            default:
                errorMessage = 'Failed to create an account. Please try again.';
                break;
        }
        setError(errorMessage)
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
          <CardTitle className="text-xl font-headline text-center">Create your Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account. The first user to sign up will be the Music Director.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" name="first-name" placeholder="Max" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" name="last-name" placeholder="Robinson" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" required />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create an account'}
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
