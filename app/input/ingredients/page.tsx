"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";
import { RecipeError } from "../../components/RecipeError"; // Import the new error component
import { Loader2 } from "lucide-react"; // Icon for loading

export default function IngredientsPage() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorData, setErrorData] = useState<{title: string, description: string} | null>(null);
  
  const router = useRouter();

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
    setErrorData(null); // Reset errors

    try {
      // 1. Call the AI Chef immediately
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "ingredients", 
          data: ingredients.join(", ") 
        }),
      });

      const data = await response.json();

      // 2. CHECK FOR ERRORS (Safety, Gibberish, Busy)
      // The API returns a valid JSON, but the "title" might be an error flag.
      if (
        data.error || 
        (data.title && (
          data.title.includes("Unsafe") || 
          data.title.includes("Unclear") || 
          data.title.includes("Error")
        ))
      ) {
        // Show the Error Screen on this page
        setErrorData({
          title: data.title || "System Error",
          description: data.description || "Something went wrong in the kitchen."
        });
        setIsLoading(false);
        return; 
      }

      // 3. SUCCESS! Save the recipe and go to Overview
      // We save the *full recipe* now, not just ingredients
      localStorage.setItem("currentRecipe", JSON.stringify(data));
      router.push("/overview");

    } catch (e) {
      console.error(e);
      setErrorData({
        title: "Connection Error",
        description: "Could not reach the chef. Please check your internet."
      });
      setIsLoading(false);
    }
  };

  // --- RENDER ERROR SCREEN IF NEEDED ---
  if (errorData) {
    return (
      <Shell>
        <RecipeError 
          title={errorData.title} 
          description={errorData.description} 
          onRetry={() => setErrorData(null)} // Go back to input view
        />
      </Shell>
    );
  }

  // --- NORMAL INPUT SCREEN ---
  return (
    <Shell>
      <div className="fade-in space-y-8">
        <header>
          <button 
            onClick={() => router.back()}
            disabled={isLoading}
            className="text-stone-400 hover:text-stone-600 mb-4 transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
          <h1 className="text-4xl md:text-5xl font-medium text-stone-800">
            What do you have?
          </h1>
          <p className="mt-2 text-stone-500 text-lg">
            Type an ingredient and press Enter.
          </p>
        </header>

        {/* Input Field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="e.g., Chicken breast..."
          className="w-full text-2xl p-4 border-2 border-stone-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors bg-white disabled:bg-stone-50 disabled:text-stone-400"
          autoFocus
        />

        {/* Chips Container */}
        <div className="flex flex-wrap gap-3 min-h-25">
          {ingredients.map((ing, index) => (
            <span
              key={index}
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-lg animate-pop"
            >
              {ing}
              <button
                onClick={() => removeIngredient(index)}
                disabled={isLoading}
                className="ml-3 text-emerald-600 hover:text-emerald-900 focus:outline-none disabled:opacity-50"
              >
                ×
              </button>
            </span>
          ))}
          
          {ingredients.length === 0 && (
            <p className="text-stone-400 italic">
              Your basket is empty.
            </p>
          )}
        </div>

        {/* Action Button (Now handles Loading) */}
        <div className="pt-8">
          <button
            onClick={handleFindRecipes}
            disabled={ingredients.length === 0 || isLoading}
            className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Consulting Chef...
              </>
            ) : (
              "Find Recipes"
            )}
          </button>
        </div>
      </div>
    </Shell>
  );
}