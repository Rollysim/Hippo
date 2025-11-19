import React, { useState, useCallback } from 'react';
import { generateCardMetadata } from '../services/geminiService';
import { CardData } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface InputSectionProps {
  onSave: (card: CardData) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSave }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const metadata = await generateCardMetadata(text);
      
      const newCard: CardData = {
        id: uuidv4(),
        content: text,
        title: metadata.title,
        summary: metadata.summary,
        keywords: metadata.keywords || [],
        question: metadata.question,
        createdAt: Date.now(),
        nextReviewAt: Date.now() + (24 * 60 * 60 * 1000), // First review tomorrow
        interval: 1,
        reviewCount: 0,
        status: 'new'
      };

      onSave(newCard);
      setText('');
    } catch (e) {
      setError("Couldn't process that. Try again or check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [text, onSave]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste something you want to remember..."
          className="w-full h-48 p-6 rounded-3xl bg-white text-slate-700 placeholder-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-hippo-300 resize-none text-lg transition-all duration-300 ease-in-out"
          disabled={isLoading}
        />
        
        {/* Floating Save Button */}
        {text.length > 0 && (
          <div className="absolute bottom-4 right-4">
             <button
              onClick={handleSave}
              disabled={isLoading}
              className={`
                bg-hippo-600 text-white px-6 py-2 rounded-full font-medium shadow-lg 
                transition-all duration-200 flex items-center gap-2 hover:bg-hippo-700 active:scale-95
                ${isLoading ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg animate-pulse">
          {error}
        </div>
      )}
      
      {!text && !isLoading && (
        <p className="text-center text-hippo-300 text-sm mt-2">
          HIPO will auto-generate a title, summary, and quiz.
        </p>
      )}
    </div>
  );
};