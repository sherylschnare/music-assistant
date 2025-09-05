
'use client'

import React, { useState } from 'react';
import Papa from 'papaparse';
import { useUser } from '@/context/user-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';
import { Loader2, Upload } from 'lucide-react';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

function parsePerformedDate(performed: string): [Date | null, string] {
    const parts = performed.split(' ');
    if (parts.length !== 2) return [null, performed];
    
    const term = parts[0];
    const year = parseInt(parts[1]);

    if(isNaN(year)) return [null, performed];

    let month = 0; // January
    if (term.toLowerCase().startsWith('spring')) {
        month = 3; // April
    } else if (term.toLowerCase().startsWith('summer')) {
        month = 6; // July
    } else if (term.toLowerCase().startsWith('fall') || term.toLowerCase().startsWith('autumn')) {
        month = 9; // October
    } else if (term.toLowerCase().startsWith('christmas') || term.toLowerCase().startsWith('winter')) {
        month = 11; // December
    }

    try {
        return [new Date(year, month, 1), performed];
    } catch (e) {
        return [null, performed];
    }
}


export default function ImportHistoryPage() {
  const { songs, setSongs, user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (user.role !== 'Music Director') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to import.",
      });
      return;
    }
    if (songs.length === 0) {
        toast({
            variant: "destructive",
            title: "No songs in library",
            description: "Please import your music library before importing performance history.",
        });
        return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const performanceData = results.data as { Song: string; Performed: string }[];
          const updatedSongs = new Map<string, Song>();
          songs.forEach(s => updatedSongs.set(s.id, JSON.parse(JSON.stringify(s))));

          let matchedCount = 0;

          performanceData.forEach(row => {
            const songTitle = row.Song?.trim();
            const performed = row.Performed?.trim();

            if (!songTitle || !performed) return;

            const songToUpdate = [...updatedSongs.values()].find(s => s.title.trim().toLowerCase() === songTitle.toLowerCase());
            
            if (songToUpdate) {
                matchedCount++;
                const [parsedDate, concertName] = parsePerformedDate(performed);

                if (!songToUpdate.performanceHistory) {
                    songToUpdate.performanceHistory = [];
                }
                
                const performanceExists = songToUpdate.performanceHistory.some(p => p.concertName === concertName);

                if (!performanceExists && parsedDate) {
                    songToUpdate.performanceHistory.push({ date: parsedDate.toISOString(), concertName });

                    // Update lastPerformed if this performance is the latest one
                    if (!songToUpdate.lastPerformed || new Date(songToUpdate.lastPerformed) < parsedDate) {
                        songToUpdate.lastPerformed = parsedDate.toISOString();
                    }
                }
            }
          });

          // Firestore update logic
          const batch = writeBatch(db);
          updatedSongs.forEach(song => {
             const docRef = doc(db, 'songs', song.id);
             batch.set(docRef, song);
          });
          await batch.commit();

          // This will trigger a re-fetch in the context
          setSongs(Array.from(updatedSongs.values()));

          toast({
            title: "Import successful",
            description: `Matched and updated ${matchedCount} of ${performanceData.length} performance records.`,
          });

        } catch (error) {
          console.error("Error importing history:", error);
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "An error occurred. Please check the console.",
          });
        } finally {
          setLoading(false);
          setFile(null);
        }
      },
      error: (error: any) => {
        console.error("CSV parsing error:", error);
        toast({
          variant: "destructive",
          title: "Parsing error",
          description: "Could not parse the CSV file. Please check its format.",
        });
        setLoading(false);
      },
    });
  };
  
  if (user.role !== 'Music Director') {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Import Performance History"
        description="Upload a CSV with 'Song' and 'Performed' columns to update your library."
      />
      <Card>
        <CardHeader>
          <CardTitle>Upload Performance History CSV</CardTitle>
          <CardDescription>
            The system will match songs by title and update their performance history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs" />
          </div>
          {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
          <Button onClick={handleImport} disabled={loading || !file}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
