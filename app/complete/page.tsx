/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Star, Home, Send, ChefHat, Sparkles, Check, MessageCircle } from "lucide-react";

export default function MealCompletePage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("Your Dish");

  useEffect(() => {
    const stored = localStorage.getItem("currentRecipe");
    if (stored) {
      const parsed = JSON.parse(stored);
      setRecipeTitle(parsed.title || "Your Dish");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    const newEntry = {
      title: recipeTitle,
      rating: rating,
      feedback: feedback,
      date: new Date().toISOString(),
    };

    const existingHistory = JSON.parse(localStorage.getItem("cookingHistory") || "[]");
    const updatedHistory = [newEntry, ...existingHistory];
    localStorage.setItem("cookingHistory", JSON.stringify(updatedHistory));
    
    setIsSubmitted(true);
  };

  return (
    <Shell className="min-h-screen bg-stone-50 overflow-hidden relative flex flex-col items-center justify-center py-12">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          
          {/* Floating Confetti */}
          <div className="absolute top-1/4 left-1/4 text-4xl animate-bounce-slow opacity-20">🎉</div>
          <div className="absolute top-1/3 right-1/4 text-5xl animate-pulse opacity-20 delay-700">✨</div>
          <div className="absolute bottom-1/3 left-1/3 text-3xl animate-bounce opacity-20 delay-1000">🍳</div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10 space-y-4 animate-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex p-5 bg-white shadow-xl rounded-full mb-2">
                <ChefHat className="w-12 h-12 text-stone-800" />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 tracking-tight">
                Bon Appétit!
            </h1>
            <p className="text-xl text-stone-500 font-light">
                You successfully cooked <span className="font-semibold text-emerald-700">{recipeTitle}</span>.
            </p>
        </div>

        {/* Feedback Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in duration-500 delay-150">
            
            {/* AI Message Header */}
            <div className="bg-stone-50/80 p-6 md:p-8 flex items-start gap-5 border-b border-stone-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                        <h3 className="font-bold text-stone-800 text-lg">Chef Susie</h3>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">AI Chef</span>
                    </div>
                    <div className="mt-2 bg-white p-4 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm text-stone-600 leading-relaxed relative">
                        <p>That smells amazing! 👩‍🍳 <br/> Be honest—how did it turn out? Your feedback helps me learn your taste for next time.</p>
                        <div className="absolute top-0 left-0 -translate-x-2 -translate-y-2 w-4 h-4 bg-white border-t border-l border-stone-100 transform -rotate-45"></div>
                    </div>
                </div>
            </div>

            {/* User Interaction Area */}
            <div className="p-6 md:p-8 bg-white">
                
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Star Rating */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <Star 
                                        className={`w-10 h-10 transition-colors ${
                                            (hoverRating || rating) >= star 
                                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm' 
                                            : 'text-stone-200'
                                        }`} 
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm font-medium text-stone-400 uppercase tracking-wider">
                            {rating === 0 ? "Rate the Dish" : rating === 5 ? "It was perfect!" : rating >= 4 ? "Delicious" : "Could be better"}
                        </p>

                        {/* Input Field */}
                        <div className="relative group">
                            <div className="absolute top-4 left-4 text-stone-400">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Too salty? Needs more spice? Tell me..."
                                className="w-full p-4 pl-12 pr-14 rounded-2xl bg-stone-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:ring-0 outline-none resize-none h-32 transition-all text-stone-700 placeholder:text-stone-400"
                                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                            />
                            <button 
                                type="submit"
                                disabled={!feedback || rating === 0}
                                className="absolute bottom-3 right-3 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Success State */
                    <div className="py-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                            <Check className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-stone-800">Feedback Saved!</h3>
                            <p className="text-stone-500 mt-2 max-w-xs mx-auto">
                                I've updated your <span className="font-semibold text-emerald-600">Taste Profile</span>. Next time, I'll adjust the recipe to fit your style perfectly.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center">
            <button
                onClick={() => router.push("/")}
                className="w-full md:w-auto px-12 py-4 bg-white text-stone-600 border-2 border-white hover:border-stone-200 rounded-4xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <Home className="w-5 h-5" />
                Back to Kitchen
            </button>
        </div>

      </div>
    </Shell>
  );
}