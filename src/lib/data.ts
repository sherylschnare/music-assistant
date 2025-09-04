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

export const songs: Song[] = [];

export const concerts: Concert[] = [];
