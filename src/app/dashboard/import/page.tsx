
'use client'

import React from "react"
import Papa from "papaparse"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, File as FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/user-context"
import type { Song } from "@/lib/types"

export default function ImportPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { songs, setSongs } = useUser()

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ["text/csv"];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a CSV file.",
      })
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onRemoveFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const importedSongs: Song[] = results.data.map((row: any, index: number) => {
            const [composer, lyricist, arranger] = (row['Details (Composer, Lyricist, Arranger)'] || ';;').split(';').map((s:string) => s.trim());
            return {
              id: `imported-${Date.now()}-${index}`,
              title: row['Selection'] || 'N/A',
              composer: composer || 'N/A',
              lyricist: lyricist || 'N/A',
              arranger: arranger || 'N/A',
              copyright: row['Copyright / Arrangement'] || 'N/A',
              type: row['Type'] || 'Choral',
              publisher: 'N/A',
              catalogNumber: 'N/A',
              quantity: 1,
              performanceHistory: [],
            }
          });

          // A simple merge strategy: add new songs, don't update existing ones for now.
          const newSongs = [...songs, ...importedSongs];
          setSongs(newSongs);

          toast({
            title: "Import Successful",
            description: `Successfully imported ${importedSongs.length} songs.`,
          });
        } catch (error) {
           toast({
            variant: "destructive",
            title: "Import Failed",
            description: "Could not process the CSV file. Please check the format.",
          });
        } finally {
            onRemoveFile();
        }
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: `An error occurred while parsing: ${error.message}`,
        });
        onRemoveFile();
      }
    });
  }

  return (
    <div>
      <PageHeader
        title="Import Music Library"
        description="Upload a CSV file to populate your music library."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload Your File</CardTitle>
            <CardDescription>Drag and drop your CSV file here or click to browse.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              accept=".csv"
            />
            {!file ? (
               <div
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                onClick={onUploadClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">CSV files only</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-muted">
                <FileIcon className="w-12 h-12 text-primary" />
                <p className="mt-4 font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                <div className="mt-4 flex gap-2">
                    <Button onClick={handleUpload}>Upload File</Button>
                    <Button variant="ghost" onClick={onRemoveFile}>
                        <X className="mr-2 h-4 w-4" /> Remove
                    </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">File Format Instructions</CardTitle>
            <CardDescription>Ensure your file has the correct columns for a successful import. The first row should be the headers.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Required Columns</h4>
              <p className="text-muted-foreground">Columns should be named exactly as follows:</p>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-1">
                <li><span className="font-semibold text-foreground">Selection</span> - The title of the music piece.</li>
                <li><span className="font-semibold text-foreground">Type</span> - The type of music (e.g., Choral, Orchestral).</li>
                <li><span className="font-semibold text-foreground">Details (Composer, Lyricist, Arranger)</span> - All three roles in one cell, separated by semicolons. For example: "Ludwig van Beethoven; N/A; N/A".</li>
                <li><span className="font-semibold text-foreground">Copyright / Arrangement</span> - The copyright information for the piece.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
