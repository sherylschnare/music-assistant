
'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { AppLogo } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/user-context"
import type { User } from "@/lib/types"

export default function LoginPage() {
  const router = useRouter()
  const { setUser, users, setUsers } = useUser()
  const [selectedUserId, setSelectedUserId] = React.useState<string>(users[0]?.id || '')
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  
  const selectedUser = users.find(u => u.id === selectedUserId)

  React.useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id)
    }
    // Reset password fields when user changes
    setPassword("")
    setConfirmPassword("")
    setError(null)
  }, [users, selectedUserId]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return;

    // First-time login: setting password
    if (!selectedUser.password) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const updatedUser = { ...selectedUser, password: password };
      const updatedUsers = users.map(u => u.id === selectedUser.id ? updatedUser : u)
      setUsers(updatedUsers);
      setUser(updatedUser);
      router.push("/dashboard")
    } else { // Existing user: checking password
      if (password !== selectedUser.password) {
        setError("Incorrect password.");
        return;
      }
      setUser(selectedUser);
      router.push("/dashboard")
    }
  }
  
  if (!users.length) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AppLogo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Tartones</CardTitle>
          <CardDescription className="text-center">
            Select a user profile to log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user-select">User Role</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedUser && !selectedUser.password ? (
              <>
                <CardDescription className="text-center pt-2">
                  This is your first time logging in. Please set a password.
                </CardDescription>
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            )}
            
            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              {selectedUser && !selectedUser.password ? 'Set Password & Login' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
