
import type { Song, Concert, User } from './types';

// This data is now only used for seeding an empty database.
// The user ID '1' for Sheryl Schnare is a placeholder and will not correspond
// to an actual Firebase Auth UID. A real user account must be created via signup.
export const users: User[] = [];

export const songs: Song[] = [
    {
        id: "1",
        title: "Symphony No. 5",
        composer: "Ludwig van Beethoven",
        lyricist: "",
        arranger: "",
        copyright: "Public Domain",
        publisher: "Breitkopf & Härtel",
        catalogNumber: "Op. 67",
        quantity: 50,
        type: "Orchestral",
        subtypes: ["Classical"],
        lastPerformed: "2023-05-20T00:00:00.000Z",
        performanceHistory: [{ date: "2023-05-20T00:00:00.000Z", concertName: "Spring Classics" }],
    },
    {
        id: "2",
        title: "The Four Seasons",
        composer: "Antonio Vivaldi",
        lyricist: "",
        arranger: "",
        copyright: "Public Domain",
        publisher: "G. Ricordi & C.",
        catalogNumber: "Op. 8",
        quantity: 45,
        type: "Orchestral",
        subtypes: ["Baroque", "Violin Concerto"],
        lastPerformed: "2022-12-15T00:00:00.000Z",
        performanceHistory: [{ date: "2022-12-15T00:00:00.000Z", concertName: "Winter Baroque" }],
    },
    {
        id: "3",
        title: "Hallelujah Chorus",
        composer: "George Frideric Handel",
        lyricist: "Charles Jennens",
        arranger: "",
        copyright: "Public Domain",
        publisher: "Novello & Co",
        catalogNumber: "HWV 56",
        quantity: 60,
        type: "Choral",
        subtypes: ["Christmas", "Easter", "Oratorio"],
        lastPerformed: "2023-12-20T00:00:00.000Z",
        performanceHistory: [{ date: "2023-12-20T00:00:00.000Z", concertName: "Annual Messiah" }, { date: "2022-12-21T00:00:00.000Z", concertName: "Holiday Pops" }],
    }
];

export const concerts: Concert[] = [
    {
        id: "concert-1",
        name: "A Night at the Movies",
        date: "2024-10-26T00:00:00.000Z",
        pieces: songs.slice(0,2),
        isLocked: false,
    },
    {
        id: "concert-2",
        name: "Holiday Pops",
        date: "2024-12-14T00:00:00.000Z",
        pieces: [songs[2]],
        isLocked: true,
    }
];

