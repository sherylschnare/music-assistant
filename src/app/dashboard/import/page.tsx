
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
  const { songs, addSongs } = useUser();
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
          const newSongs: Song[] = results.data.map((row: any) => {
            // Map CSV columns to Song properties
            return {
              id: uuidv4(),
              title: row.Title || '',
              composer: row.Composer || '',
              copyright: row.Copyright || '',
              type: row.Type ? 'Choral' : 'Orchestral', // Basic logic, can be improved
              lyricist: '',
              arranger: '',
              publisher: '',
              catalogNumber: '',
              quantity: 0,
              performanceHistory: [],
            };
          }).filter(song => song.title); // Filter out rows without a title

          await addSongs(newSongs);

          toast({
            title: "Import successful",
            description: `${newSongs.length} songs have been added to your library.`,
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
        description="Upload a CSV file to add multiple songs to your library at once."
      />
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            The CSV file should have columns for at least 'Title', 'Composer', and 'Copyright'.
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
