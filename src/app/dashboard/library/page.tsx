'use client'

import { useUser } from "@/context/user-context"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MusicLibraryClient } from "./client"

export default function LibraryPage() {
  const { songs } = useUser()

  return (
    <div>
      <PageHeader title="Music Library" description={`Manage your collection of ${songs.length} pieces.`}>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Music
        </Button>
      </PageHeader>
      <MusicLibraryClient data={songs} />
    </div>
  )
}
