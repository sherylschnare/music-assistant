
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
import { useUser } from "@/context/user-context"
import type { User } from "@/lib/types"

export default function LoginPage() {
  const router = useRouter()
  const { setUser, users } = useUser()
  const [selectedUser, setSelectedUser] = React.useState<string>(users[0]?.id || '')

  React.useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0].id)
    }
  }, [users, selectedUser]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find(u => u.id === selectedUser)
    if (user) {
      setUser(user)
    }
    router.push("/dashboard")
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
              <Select value={selectedUser} onValueChange={setSelectedUser}>
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Login
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
