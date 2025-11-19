import { CardData, ReviewRating } from '../types';

const STORAGE_KEY = 'hipo_cards_v1';

export const loadCards = (): CardData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load cards", e);
    return [];
  }
};

export const saveCards = (cards: CardData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error("Failed to save cards", e);
  }
};

export const calculateNextReview = (card: CardData, rating: ReviewRating): CardData => {
  const now = Date.now();
  let newInterval = card.interval;
  let newStatus = card.status;

  if (rating === ReviewRating.FORGOT) {
    newInterval = 1;
    newStatus = 'active';
  } else if (rating === ReviewRating.HARD) {
    newInterval = Math.max(1, Math.floor(newInterval * 0.5));
  } else if (rating === ReviewRating.EASY) {
    // Simple spacing algorithm: 1 -> 3 -> 7 -> 21 -> 60
    if (newInterval === 0) newInterval = 1;
    else if (newInterval === 1) newInterval = 3;
    else if (newInterval === 3) newInterval = 7;
    else if (newInterval === 7) newInterval = 21;
    else newInterval = Math.min(newInterval * 2.5, 365);
    
    if (newInterval > 21) newStatus = 'mastered';
  }

  // Calculate next date (midnight of that day to avoid time creep)
  const nextDate = new Date(now + newInterval * 24 * 60 * 60 * 1000);
  nextDate.setHours(4, 0, 0, 0); // 4 AM next interval

  return {
    ...card,
    interval: newInterval,
    nextReviewAt: nextDate.getTime(),
    reviewCount: card.reviewCount + 1,
    status: newStatus,
  };
};

export const getCardsDueForReview = (cards: CardData[]): CardData[] => {
  const now = Date.now();
  return cards.filter(card => card.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt);
};
