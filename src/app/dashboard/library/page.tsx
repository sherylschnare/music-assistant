
'use client'

import React from "react"
import { useUser } from "@/context/user-context"
import { PageHeader } from "@/components/page-header"
import { MusicLibraryClient } from "./client"
import { SongFormDialog } from "./song-form-dialog"
import type { Song } from "@/lib/types"

export default function LibraryPage() {
  const { songs, addSongs } = useUser();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingSong, setEditingSong] = React.useState<Song | undefined>(undefined)

  const handleAddSong = () => {
    setEditingSong(undefined)
    setIsDialogOpen(true)
  }

  const handleSaveSong = async (songToSave: Omit<Song, 'id' | 'performanceHistory' | 'lastPerformed'>) => {
    const newSong: Song = {
        ...songToSave,
        id: crypto.randomUUID(),
        performanceHistory: [],
    };
    await addSongs([newSong]);
  }

  return (
    <div>
      <PageHeader title="Music Library" description={`Manage your collection of ${songs.length} pieces.`}>
        <SongFormDialog 
          onSave={handleSaveSong}
          trigger={<div />} 
        />
      </PageHeader>
      <MusicLibraryClient data={songs} />
    </div>
  )
}
