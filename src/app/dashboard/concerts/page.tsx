
'use client'

import * as React from "react"
import { Plus, Calendar as CalendarIcon, ListMusic, ArrowUp, ArrowDown, X, Search } from "lucide-react"
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
import { useUser } from "@/context/user-context"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


function CreateConcertDialog() {
  const { songs, concerts, setConcerts } = useUser();
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date>()
  const [concertName, setConcertName] = React.useState("")
  const [program, setProgram] = React.useState<Song[]>([])
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("All");

  const musicTypes = ["All", "Choral", "Orchestral", "Band", "Solo", "Chamber"];

  const librarySongs = React.useMemo(() => {
    return songs
      .filter(song => {
        const matchesType = typeFilter === "All" || song.type === typeFilter;
        const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              song.composer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
      });
  }, [songs, typeFilter, searchTerm]);


  const handleToggleSongInLibrary = (song: Song) => {
    setProgram(prevProgram => {
      const isInProgram = prevProgram.some(p => p.id === song.id);
      if (isInProgram) {
        return prevProgram.filter(p => p.id !== song.id);
      } else {
        return [...prevProgram, song];
      }
    });
  };

  const handleRemoveFromProgram = (songId: string) => {
    setProgram(prev => prev.filter(s => s.id !== songId));
  };
  
  const moveSong = (index: number, direction: 'up' | 'down') => {
    const newProgram = [...program];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newProgram.length) return;
    const [movedSong] = newProgram.splice(index, 1);
    newProgram.splice(newIndex, 0, movedSong);
    setProgram(newProgram);
  };

  const handleSave = () => {
    if (!concertName || !date || program.length === 0) {
      // Basic validation, you could add toasts here
      return;
    }
    const newConcert: Concert = {
      id: `concert-${Date.now()}`,
      name: concertName,
      date: date.toISOString(),
      pieces: program,
    };
    setConcerts([...concerts, newConcert]);
    // Reset form
    setConcertName("");
    setDate(undefined);
    setProgram([]);
    setOpen(false);
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Create New Concert Program</DialogTitle>
          <DialogDescription>
            Name your concert, set a date, and select pieces from your library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-8 py-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-4">Program Details</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Concert Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Winter Gala 2024" 
                    className="col-span-3"
                    value={concertName}
                    onChange={(e) => setConcertName(e.target.value)}
                  />
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
              </div>
              <h3 className="text-lg font-semibold mt-8 mb-4">Program Order</h3>
              <ScrollArea className="h-72 w-full rounded-md border">
                {program.length > 0 ? (
                    <div className="p-2 space-y-2">
                        {program.map((song, index) => (
                        <div key={song.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div>
                                <p className="text-sm font-medium">{song.title}</p>
                                <p className="text-xs text-muted-foreground">{song.composer}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSong(index, 'up')} disabled={index === 0}>
                                    <ArrowUp className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSong(index, 'down')} disabled={index === program.length - 1}>
                                    <ArrowDown className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveFromProgram(song.id)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Select songs from the library to add them to the program.
                    </div>
                )}
              </ScrollArea>
            </div>
            <div>
                 <h3 className="text-lg font-semibold mb-4">Music Library</h3>
                 <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search title or composer..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            {musicTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <ScrollArea className="h-[428px] w-full rounded-md border">
                    <div className="p-4 space-y-2">
                    {librarySongs.map(song => {
                        const isSelected = program.some(p => p.id === song.id);
                        return (
                            <div key={song.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                            <Checkbox
                                id={`song-${song.id}`}
                                checked={isSelected}
                                onCheckedChange={() => handleToggleSongInLibrary(song)}
                            />
                            <label htmlFor={`song-${song.id}`} className="flex-1 cursor-pointer">
                                <p className="text-sm font-medium">{song.title}</p>
                                <p className="text-xs text-muted-foreground">{song.composer}</p>
                            </label>
                            </div>
                        )
                    })}
                    </div>
                </ScrollArea>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Program</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function ConcertsPage() {
  const { concerts } = useUser();
  const sortedConcerts = concerts ? [...concerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

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

    
