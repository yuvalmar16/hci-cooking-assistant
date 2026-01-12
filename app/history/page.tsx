/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { ArrowLeft, Star, Calendar, Trash2, ChefHat, Sparkles, Quote, RotateCcw, Loader2 } from "lucide-react";

interface HistoryItem {
  title: string;
  rating: number;
  feedback: string;
  date: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingTitle, setLoadingTitle] = useState<string | null>(null); // Tracks which item is regenerating
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cookingHistory");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const clearHistory = () => {
    if (confirm("Are you sure you want to erase your culinary journal?")) {
      localStorage.removeItem("cookingHistory");
      setHistory([]);
    }
  };

  const handleCookAgain = async (item: HistoryItem) => {
    setLoadingTitle(item.title);

    // 1. Prepare Context (History)
    const rawHistory = localStorage.getItem("cookingHistory");
    let formattedHistory = "";
    if (rawHistory) {
      try {
        const historyItems = JSON.parse(rawHistory);
        formattedHistory = historyItems.slice(0, 3).map((h: any) => 
          `- When cooking "${h.title}", User rated it ${h.rating}/5: "${h.feedback}"`
        ).join("\n");
      } catch (e) { console.error(e); }
    }

    try {
      // 2. Call API
      // We send the Title as the "data" effectively telling AI: "Make this dish"
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "ingredients", // We treat the title as a specific ingredient request
          data: item.title,
          history: formattedHistory,
          selectedOption: item.title // Hint to the AI to stick to this specific dish
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert("Could not load recipe: " + data.error);
        setLoadingTitle(null);
        return;
      }

      // 3. Success: Set Data & Redirect
      localStorage.setItem("currentRecipe", JSON.stringify(data));
      localStorage.setItem("cookingStep", "0");
      // We save the title as the "ingredients" so if they hit back, it makes sense
      localStorage.setItem("lastIngredients", JSON.stringify([item.title])); 
      localStorage.setItem("cookingMode", "ingredients");
      
      router.push("/overview");

    } catch (e) {
      console.error(e);
      alert("Connection failed.");
      setLoadingTitle(null);
    }
  };

  return (
    <Shell className="min-h-screen bg-stone-50 relative">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-96 bg-linear-to-b from-stone-200/50 to-stone-50 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto pt-8 pb-24 px-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => router.push("/home")} 
              className="group flex items-center gap-2 text-stone-400 hover:text-stone-800 font-bold text-xs uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back Home
            </button>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-3">
              Culinary Journal <ChefHat className="w-10 h-10 text-emerald-600/20" />
            </h1>
            <p className="text-stone-500 mt-2 text-lg font-light">
              A record of the dishes you've mastered.
            </p>
          </div>

          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all text-sm font-bold active:scale-95"
            >
              <Trash2 className="w-4 h-4" /> Clear History
            </button>
          )}
        </div>

        {/* --- CONTENT --- */}
        {history.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-[3rem] bg-white/50">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">No meals yet</h3>
            <p className="text-stone-500 max-w-md mx-auto">
              Once you finish cooking a dish and rate it, it will appear here in your personal journal.
            </p>
            <button 
                onClick={() => router.push("/home")}
                className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all"
            >
                Start Cooking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-8 border border-stone-100 shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded-md">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                            />
                        ))}
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-stone-800 font-serif leading-tight mb-6 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.title}
                </h3>

                <div className="relative bg-stone-50 p-5 rounded-2xl mb-6">
                    <Quote className="w-8 h-8 text-stone-200 absolute -top-3 -left-2 fill-stone-100" />
                    <p className="text-stone-600 text-sm italic relative z-10 line-clamp-3">
                        "{item.feedback}"
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-stone-100">
                    <button 
                        onClick={() => handleCookAgain(item)}
                        disabled={loadingTitle !== null}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-white border-2 border-stone-100 text-stone-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {loadingTitle === item.title ? (
                            <><Loader2 className="w-4 h-4 animate-spin"/> Preparing...</>
                        ) : (
                            <><RotateCcw className="w-4 h-4" /> Cook Again</>
                        )}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </Shell>
  );
}