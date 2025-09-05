
'use client'

import { useUser } from "@/context/user-context";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditSongForm } from "./edit-song-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SongDetailsPage() {
    const { songs } = useUser();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const song = songs.find(s => s.id === id);

    if (!song) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Song not found.</p>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={song.title}
                description={`Details for ${song.title} by ${song.composer}`}
            >
                <Button variant="outline" asChild>
                    <Link href="/dashboard/library">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Library
                    </Link>
                </Button>
            </PageHeader>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Song Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <EditSongForm song={song} />
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance History</CardTitle>
                            <CardDescription>A log of when this piece was performed.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {song.performanceHistory && song.performanceHistory.length > 0 ? (
                                <ul className="space-y-3">
                                    {song.performanceHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((perf, index) => (
                                        <li key={index} className="flex justify-between items-center text-sm">
                                            <span>{perf.concertName}</span>
                                            <span className="text-muted-foreground">{new Date(perf.date).toLocaleDateString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No performance history recorded for this piece.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
