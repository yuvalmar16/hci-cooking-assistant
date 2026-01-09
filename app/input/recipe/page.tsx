/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";
import { RecipeError } from "../../components/RecipeError";
import { Loader2 } from "lucide-react";

export default function RecipePage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorData, setErrorData] = useState<{title: string, description: string} | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("lastRecipeText");
    if (saved) setText(saved);
  }, []);

  const handleSimplify = async () => {
    if (text.length < 10) return;
    setIsLoading(true);
    setErrorData(null);

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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "recipe", 
          data: text,
          history: formattedHistory
        }),
      });

      const data = await response.json();

      if (data.error || (data.title && (data.title.includes("Unsafe") || data.title.includes("Error") || data.title.includes("Prohibited")))) {
        setErrorData({
          title: data.title || "System Error",
          description: data.description || "I couldn't process that text."
        });
        setIsLoading(false);
        return; 
      }

      // --- SUCCESS: SAVE & RESET PROGRESS ---
      localStorage.setItem("currentRecipe", JSON.stringify(data));

      // *** FIX: WIPE OLD COOKING PROGRESS HERE ***
      localStorage.removeItem("cookingStep");

      localStorage.setItem("lastRecipeText", text);
      localStorage.setItem("cookingMode", "recipe");

      router.push("/overview");

    } catch (e) {
      console.error(e);
      setErrorData({ title: "Connection Error", description: "Check internet connection." });
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

  return (
    <Shell>
      <div className="fade-in space-y-6">
        <header>
          <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-600 mb-4 transition-colors">← Home</button>
          <h1 className="text-4xl md:text-5xl font-medium text-stone-800">Paste recipe.</h1>
          <p className="mt-2 text-stone-500 text-lg">Paste the full text from any website below.</p>
        </header>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Paste text here..."
          className="w-full h-64 p-6 text-lg border-2 border-stone-200 rounded-3xl focus:border-emerald-500 outline-none resize-none disabled:bg-stone-50 transition-colors"
          autoFocus
        />

        <div className="pt-4">
          <button
            onClick={handleSimplify}
            disabled={text.length < 10 || isLoading}
            className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            {isLoading ? <><Loader2 className="animate-spin" /> Simplifying...</> : "Simplify Recipe"}
          </button>
        </div>
      </div>
    </Shell>
  );
}