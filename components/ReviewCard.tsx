import React, { useState } from 'react';
import { CardData, ReviewRating } from '../types';

interface ReviewCardProps {
  card: CardData;
  onReview: (rating: ReviewRating) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ card, onReview }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleRating = (rating: ReviewRating) => {
    // Reset state for next card (though parent usually unmounts this)
    setIsRevealed(false);
    onReview(rating);
  };

  return (
    <div className="w-full max-w-md mx-auto h-[60vh] flex flex-col relative">
      {/* Card Surface */}
      <div className="flex-1 bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-center items-center text-center transition-all duration-500">
        
        <span className="absolute top-8 text-xs font-bold tracking-widest text-hippo-300 uppercase">
          Recall Question
        </span>

        <h2 className="text-2xl font-semibold text-slate-800 mb-6 leading-snug">
          {card.question}
        </h2>

        {isRevealed && (
          <div className="animate-fade-in-up mt-4 w-full">
            <div className="h-px w-12 bg-hippo-100 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              {card.summary}
            </p>
             <div className="flex flex-wrap gap-2 justify-center mt-4">
              {card.keywords.map(k => (
                <span key={k} className="text-xs bg-hippo-50 text-hippo-600 px-2 py-1 rounded-md">#{k}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 h-20">
        {!isRevealed ? (
          <button
            onClick={() => setIsRevealed(true)}
            className="w-full bg-slate-800 text-white py-4 rounded-2xl font-semibold shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
          >
            Show Answer
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-4 h-full">
            <button
              onClick={() => handleRating(ReviewRating.FORGOT)}
              className="bg-red-100 text-red-600 rounded-2xl font-medium hover:bg-red-200 transition-colors flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">😓</span>
              <span>Forgot</span>
            </button>
            <button
              onClick={() => handleRating(ReviewRating.HARD)}
              className="bg-amber-100 text-amber-700 rounded-2xl font-medium hover:bg-amber-200 transition-colors flex flex-col items-center justify-center"
            >
               <span className="text-2xl mb-1">🤔</span>
               <span>Hard</span>
            </button>
            <button
              onClick={() => handleRating(ReviewRating.EASY)}
              className="bg-emerald-100 text-emerald-700 rounded-2xl font-medium hover:bg-emerald-200 transition-colors flex flex-col items-center justify-center"
            >
               <span className="text-2xl mb-1">⚡️</span>
               <span>Easy</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};