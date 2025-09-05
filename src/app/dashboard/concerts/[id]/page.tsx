
'use client'

import * as React from "react"
import { useUser } from "@/context/user-context"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar as CalendarIcon, ArrowUp, ArrowDown, X, Search } from "lucide-react"
import Link from "next/link"
import type { Concert, Song } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"


export default function ConcertDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { songs, concerts, setConcerts } = useUser();
    const id = params.id as string;

    const [concert, setConcert] = React.useState<Concert | undefined>(undefined);
    const [program, setProgram] = React.useState<Song[]>([]);
    const [concertName, setConcertName] = React.useState("");
    const [date, setDate] = React.useState<Date | undefined>();
    const [isLocked, setIsLocked] = React.useState(false);
    
    const [searchTerm, setSearchTerm] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState("All");

    React.useEffect(() => {
        const foundConcert = concerts.find(c => c.id === id);
        if (foundConcert) {
            setConcert(foundConcert);
            setProgram(foundConcert.pieces);
            setConcertName(foundConcert.name);
            setDate(new Date(foundConcert.date));
            setIsLocked(foundConcert.isLocked || new Date(foundConcert.date) < new Date());
        }
    }, [id, concerts]);

    const musicTypes = ["All", "Choral", "Orchestral", "Band", "Solo", "Chamber", "Christmas"];
    
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

    const handleSaveChanges = () => {
        if (!concert || !date) return;
        const updatedConcert: Concert = {
            ...concert,
            name: concertName,
            date: date.toISOString(),
            pieces: program,
            isLocked: isLocked,
        };
        const updatedConcerts = concerts.map(c => c.id === id ? updatedConcert : c);
        setConcerts(updatedConcerts);
        toast({
            title: "Concert Updated",
            description: "The concert program has been successfully saved.",
        })
        router.push("/dashboard/concerts");
    }

    if (!concert) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Concert not found.</p>
            </div>
        )
    }

    const isPast = new Date(concert.date) < new Date();

    return (
        <div>
            <PageHeader
                title={concert.name}
                description={isPast ? "Viewing past concert program" : "Editing concert program"}
            >
                 <Button variant="outline" asChild>
                    <Link href="/dashboard/concerts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Concerts
                    </Link>
                </Button>
            </PageHeader>
            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Edit Concert Program</CardTitle>
                        <CardDescription>
                           Update the concert details and program order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid gap-8 py-4 md:grid-cols-2">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Program Details</h3>
                            <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                Name
                                </Label>
                                <Input 
                                id="name" 
                                className="col-span-3"
                                value={concertName}
                                onChange={(e) => setConcertName(e.target.value)}
                                disabled={isLocked}
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
                                    disabled={isLocked}
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
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="lock-concert" className="text-right">
                                    Lock Program
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                     <Switch 
                                        id="lock-concert"
                                        checked={isLocked}
                                        onCheckedChange={setIsLocked}
                                        disabled={isPast}
                                    />
                                    <Label htmlFor="lock-concert" className="text-sm text-muted-foreground">
                                        {isPast ? "Concert date has passed" : "Prevent further edits"}
                                    </Label>
                                </div>
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
                                        {!isLocked && (
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
                                        )}
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
                        {!isLocked ? (
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
                        ) : (
                            <div className="flex items-center justify-center h-full rounded-md border border-dashed">
                                <div className="text-center text-muted-foreground">
                                    <p>This concert is locked.</p>
                                    <p className="text-xs">Editing is disabled for past or locked concerts.</p>
                                </div>
                            </div>
                        )}
                        </div>
                    </CardContent>
                    <CardContent className="flex justify-end gap-2 pt-6">
                        <Button variant="ghost" onClick={() => router.push('/dashboard/concerts')}>Cancel</Button>
                        <Button onClick={handleSaveChanges} disabled={isLocked}>Save Changes</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
