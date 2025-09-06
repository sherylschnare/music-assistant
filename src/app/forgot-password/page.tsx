
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
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const auth = getAuth();

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await sendPasswordResetEmail(auth, email)
      setEmailSent(true)
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email to reset your password.",
      })
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "An unknown error occurred.";
      switch (errorCode) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        default:
          errorMessage = 'Failed to send password reset email. Please try again.';
          break;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
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
          <CardTitle className="text-2xl font-headline text-center">Forgot Your Password?</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">An email has been sent to <strong>{email}</strong>. Please follow the instructions in the email to reset your password.</p>
              <Button onClick={() => router.push('/')} className="mt-4 w-full bg-primary hover:bg-primary/90">
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="grid gap-4">
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
              
              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Remembered your password?{" "}
            <Link href="/" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
