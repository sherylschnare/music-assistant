
'use client'

import React from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, File as FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ImportPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    // Basic validation for allowed file types
    const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      // You could show a toast notification here for invalid file types
      console.warn("Invalid file type selected.");
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

  return (
    <div>
      <PageHeader
        title="Import Music Library"
        description="Upload a file to populate your music library."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload Your File</CardTitle>
            <CardDescription>Drag and drop your file here or click to browse.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              accept=".xlsx, .xls, .csv"
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
                  <p className="text-xs text-muted-foreground">XLSX, XLS, or CSV files</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-muted">
                <FileIcon className="w-12 h-12 text-primary" />
                <p className="mt-4 font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                <div className="mt-4 flex gap-2">
                    <Button onClick={() => { /* Implement upload logic here */ }}>Upload File</Button>
                    <Button variant="ghost" onClick={onRemoveFile}>
                        <X className="mr-2 h-4 w-4" /> Remove
                    </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">Note: The file import functionality is for demonstration purposes. Uploaded files will not be processed on the server.</p>
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
