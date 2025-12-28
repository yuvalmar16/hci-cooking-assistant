"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";

export default function RecipePage() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    // Save raw text and mode
    localStorage.setItem("rawRecipe", text);
    localStorage.setItem("cookingMode", "recipe");
    router.push("/overview");
  };

  return (
    <Shell>
      <div className="fade-in space-y-6">
        <header>
          <button 
            onClick={() => router.back()}
            className="text-stone-400 hover:text-stone-600 mb-4 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-4xl md:text-5xl font-medium text-stone-800">
            Paste recipe.
          </h1>
          <p className="mt-2 text-stone-500 text-lg">
            Paste the full text from any website below.
          </p>
        </header>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          className="w-full h-64 p-6 text-lg border-2 border-stone-200 rounded-3xl focus:border-emerald-500 focus:outline-none transition-colors bg-white resize-none leading-relaxed"
          autoFocus
        />

        <div className="pt-4">
          <button
            onClick={handleContinue}
            disabled={text.length < 10}
            className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simplify Recipe
          </button>
        </div>
      </div>
    </Shell>
  );
}