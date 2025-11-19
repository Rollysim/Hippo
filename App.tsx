import React, { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // In case we need local ID gen
import { CardData, ViewState, ReviewRating } from './types';
import { loadCards, saveCards, calculateNextReview, getCardsDueForReview } from './services/storageService';
import { HipoLogo } from './components/HipoLogo';
import { InputSection } from './components/InputSection';
import { ReviewCard } from './components/ReviewCard';
import { WeeklyReport } from './components/WeeklyReport';

const App: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [reviewQueue, setReviewQueue] = useState<CardData[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Load initial data
  useEffect(() => {
    const loaded = loadCards();
    setCards(loaded);
  }, []);

  // Update Review Queue when cards change or view changes to home
  useEffect(() => {
    if (view === ViewState.HOME) {
      const due = getCardsDueForReview(cards);
      // Limit to 3 for the "Daily 3" concept
      setReviewQueue(due.slice(0, 3)); 
    }
  }, [cards, view]);

  const handleSaveCard = useCallback((newCard: CardData) => {
    const updated = [newCard, ...cards];
    setCards(updated);
    saveCards(updated);
  }, [cards]);

  const startReview = () => {
    if (reviewQueue.length > 0) {
      setCurrentReviewIndex(0);
      setView(ViewState.REVIEW);
    }
  };

  const handleReviewRating = (rating: ReviewRating) => {
    const currentCard = reviewQueue[currentReviewIndex];
    const updatedCard = calculateNextReview(currentCard, rating);
    
    // Update local state
    const updatedCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(updatedCards);
    saveCards(updatedCards);

    // Next card or finish
    if (currentReviewIndex < reviewQueue.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
    } else {
      // Finished session
      setView(ViewState.HOME);
      // Optional: could show a "Session Complete" splash here
    }
  };

  // Calculate simplistic "Is it Sunday?" for Weekly Report button visibility
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 h-full flex flex-col">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-hippo-600 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
          <HipoLogo className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">HIPO</span>
        </div>
        
        {view === ViewState.HOME && isSunday && (
          <button 
            onClick={() => setView(ViewState.WEEKLY)}
            className="text-xs font-semibold text-hippo-500 bg-hippo-100 px-3 py-1 rounded-full hover:bg-hippo-200"
          >
            Weekly Report Available
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        
        {/* VIEW: HOME */}
        {view === ViewState.HOME && (
          <div className="flex flex-col h-full">
            
            {/* Actionable Insight: Review Prompt */}
            {reviewQueue.length > 0 ? (
              <div className="mb-8 animate-fade-in">
                <div className="bg-white p-6 rounded-3xl shadow-md border border-hippo-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Time to remember</h2>
                    <p className="text-slate-500 text-sm">You have {reviewQueue.length} cards for today.</p>
                  </div>
                  <button 
                    onClick={startReview}
                    className="bg-hippo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-md hover:bg-hippo-700 active:scale-95 transition-all"
                  >
                    Start
                  </button>
                </div>
              </div>
            ) : (
               <div className="mb-8 text-center py-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">You're all caught up for today! 🎉</p>
               </div>
            )}

            {/* Input Area */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <InputSection onSave={handleSaveCard} />
            </div>

            {/* Recent Cards (Bottom List) */}
            <div className="mt-12 pb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recently Saved</h3>
              <div className="space-y-3">
                {cards.slice(0, 3).map(card => (
                  <div key={card.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="w-1 h-8 bg-hippo-200 rounded-full"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 text-sm truncate">{card.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{new Date(card.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                    <p className="text-center text-slate-300 text-sm">No memories yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REVIEW */}
        {view === ViewState.REVIEW && reviewQueue.length > 0 && (
          <div className="h-full flex flex-col justify-center animate-slide-up">
            <div className="mb-4 text-center text-sm font-medium text-slate-400">
              Card {currentReviewIndex + 1} of {reviewQueue.length}
            </div>
            <ReviewCard 
              key={reviewQueue[currentReviewIndex].id} // Key forces re-mount on index change
              card={reviewQueue[currentReviewIndex]} 
              onReview={handleReviewRating} 
            />
          </div>
        )}

        {/* VIEW: WEEKLY */}
        {view === ViewState.WEEKLY && (
          <div className="animate-fade-in h-full flex flex-col justify-center">
            <WeeklyReport cards={cards} onClose={() => setView(ViewState.HOME)} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;