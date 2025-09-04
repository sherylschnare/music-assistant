'use client'

import * as React from "react"
import { Plus, Calendar as CalendarIcon, ListMusic } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { concerts, songs } from "@/lib/data"
import type { Concert, Song } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

function CreateConcertDialog() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date>()
  const [selectedSongs, setSelectedSongs] = React.useState<Set<string>>(new Set())

  const handleSelectSong = (songId: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Create New Concert Program</DialogTitle>
          <DialogDescription>
            Name your concert, set a date, and select pieces from your library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Concert Name
            </Label>
            <Input id="name" placeholder="e.g., Winter Gala 2024" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Select Pieces
            </Label>
            <div className="col-span-3">
              <ScrollArea className="h-72 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  {songs.map(song => (
                    <div key={song.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                       <Checkbox
                        id={`song-${song.id}`}
                        checked={selectedSongs.has(song.id)}
                        onCheckedChange={() => handleSelectSong(song.id)}
                      />
                      <label htmlFor={`song-${song.id}`} className="flex-1 cursor-pointer">
                        <p className="text-sm font-medium">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.composer}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Program</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function ConcertsPage() {
  const sortedConcerts = [...concerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <PageHeader title="Concert Programs" description="Build and review your concert programs.">
        <CreateConcertDialog />
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedConcerts.map(concert => (
          <Card key={concert.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">{concert.name}</CardTitle>
              <CardDescription>{new Date(concert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <ListMusic className="w-4 h-4 mr-2" /> {concert.pieces.length} pieces
              </div>
              <ul className="space-y-1 text-sm list-disc pl-5">
                {concert.pieces.slice(0, 4).map(piece => (
                  <li key={piece.id}>{piece.title}</li>
                ))}
                {concert.pieces.length > 4 && <li>...and {concert.pieces.length - 4} more.</li>}
              </ul>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full">View Program</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
