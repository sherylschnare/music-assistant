
'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Library, Music, LogOut } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { user, songs, concerts, loading, setUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to login if not authenticated and loading is finished
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setUser(null);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push('/');
  }

  if (loading || !user) {
    return (
      <div>
        <PageHeader 
          title="Welcome!"
          description="Loading your orchestra's activity..."
        >
          <div className="flex items-center gap-4">
             <Skeleton className="h-10 w-36" />
             <Skeleton className="h-10 w-28" />
          </div>
        </PageHeader>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pieces</CardTitle>
                     <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-40 mt-1" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Concerts Planned</CardTitle>
                     <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-32 mt-1" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Concert</CardTitle>
                     <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-36 mt-1" />
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  const upcomingConcert = concerts.length > 0
    ? [...concerts]
        .filter(c => new Date(c.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  const recentlyPerformed = songs.filter(s => s.lastPerformed).sort((a,b) => new Date(b.lastPerformed!).getTime() - new Date(a.lastPerformed!).getTime()).slice(0, 5);

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user.name}!`}
        description="Here's a snapshot of your orchestra's activity."
      >
        <div className="flex items-center gap-4">
           <Button asChild>
            <Link href="/dashboard/library/song-form-dialog">
              <Plus className="mr-2 h-4 w-4" /> Add New Music
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
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
            <CardDescription>A look at pieces performed in recent concerts.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyPerformed.length > 0 ? (
                <ul className="space-y-3">
                    {recentlyPerformed.map(song => (
                        <li key={song.id} className="flex justify-between items-center text-sm">
                            <div>
                                <span className="font-medium">{song.title}</span> by {song.composer}
                            </div>
                            <span className="text-muted-foreground">{new Date(song.lastPerformed!).toLocaleDateString()}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No recent performance data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
