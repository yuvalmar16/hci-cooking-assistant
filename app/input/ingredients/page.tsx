"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";

export default function IngredientsPage() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
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

  const handleContinue = () => {
    // Save to local storage for the next step
    localStorage.setItem("userIngredients", JSON.stringify(ingredients));
    localStorage.setItem("cookingMode", "ingredients");
    // For now, we go back home or to a placeholder. 
    // In the full build, this goes to Step 10 (Overview).
    // Let's go to a 'readiness' placeholder we will build next.
    router.push("/overview"); 
  };

  return (
    <Shell>
      <div className="fade-in space-y-8">
        <header>
          <button 
            onClick={() => router.back()}
            className="text-stone-400 hover:text-stone-600 mb-4 transition-colors"
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
          placeholder="e.g., Chicken breast..."
          className="w-full text-2xl p-4 border-2 border-stone-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors bg-white"
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
                className="ml-3 text-emerald-600 hover:text-emerald-900 focus:outline-none"
                aria-label={`Remove ${ing}`}
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

        {/* Action Button */}
        <div className="pt-8">
          <button
            onClick={handleContinue}
            disabled={ingredients.length === 0}
            className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find Recipes
          </button>
        </div>
      </div>
    </Shell>
  );
}