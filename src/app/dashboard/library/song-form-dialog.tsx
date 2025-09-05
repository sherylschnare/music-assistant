
'use client'

import * as React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { v4 as uuidv4 } from 'uuid'
import { Plus, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

import type { Song } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const musicSubtypes = ["Christmas", "Easter", "Spring", "Winter", "Fall", "Summer", "Celtic", "Pop"];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  composer: z.string().min(2, "Composer must be at least 2 characters."),
  lyricist: z.string().optional(),
  arranger: z.string().optional(),
  publisher: z.string().optional(),
  copyright: z.string().optional(),
  catalogNumber: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative.").optional(),
  type: z.enum(["Choral", "Orchestral", "Band", "Solo", "Chamber", "Christmas"]),
  subtypes: z.array(z.string()).optional(),
})

type SongFormValues = z.infer<typeof formSchema>

interface SongFormDialogProps {
  onSave: (song: Omit<Song, 'id' | 'performanceHistory' | 'lastPerformed'>) => void
  trigger: React.ReactNode
}

export function SongFormDialog({ onSave, trigger }: SongFormDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<SongFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: "",
        composer: "",
        lyricist: "",
        arranger: "",
        publisher: "",
        copyright: "",
        catalogNumber: "",
        quantity: 0,
        type: "Orchestral",
        subtypes: [],
    }
  })

  const onSubmit = (values: SongFormValues) => {
    onSave(values)
    toast({
      title: "Song added",
      description: `${values.title} has been successfully added to the library.`,
    })
    form.reset()
    setIsOpen(false)
  }

  const subtypes = form.watch("subtypes") || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Music
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
          <DialogDescription>
            Enter the details for the new piece of music.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                 <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Symphony No. 5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="composer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Composer</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Ludwig van Beethoven" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lyricist"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lyricist</FormLabel>
                        <FormControl>
                            <Input placeholder="Lyricist (if applicable)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="arranger"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Arranger</FormLabel>
                        <FormControl>
                            <Input placeholder="Arranger (if applicable)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Publisher</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., G. Schirmer" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="copyright"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Copyright</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., © 2024 John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="catalogNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Catalog Number</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., HL01234567" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Choral">Choral</SelectItem>
                                <SelectItem value="Orchestral">Orchestral</SelectItem>
                                <SelectItem value="Band">Band</SelectItem>
                                <SelectItem value="Solo">Solo</SelectItem>
                                <SelectItem value="Chamber">Chamber</SelectItem>
                                <SelectItem value="Christmas">Christmas</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="subtypes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subtypes</FormLabel>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-normal">
                                        Select subtypes...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64">
                                    {musicSubtypes.map(subtype => (
                                        <DropdownMenuCheckboxItem
                                            key={subtype}
                                            checked={field.value?.includes(subtype)}
                                            onCheckedChange={(checked) => {
                                                const currentSubtypes = field.value || [];
                                                if (checked) {
                                                    field.onChange([...currentSubtypes, subtype]);
                                                } else {
                                                    field.onChange(currentSubtypes.filter(s => s !== subtype));
                                                }
                                            }}
                                        >
                                            {subtype}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <div className="flex flex-wrap gap-2 pt-2">
                                {subtypes.map(subtype => (
                                    <Badge key={subtype} variant="secondary">
                                        {subtype}
                                        <button
                                            type="button"
                                            className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onClick={() => field.onChange(subtypes.filter(s => s !== subtype))}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>
                <Button type="submit">Add Song</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
