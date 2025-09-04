'use client'

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud } from "lucide-react"

export default function ImportPage() {
  return (
    <div>
      <PageHeader
        title="Import Music Data"
        description="Upload your Excel files to populate your music library."
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload Your Files</CardTitle>
            <CardDescription>Drag and drop your Excel files here or click to browse.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">XLSX, XLS, or CSV files</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Note: The file import functionality is for demonstration purposes. Uploaded files will not be processed on the server.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">File Format Instructions</CardTitle>
            <CardDescription>Ensure your Excel files have the correct columns for a successful import.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Purchase Information Sheet</h4>
              <p className="text-muted-foreground">Columns should be named exactly as follows:</p>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                <li>Quantity required</li>
                <li>Title Composer; Lyricist; Arranger</li>
                <li>Copyright Arrangement</li>
                <li>Publisher/Distributor Catalog Number</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Inventory Sheet</h4>
              <p className="text-muted-foreground">Columns should be named exactly as follows:</p>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                <li>Selection</li>
                <li>Type</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Performance History Sheet</h4>
              <p className="text-muted-foreground">Columns should be named exactly as follows:</p>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                <li>Song</li>
                <li>Performed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
