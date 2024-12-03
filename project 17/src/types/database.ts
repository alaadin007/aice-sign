import type { KIUResult } from '../utils/kiu';

export interface Certificate {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string;
  score: number;
  date: Date;
  originalText: string;
  kiu: KIUResult;
  source?: {
    type: 'text' | 'youtube';
    id?: string;
    url?: string;
  };
}

export interface LearningMaterial {
  id: string;
  userId: string;
  text: string;
  title: string;
  date: Date;
  kiu: KIUResult;
  source: {
    type: 'text' | 'youtube';
    id?: string;
    url?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAt: Date;
}