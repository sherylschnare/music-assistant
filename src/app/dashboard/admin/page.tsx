
'use client'

import React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, UserPlus } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/context/user-context"
import { UserFormDialog } from "./user-form-dialog"

const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');
}

export default function AdminPage() {
  const { user, users, setUsers } = useUser()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined)

  React.useEffect(() => {
    if (user && user.role !== 'Music Director') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleAddUser = () => {
    setEditingUser(undefined)
    setIsDialogOpen(true)
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setIsDialogOpen(true)
  }

  const handleSaveUser = (savedUser: User) => {
    if (users.find(u => u.id === savedUser.id)) {
      setUsers(users.map(u => u.id === savedUser.id ? savedUser : u))
    } else {
      const newUser = { ...savedUser, id: savedUser.id || crypto.randomUUID() }
      setUsers([...users, newUser])
    }
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };


  if (!user || user.role !== 'Music Director') {
    return (
        <div className="flex items-center justify-center h-full">
            <p>You are not authorized to view this page.</p>
        </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Administer user accounts and roles."
      >
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all the users in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${u.id}/100`} />
                        <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'Music Director' ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(u)}>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(u.id)}>Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UserFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  )
}
