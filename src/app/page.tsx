
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
import { users } from "@/lib/data"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setUser, loading: userLoading } = useUser();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        setPageLoading(false);
      }
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Demo mode login
    if (email === 'sherylschnare@birdsongstudio.ca' && password === 'Can1000dians@1') {
        const demoUser = users.find(u => u.email === email);
        if (demoUser) {
            toast({
                title: "Login Successful",
                description: "Welcome back! Running in demo mode.",
            });
            setUser(demoUser);
            router.push("/dashboard");
        } else {
            // This case should theoretically not be hit if data is consistent
            setError("Could not find demo user data.");
        }
    } else {
       setError("Invalid email or password for demo mode.");
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please use the provided demo credentials.",
      })
    }
    
    setLoading(false)
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
              <Label htmlFor="password">Password</Label>
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
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="underline">
              Forgot Password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
