"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";
import { RecipeError } from "../../components/RecipeError";
import { Loader2 } from "lucide-react";

export default function IngredientsPage() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorData, setErrorData] = useState<{title: string, description: string} | null>(null);
  
  const router = useRouter();

  // --- RESTORE PREVIOUS STATE (THE "MEMORY") ---
  useEffect(() => {
    const saved = localStorage.getItem("lastIngredients");
    if (saved) {
      try {
        setIngredients(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to restore ingredients", e);
      }
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!ingredients.includes(input.trim())) {
        setIngredients([...ingredients, input.trim()]);
      }
      setInput("");
    }
  };

  const removeIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const handleFindRecipes = async () => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    setErrorData(null);

    try {
      // 1. API Call
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "ingredients", 
          data: ingredients.join(", ") 
        }),
      });

      const data = await response.json();

      // 2. Error Check
      if (
        data.error || 
        (data.title && (
          data.title.includes("Unsafe") || 
          data.title.includes("Unclear") || 
          data.title.includes("Error")
        ))
      ) {
        setErrorData({
          title: data.title || "System Error",
          description: data.description || "Something went wrong."
        });
        setIsLoading(false);
        return; 
      }

      // 3. Success: Save Data
      localStorage.setItem("currentRecipe", JSON.stringify(data));
      
      // *** SAVE INPUTS FOR RESTORE ***
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
        <RecipeError 
          title={errorData.title} 
          description={errorData.description} 
          onRetry={() => setErrorData(null)} 
        />
      </Shell>
    );
  }

  // --- NORMAL UI ---
  return (
    <Shell>
      <div className="fade-in space-y-8">
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
                onClick={handleFindRecipes}
                disabled={ingredients.length === 0 || isLoading}
                className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
            >
                {isLoading ? <><Loader2 className="animate-spin" /> Consulting Chef...</> : "Find Recipes"}
            </button>
        </div>
      </div>
    </Shell>
  );
}