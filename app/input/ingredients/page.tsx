/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";
import { RecipeError } from "../../components/RecipeError";
import { Loader2, ChefHat, ArrowRight, X, Plus, Sparkles, Utensils } from "lucide-react";

export default function IngredientsPage() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorData, setErrorData] = useState<{title: string, description: string} | null>(null);
  
  // --- SUGGESTIONS STATE ---
  const [suggestions, setSuggestions] = useState<any[] | null>(null);

  const router = useRouter();

  // Restore ingredients on load
  useEffect(() => {
    const saved = localStorage.getItem("lastIngredients");
    if (saved) {
      try { setIngredients(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const val = input.trim();
      if (!ingredients.includes(val)) setIngredients([...ingredients, val]);
      setInput("");
    }
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  // --- API CALLER ---
  const handleFindRecipes = async (chosenOption?: string) => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    setErrorData(null);
    if (!chosenOption) setSuggestions(null); 

    const rawHistory = localStorage.getItem("cookingHistory");
    let formattedHistory = "";
    if (rawHistory) {
      try {
        const historyItems = JSON.parse(rawHistory);
        formattedHistory = historyItems.slice(0, 3).map((item: any) => 
          `- When cooking "${item.title}", User rated it ${item.rating}/5: "${item.feedback}"`
        ).join("\n");
      } catch (e) {}
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "ingredients", 
          data: ingredients.join(", "),
          history: formattedHistory,
          selectedOption: chosenOption 
        }),
      });

      const data = await response.json();

      // 1. Error Handling
      if (data.error || (data.title && (data.title.includes("Unsafe") || data.title.includes("Error") || data.title.includes("Prohibited")))) {
        setErrorData({
          title: data.title || "System Error",
          description: data.description || "Something went wrong."
        });
        setIsLoading(false);
        return; 
      }

      // 2. Handle Suggestions
      if (data.type === "suggestions" && data.options) {
        setSuggestions(data.options);
        setIsLoading(false);
        return; 
      }

      // 3. Success
      localStorage.setItem("currentRecipe", JSON.stringify(data));
      localStorage.setItem("cookingStep", "0");
      localStorage.setItem("lastIngredients", JSON.stringify(ingredients)); 
      localStorage.setItem("cookingMode", "ingredients");
      
      router.push("/overview");

    } catch (e) {
      console.error(e);
      setErrorData({ title: "Connection Error", description: "Could not reach the chef." });
      setIsLoading(false);
    }
  };

  if (errorData) {
    return (
      <Shell>
        <RecipeError title={errorData.title} description={errorData.description} onRetry={() => setErrorData(null)} />
      </Shell>
    );
  }

  // --- MAIN UI ---
  return (
    <Shell className="min-h-screen bg-stone-50">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-600 z-0"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-12 pb-24 px-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-8 border border-stone-100 animate-in slide-in-from-bottom-8 duration-700">
           <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-800 mb-6 flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back Home
           </button>

           <div className="md:flex items-end justify-between gap-8">
             <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">What's in your kitchen?</h1>
                <p className="text-stone-500 text-lg md:text-xl font-light">List your ingredients, and I'll create a masterpiece.</p>
             </div>
             <div className="hidden md:block">
                 <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                     <Utensils className="w-8 h-8" />
                 </div>
             </div>
           </div>

           {/* Input Area */}
           <div className="mt-10 relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Type an ingredient (e.g. Chicken, Basil, Lemon)..."
                className="w-full text-xl md:text-2xl p-6 pr-16 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-stone-300"
                autoFocus
              />
              <button 
                onClick={() => {
                    if(input.trim()) {
                        setIngredients([...ingredients, input.trim()]);
                        setInput("");
                    }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-200 active:scale-95"
              >
                  <Plus className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* Ingredients List */}
        <div className="min-h-40">
            {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {ingredients.map((ing, index) => (
                        <div key={index} className="group flex items-center gap-3 px-5 py-3 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all animate-in zoom-in duration-300">
                            <span className="text-lg font-medium text-stone-700 capitalize">{ing}</span>
                            <button 
                                onClick={() => removeIngredient(index)} 
                                disabled={isLoading} 
                                className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-3xl">
                    <div className="inline-block p-4 bg-stone-50 rounded-full mb-3">
                        <Sparkles className="w-6 h-6 text-stone-300" />
                    </div>
                    <p className="text-stone-400 font-medium">Your basket is empty.</p>
                </div>
            )}
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-stone-100 md:static md:bg-transparent md:border-0 md:p-0 mt-8 flex justify-end">
            <button
                onClick={() => handleFindRecipes()}
                disabled={ingredients.length === 0 || isLoading}
                className="w-full md:w-auto px-10 py-5 bg-stone-900 text-white text-xl font-bold rounded-full shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
            >
                {isLoading ? <><Loader2 className="animate-spin" /> Chef is Thinking...</> : <>Find Recipes <ArrowRight className="w-5 h-5" /></>}
            </button>
        </div>

        {/* --- SUGGESTION MODAL --- */}
        {suggestions && (
          <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-stone-50 w-full max-w-5xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto border border-white/20">
              
              <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-emerald-100 text-emerald-700 rounded-full mb-6 shadow-inner">
                  <ChefHat className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-stone-900">Chef's Selection</h2>
                <p className="text-stone-500 mt-3 text-lg max-w-xl mx-auto">
                    You have a diverse set of ingredients. Here are three distinct culinary directions we could take.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {suggestions.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleFindRecipes(opt.title)}
                    disabled={isLoading}
                    className="flex flex-col text-left bg-white p-8 rounded-3xl border border-stone-100 shadow-xl hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg self-start mb-6 border border-emerald-100">
                       Using {opt.keyIngredient}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-stone-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {opt.title}
                    </h3>
                    
                    <p className="text-stone-500 text-sm leading-relaxed mb-8 grow font-medium">
                      {opt.description}
                    </p>
                    
                    <div className="w-full py-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 font-bold text-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Select Dish <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></>}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <button onClick={() => setSuggestions(null)} className="text-stone-400 hover:text-stone-800 font-bold text-sm uppercase tracking-widest transition-colors">
                  Cancel Selection
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}