
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/context/user-context'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, PlusCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type TableType = 'types' | 'subtypes'

export default function TaxonomyPage() {
  const { user, musicTypes, musicSubtypes, setMusicTypes, setMusicSubtypes } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedTable, setSelectedTable] = useState<TableType>('types')
  const [data, setData] = useState<string[]>([])
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (user.role !== 'Music Director') {
      router.push('/dashboard')
    }
  }, [user, router])
  
  useEffect(() => {
    if (selectedTable === 'types') {
      setData(musicTypes)
    } else {
      setData(musicSubtypes)
    }
  }, [selectedTable, musicTypes, musicSubtypes])

  const handleAddItem = () => {
    setEditingItem(null)
    setNewItem('')
    setIsDialogOpen(true)
  }
  
  const handleEditItem = (item: string) => {
    setEditingItem(item)
    setNewItem(item)
    setIsDialogOpen(true)
  }
  
  const handleDeleteItem = (itemToDelete: string) => {
    const updatedData = data.filter(item => item !== itemToDelete);
    if (selectedTable === 'types') {
      setMusicTypes(updatedData)
    } else {
      setMusicSubtypes(updatedData)
    }
    toast({ title: "Item deleted", description: `"${itemToDelete}" has been removed.`})
  }

  const handleSaveItem = () => {
    if (!newItem.trim()) {
        toast({ variant: "destructive", title: "Cannot save empty item."})
        return;
    }

    let updatedData;
    if (editingItem) { // Editing existing item
        updatedData = data.map(item => item === editingItem ? newItem : item)
    } else { // Adding new item
        if (data.find(d => d.toLowerCase() === newItem.toLowerCase())) {
            toast({ variant: "destructive", title: "Item already exists."})
            return;
        }
        updatedData = [...data, newItem];
    }

    if (selectedTable === 'types') {
      setMusicTypes(updatedData)
    } else {
      setMusicSubtypes(updatedData)
    }

    toast({ title: "Save successful", description: `Your changes have been saved.`})
    setIsDialogOpen(false)
    setNewItem('')
    setEditingItem(null)
  }

  if (user.role !== 'Music Director') {
    return null
  }

  return (
    <div>
      <PageHeader
        title="Taxonomy Management"
        description="Manage the types and subtypes used for classifying music."
      />
      <Card>
        <CardHeader>
          <CardTitle>Edit Categories</CardTitle>
          <CardDescription>
            Select a category to view and manage its entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-64">
              <Select value={selectedTable} onValueChange={(value) => setSelectedTable(value as TableType)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="types">Music Types</SelectItem>
                      <SelectItem value="subtypes">Music Subtypes</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddItem}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(item => (
                        <TableRow key={item}>
                            <TableCell className="font-medium">{item}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEditItem(item)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteItem(item)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add'} {selectedTable === 'types' ? 'Type' : 'Subtype'}</DialogTitle>
                <DialogDescription>
                    {editingItem ? 'Update the name of this item.' : `Enter the name for the new item.`}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newItem} onChange={(e) => setNewItem(e.target.value)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveItem}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
