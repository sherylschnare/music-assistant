
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
import { v4 as uuidv4 } from 'uuid';

export default function ImportPage() {
  const { songs, setSongs } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const songsMap = new Map<string, Song>();
          songs.forEach(s => songsMap.set(s.id, JSON.parse(JSON.stringify(s))));

          let newCount = 0;
          let updatedCount = 0;

          results.data.forEach((row: any) => {
            const rowTitle = (row.Selection || row.Title)?.trim(); 
            if (!rowTitle) return;

            const existingSong = [...songsMap.values()].find(s => s.title.trim().toLowerCase() === rowTitle.toLowerCase());

            const subtypes = row.Subtypes ? row.Subtypes.split(',').map((s: string) => s.trim()) : [];

            if (existingSong) {
              // Update existing song
              const updatedSong = { ...existingSong };
              if (row.Composer) updatedSong.composer = row.Composer;
              if (row.Copyright) updatedSong.copyright = row.Copyright;
              if (row.Type) updatedSong.type = row.Type;
              if (row.Lyricist) updatedSong.lyricist = row.Lyricist;
              if (row.Arranger) updatedSong.arranger = row.Arranger;
              if (row.Publisher) updatedSong.publisher = row.Publisher;
              if (row.CatalogNumber) updatedSong.catalogNumber = row.CatalogNumber;
              if (row.Quantity) updatedSong.quantity = parseInt(row.Quantity, 10) || existingSong.quantity;
              
              if (row.Subtypes) {
                updatedSong.subtypes = subtypes;
              }

              songsMap.set(existingSong.id, updatedSong);
              updatedCount++;
            } else {
              // Create new song
              const newSong: Song = {
                id: uuidv4(),
                title: rowTitle,
                composer: row.Composer || '',
                copyright: row.Copyright || '',
                type: row.Type || 'Uncategorized',
                lyricist: row.Lyricist || '',
                arranger: row.Arranger || '',
                publisher: row.Publisher || '',
                catalogNumber: row.CatalogNumber || '',
                quantity: parseInt(row.Quantity, 10) || 0,
                subtypes: subtypes,
                performanceHistory: [],
              };
              songsMap.set(newSong.id, newSong);
              newCount++;
            }
          });

          await setSongs(Array.from(songsMap.values()));

          toast({
            title: "Import successful",
            description: `${newCount} new songs added and ${updatedCount} songs updated in your library.`,
          });
        } catch (error) {
          console.error("Error importing songs:", error);
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "An error occurred while importing the songs. Please check the console.",
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

  return (
    <div>
      <PageHeader
        title="Import Music Library"
        description="Upload a CSV file to add or update songs in your library."
      />
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            The CSV file should have a 'Selection' or 'Title' column. It will update existing songs or create new ones. Supported columns: Composer, Copyright, Type, Lyricist, Arranger, Publisher, CatalogNumber, Quantity, Subtypes (comma-separated).
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
            Import Songs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
