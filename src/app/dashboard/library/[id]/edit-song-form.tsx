
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/user-context"
import type { Song } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  composer: z.string().min(2, "Composer must be at least 2 characters."),
  lyricist: z.string().optional(),
  arranger: z.string().optional(),
  publisher: z.string().optional(),
  copyright: z.string().optional(),
  catalogNumber: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative.").optional(),
  type: z.enum(["Choral", "Orchestral", "Band", "Solo", "Chamber"]),
})

type FormValues = z.infer<typeof formSchema>;

export function EditSongForm({ song }: { song: Song }) {
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()
  const { songs, setSongs } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      title: song.title,
      composer: song.composer,
      lyricist: song.lyricist || "",
      arranger: song.arranger || "",
      publisher: song.publisher || "",
      copyright: song.copyright || "",
      catalogNumber: song.catalogNumber || "",
      quantity: song.quantity || 0,
      type: song.type || "Orchestral",
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    
    const updatedSong: Song = { ...song, ...values };
    const updatedSongs = songs.map(s => s.id === song.id ? updatedSong : s);
    
    try {
        await setSongs(updatedSongs);
        toast({
          title: "Song updated",
          description: `${song.title} has been successfully updated.`,
        })
    } catch (error) {
        console.error("Failed to update song:", error);
        toast({
            variant: "destructive",
            title: "Update failed",
            description: "There was a problem updating the song.",
        })
    } finally {
        setLoading(false)
    }
  }

  return (
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
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
