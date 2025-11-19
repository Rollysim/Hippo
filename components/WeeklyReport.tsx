import React, { useEffect, useState } from 'react';
import { CardData, WeeklyStats } from '../types';
import { generateWeeklyInsights } from '../services/geminiService';
import { HipoLogo } from './HipoLogo';

interface WeeklyReportProps {
  cards: CardData[];
  onClose: () => void;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ cards, onClose }) => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      // Calculate basic metrics locally
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const newCards = cards.filter(c => c.createdAt > oneWeekAgo);
      const reviewedCards = cards.filter(c => c.reviewCount > 0);
      
      // Mock success rate based on status (since we don't log every review event in this simple prototype)
      const masteredCount = cards.filter(c => c.status === 'mastered').length;
      const activeCount = cards.filter(c => c.status === 'active').length || 1;
      const successRate = Math.min(100, Math.round((masteredCount / (activeCount + masteredCount)) * 100) + 50); // generous calculation for MVP

      try {
        const content = newCards.map(c => c.summary);
        // Fallback if no cards
        const insights = content.length > 0 
            ? await generateWeeklyInsights(content)
            : { highlight: "You haven't added many notes this week.", suggestion: "Try adding one note per day." };

        setStats({
          cardsCreated: newCards.length,
          reviewSuccessRate: successRate > 100 ? 100 : successRate,
          highlight: insights.highlight,
          suggestion: insights.suggestion,
        });
      } catch (e) {
        setStats({
            cardsCreated: newCards.length,
            reviewSuccessRate: 0,
            highlight: "Data unavailable.",
            suggestion: "Check back later."
        })
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [cards]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
        <HipoLogo className="w-12 h-12 text-hippo-300" />
        <p className="text-hippo-400 font-medium">Generating Weekly Insight...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden min-h-[60vh] flex flex-col">
      <div className="bg-hippo-600 p-8 text-white text-center">
        <p className="uppercase tracking-widest text-xs font-semibold opacity-80 mb-2">Weekly Report</p>
        <h2 className="text-3xl font-bold">Growth Check</h2>
      </div>

      <div className="p-8 flex-1 flex flex-col gap-8">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-hippo-50 p-4 rounded-2xl text-center">
            <p className="text-3xl font-bold text-hippo-600">{stats?.cardsCreated}</p>
            <p className="text-sm text-slate-500">New Cards</p>
          </div>
          <div className="bg-hippo-50 p-4 rounded-2xl text-center">
            <p className="text-3xl font-bold text-hippo-600">{stats?.reviewSuccessRate}%</p>
            <p className="text-sm text-slate-500">Retention</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Remember This</h3>
            <p className="text-slate-700 italic text-lg leading-relaxed">
              "{stats?.highlight}"
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Next Week</h3>
            <p className="text-slate-700">
              {stats?.suggestion}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100">
        <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
        >
            Close Report
        </button>
      </div>
    </div>
  );
};