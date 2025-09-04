import { songs } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MusicLibraryClient } from "./client"

export default async function LibraryPage() {
  const data = songs

  return (
    <div>
      <PageHeader title="Music Library" description={`Manage your collection of ${data.length} pieces.`}>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Music
        </Button>
      </PageHeader>
      <MusicLibraryClient data={data} />
    </div>
  )
}
