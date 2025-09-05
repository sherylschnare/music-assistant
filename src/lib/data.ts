import type { Song, Concert, User } from './types';

export const users: User[] = [
  {
    id: '1',
    name: 'Sheryl Schnare',
    role: 'Music Director',
    email: 'sherylschnare@birdsongstudio.ca',
  },
  {
    id: '2',
    name: 'David Reed',
    role: 'Librarian',
    email: 'david.reed@example.com',
  },
  {
    id: '3',
    name: 'Maria Rossi',
    role: 'Musician',
    email: 'maria.rossi@example.com',
  },
];

export const songs: Song[] = [
    {
    id: '1',
    title: 'Symphony No. 5',
    composer: 'Ludwig van Beethoven',
    lyricist: 'N/A',
    arranger: 'N/A',
    copyright: 'Public Domain',
    publisher: 'Breitkopf & Härtel',
    catalogNumber: 'Op. 67',
    quantity: 1,
    type: 'Orchestral',
    lastPerformed: '2023-10-28',
    performanceHistory: [{ date: '2023-10-28', concertName: 'Fall Classics' }],
  },
  {
    id: '2',
    title: 'The Four Seasons',
    composer: 'Antonio Vivaldi',
    lyricist: 'N/A',
    arranger: 'N/A',
    copyright: 'Public Domain',
    publisher: 'Ricordi',
    catalogNumber: 'Op. 8, RV 269',
    quantity: 1,
    type: 'Orchestral',
    lastPerformed: '2023-10-28',
    performanceHistory: [{ date: '2023-10-28', concertName: 'Fall Classics' }],
  },
  {
    id: '3',
    title: 'Eine kleine Nachtmusik',
    composer: 'Wolfgang Amadeus Mozart',
    lyricist: 'N/A',
    arranger: 'N/A',
    copyright: 'Public Domain',
    publisher: 'N/A',
    catalogNumber: 'K. 525',
    quantity: 1,
    type: 'Chamber',
  },
];

export const concerts: Concert[] = [
    {
    id: '1',
    name: 'Fall Classics',
    date: '2023-10-28',
    pieces: songs.slice(0, 2),
  },
  {
    id: '2',
    name: 'Spring Serenade',
    date: '2024-04-15',
    pieces: [songs[2]],
  },
];