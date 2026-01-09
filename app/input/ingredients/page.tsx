/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";
import { RecipeError } from "../../components/RecipeError";
import { Loader2, ChefHat, ArrowRight, CheckCircle2 } from "lucide-react";

export default function IngredientsPage() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorData, setErrorData] = useState<{title: string, description: string} | null>(null);
  
  // --- NEW: SUGGESTIONS STATE ---
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
  // If 'chosenOption' is passed, we force the AI to cook that specific dish.
  const handleFindRecipes = async (chosenOption?: string) => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    setErrorData(null);
    if (!chosenOption) setSuggestions(null); // Reset suggestions if starting fresh

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
          selectedOption: chosenOption // <--- SEND CHOICE IF MADE
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

      // 2. NEW: Handle Suggestions (The Buffet Rule)
      if (data.type === "suggestions" && data.options) {
        setSuggestions(data.options);
        setIsLoading(false);
        return; // Stop here, let user choose
      }

      // 3. Success: Final Recipe Generated
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

  // --- ERROR SCREEN ---
  if (errorData) {
    return (
      <Shell>
        <RecipeError title={errorData.title} description={errorData.description} onRetry={() => setErrorData(null)} />
      </Shell>
    );
  }

  // --- MAIN UI ---
  return (
    <Shell>
      <div className="fade-in space-y-8 relative">
        <header>
           <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-600 mb-4 transition-colors">← Home</button>
           <h1 className="text-4xl md:text-5xl font-medium text-stone-800">What do you have?</h1>
           <p className="mt-2 text-stone-500 text-lg">Type an ingredient and press Enter.</p>
        </header>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="e.g., Chicken breast..."
          className="w-full text-2xl p-4 border-2 border-stone-200 rounded-2xl focus:border-emerald-500 outline-none transition-colors"
          autoFocus
        />

        <div className="flex flex-wrap gap-3 min-h-25">
          {ingredients.map((ing, index) => (
            <span key={index} className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-lg animate-pop">
              {ing}
              <button onClick={() => removeIngredient(index)} disabled={isLoading} className="ml-3 font-bold hover:text-emerald-900">×</button>
            </span>
          ))}
          {ingredients.length === 0 && <p className="text-stone-400 italic">Your basket is empty.</p>}
        </div>

        <div className="pt-8">
            <button
                onClick={() => handleFindRecipes()}
                disabled={ingredients.length === 0 || isLoading}
                className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
            >
                {isLoading ? <><Loader2 className="animate-spin" /> Consulting Chef...</> : "Find Recipes"}
            </button>
        </div>

        {/* --- SUGGESTION MODAL / OVERLAY --- */}
        {suggestions && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
            <div className="bg-stone-50 w-full max-w-4xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              
              <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                  <ChefHat className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-stone-800">Chef's Selection</h2>
                <p className="text-stone-500 mt-2 text-lg">You have so many great ingredients! Which direction should we go?</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {suggestions.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleFindRecipes(opt.title)} // <--- CALL API WITH CHOICE
                    disabled={isLoading}
                    className="flex flex-col text-left bg-white p-6 rounded-2xl border-2 border-stone-100 shadow-sm hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full self-start mb-4">
                      Using {opt.keyIngredient}
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-grow">
                      {opt.description}
                    </p>
                    <div className="w-full py-3 rounded-xl bg-stone-100 text-stone-600 font-bold text-center group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                       {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <>Cook This <ArrowRight className="w-4 h-4"/></>}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button onClick={() => setSuggestions(null)} className="text-stone-400 hover:text-stone-600 underline">
                  Cancel and Go Back
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}