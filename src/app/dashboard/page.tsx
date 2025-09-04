
'use client'

import Link from "next/link";
import { Plus, Library, Music } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useUser } from "@/context/user-context";

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, songs, concerts } = useUser();

  if (!concerts || !songs) {
    return null; // Or a loading indicator
  }

  const upcomingConcert = concerts.length > 0 ? [...concerts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] : null;
  const recentlyPerformed = songs.filter(s => s.lastPerformed).sort((a,b) => new Date(b.lastPerformed!).getTime() - new Date(a.lastPerformed!).getTime()).slice(0, 5);
  
  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}!`} description="Here's a snapshot of your orchestra's activity.">
        <Button asChild>
          <Link href="/dashboard/library">
            <Plus className="mr-2 h-4 w-4" /> Add New Music
          </Link>
        </Button>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard title="Total Pieces" value={songs.length.toString()} icon={Library} description="Music pieces in your library" />
        <StatCard title="Concerts Planned" value={concerts.length.toString()} icon={Music} description="Total concerts in history" />
        {upcomingConcert ? (
          <StatCard title="Upcoming Concert" value={new Date(upcomingConcert.date).toLocaleDateString()} icon={Music} description={`Next up: ${upcomingConcert.name}`} />
        ) : (
          <StatCard title="Upcoming Concert" value="N/A" icon={Music} description="No concerts scheduled" />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {upcomingConcert ? (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Concert: {upcomingConcert.name}</CardTitle>
              <CardDescription>{new Date(upcomingConcert.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {upcomingConcert.pieces.map(piece => (
                  <li key={piece.id} className="text-sm text-muted-foreground">{piece.title} - <span className="italic">{piece.composer}</span></li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
           <Card>
            <CardHeader>
              <CardTitle>No Upcoming Concerts</CardTitle>
              <CardDescription>Create a new concert program to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/concerts">Create a Concert</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Recently Performed</CardTitle>
            <CardDescription>A look at what you've played recently.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyPerformed.length > 0 ? (
              <div className="space-y-4">
                {recentlyPerformed.map(song => (
                  <div key={song.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{song.title}</p>
                      <p className="text-sm text-muted-foreground">{song.composer}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm">
                      {song.lastPerformed ? new Date(song.lastPerformed).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recently performed pieces.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
