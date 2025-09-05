export type Song = {
  id: string;
  title: string;
  composer: string;
  lyricist: string;
  arranger: string;
  copyright: string;
  publisher: string;
  catalogNumber: string;
  quantity: number;
  type: 'Choral' | 'Orchestral' | 'Band' | 'Solo' | 'Chamber' | 'Christmas';
  lastPerformed?: string;
  performanceHistory: { date: string; concertName: string }[];
};

export type Concert = {
  id: string;
  name: string;
  date: string;
  pieces: Song[];
  isLocked?: boolean;
};

export type User = {
  id: string;
  name: string;
  role: 'Music Director' | 'Librarian' | 'Musician';
  email: string;
  password?: string;
}
