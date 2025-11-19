export interface CardData {
  id: string;
  content: string;
  title: string;
  summary: string;
  keywords: string[];
  question: string;
  createdAt: number;
  nextReviewAt: number;
  interval: number; // in days
  reviewCount: number;
  status: 'new' | 'active' | 'mastered';
}

export interface WeeklyStats {
  cardsCreated: number;
  reviewSuccessRate: number;
  highlight: string;
  suggestion: string;
}

export enum ViewState {
  HOME = 'HOME',
  REVIEW = 'REVIEW',
  WEEKLY = 'WEEKLY',
}

export enum ReviewRating {
  FORGOT = 'FORGOT',
  HARD = 'HARD',
  EASY = 'EASY',
}