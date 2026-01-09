/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Star, Home, Send, ChefHat, RotateCcw, Loader2 } from "lucide-react";

export default function MealCompletePage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("Your Dish");
  const [isRetrying, setIsRetrying] = useState(false);

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

  const handleCookAgain = async () => {
    setIsRetrying(true);
    const mode = localStorage.getItem("cookingMode");
    let inputData = "";

    if (mode === "recipe") {
        inputData = localStorage.getItem("lastRecipeText") || "";
    } else {
        const rawIng = localStorage.getItem("lastIngredients");
        if (rawIng) inputData = JSON.parse(rawIng).join(", ");
    }

    if (!inputData) {
        alert("Could not find previous ingredients. Please start over.");
        router.push("/");
        return;
    }

    const rawHistory = localStorage.getItem("cookingHistory");
    let formattedHistory = "";
    if (rawHistory) {
      try {
        const historyItems = JSON.parse(rawHistory);
        formattedHistory = historyItems.slice(0, 3).map((item: any) => 
          `- When cooking "${item.title}", User rated it ${item.rating}/5 and said: "${item.feedback}"`
        ).join("\n");
      } catch (e) { console.error(e); }
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: mode || "ingredients", 
          data: inputData, 
          history: formattedHistory 
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        setIsRetrying(false);
      } else {
        localStorage.setItem("currentRecipe", JSON.stringify(data));
        
        // *** CRITICAL FIX: FORCE RESET TO STEP 0 ***
        localStorage.setItem("cookingStep", "0");

        router.push("/overview");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to restart. Please try again.");
      setIsRetrying(false);
    }
  };

  return (
    <Shell>
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 pb-20 relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-10 left-[20%] text-emerald-200 animate-bounce-slow text-4xl">🎉</div>
             <div className="absolute top-40 right-[15%] text-orange-200 animate-pulse text-5xl">✨</div>
             <div className="absolute bottom-20 left-[10%] text-blue-200 animate-bounce text-3xl">🎊</div>
        </div>

        <div className="text-center space-y-4 z-10 animate-in zoom-in duration-500">
          <div className="inline-flex p-5 bg-emerald-100 text-emerald-600 rounded-full shadow-lg mb-2">
            <ChefHat className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-stone-800 tracking-tight font-serif">
            Bon Appétit!
          </h1>
          <p className="text-xl md:text-2xl text-stone-500 font-light">
            You cooked <span className="font-semibold text-emerald-700">{recipeTitle}</span>.
          </p>
        </div>

        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden z-10 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
          
          <div className="bg-stone-50 p-6 border-b border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md">
              <span className="font-bold text-lg">S</span>
            </div>
            <div>
              <h3 className="font-bold text-stone-800">SuChef (SouZie)</h3>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6 bg-stone-50/30">
            
            <div className="flex gap-4">
               <div className="w-8 h-8 bg-emerald-600 rounded-full shrink-0 flex items-center justify-center text-white text-xs mt-1">S</div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-stone-700 border border-stone-100">
                 <p>Wow! That smells delicious from here! 😋</p>
                 <p className="mt-2">Be honest, how did it turn out? I want to learn for next time!</p>
               </div>
            </div>

            {isSubmitted ? (
               <div className="space-y-6">
                 <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 bg-stone-800 rounded-full shrink-0 flex items-center justify-center text-white text-xs mt-1">You</div>
                    <div className="bg-stone-800 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                      <p>{feedback}</p>
                      <div className="flex gap-1 mt-2">
                        {[...Array(rating)].map((_, i) => (
                           <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full shrink-0 flex items-center justify-center text-white text-xs mt-1">S</div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-stone-700 border border-stone-100">
                      <p className="text-emerald-700 font-medium">Thanks! I've saved this to your <b>Taste Profile</b>.</p>
                      <p className="text-sm text-stone-400 mt-1">
                          If you retry this dish, I'll adapt it! 🧠
                      </p>
                    </div>
                 </div>
               </div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex justify-center gap-2 py-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       type="button"
                       onClick={() => setRating(star)}
                       className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`}
                     >
                       <Star className="w-8 h-8" />
                     </button>
                   ))}
                 </div>

                 <div className="relative">
                   <textarea 
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                     placeholder="Tell SouZie how it tastes..."
                     className="w-full p-4 pr-12 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:ring-0 outline-none resize-none bg-white h-24"
                     onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                   />
                   <button 
                     type="submit"
                     disabled={!feedback || rating === 0}
                     className="absolute bottom-3 right-3 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                 </div>
               </form>
            )}

          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg">
            {isSubmitted && (
                <button
                onClick={handleCookAgain}
                disabled={isRetrying}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-xl hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
                >
                {isRetrying ? <Loader2 className="w-5 h-5 animate-spin"/> : <RotateCcw className="w-5 h-5" />}
                Cook Again (Adapt)
                </button>
            )}

            <button
            onClick={() => router.push("/")}
            className={`flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all ${isSubmitted ? 'flex-1' : 'w-full'}`}
            >
            <Home className="w-5 h-5" />
            Back to Kitchen
            </button>
        </div>

      </div>
    </Shell>
  );
}