export interface Ayah {
  surah: string;
  ayahFrom: number;
  ayahTo: number;
  text: string;
}

export interface TafsirBook {
  id: string;
  name: string;
  author: string;
  century?: string;
  defaultSelected: boolean;
}

export type Book = TafsirBook;

export interface TafsirEntry {
  bookId: string;
  ayahRef: string;
  text: string;
  isPlaceholder?: boolean;
}

export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
}

import { MessageIntent } from './messages';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  intent?: MessageIntent;
  suggestions?: string[];
  ayah?: Ayah;
  tafsirs?: TafsirEntry[];
  leadLine?: string;
  createdAt: string;
  isSearching?: boolean;
  hasError?: boolean;
  isEmpty?: boolean;
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
}

export interface Chat {
  id: string;
  title: string;
  projectId?: string;
  createdAt: string;
  messages: Message[];
  selectedBookIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  notes: string;
}

export interface SavedSource {
  id: string;
  projectId: string;
  ayahRef: string;
  surah: string;
  ayahText: string;
  ayahNumberText: string;
  bookId: string;
  bookName: string;
  author: string;
  text: string;
  savedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  preferredBookIds: string[];
  theme: 'system' | 'light' | 'dark';
}
