/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/Shell";
import { RecipeError } from "../../components/RecipeError";
import { Loader2, ArrowRight, Wand2, ScrollText, Sparkles, AlertCircle } from "lucide-react";

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

      // --- SUCCESS ---
      localStorage.setItem("currentRecipe", JSON.stringify(data));
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
    <Shell className="min-h-screen bg-stone-50">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-96 bg-linear-to-b from-amber-50 to-stone-50 z-0"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute top-40 left-20 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-5xl mx-auto pt-12 pb-24 px-6">
        
        <button onClick={() => router.push("/")} className="text-stone-400 hover:text-stone-800 mb-8 flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back Home
        </button>

        <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT: INPUT SECTION (8 Cols) --- */}
            <div className="md:col-span-8 space-y-6">
                
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4 leading-tight">
                        Clean up the chaos.
                    </h1>
                    <p className="text-lg text-stone-500 font-light max-w-xl">
                        Copy an entire recipe blog post (ads, stories, comments and all) and paste it below. I'll extract just the cooking steps.
                    </p>
                </div>

                {/* Editor Area */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-emerald-100 to-amber-100 rounded-[2.2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white rounded-4xl shadow-xl p-2">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isLoading}
                            placeholder="Paste the messy text here..."
                            className="w-full h-96 p-8 text-lg md:text-xl text-stone-700 placeholder:text-stone-300 border-0 rounded-[1.8rem] focus:ring-0 resize-none outline-none bg-stone-50/50 focus:bg-white transition-all duration-300 leading-relaxed"
                            autoFocus
                        />
                        
                        <div className="absolute bottom-6 right-6 text-xs font-bold text-stone-300 uppercase tracking-widest pointer-events-none">
                            {text.length > 0 ? `${text.length} chars` : "Waiting for text..."}
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSimplify}
                        disabled={text.length < 10 || isLoading}
                        className="w-full md:w-auto px-10 py-5 bg-stone-900 text-white text-xl font-bold rounded-full shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 group"
                    >
                        {isLoading ? (
                            <><Loader2 className="animate-spin" /> Cleaning...</>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                                Simplify Recipe
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- RIGHT: INFO PANEL (4 Cols) --- */}
            <div className="md:col-span-4 space-y-6 pt-8 md:pt-20">
                
                <div className="bg-white/60 backdrop-blur-sm border border-white p-6 rounded-3xl shadow-lg">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                        <ScrollText className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-stone-800 text-lg mb-2">What I remove:</h3>
                    <ul className="space-y-3 text-stone-500 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 font-bold">×</span> Long personal stories
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 font-bold">×</span> Pop-up ads & banners
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 font-bold">×</span> Confusing layouts
                        </li>
                    </ul>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-emerald-800 text-lg">What you get:</h3>
                    </div>
                    <p className="text-emerald-700 text-sm leading-relaxed mb-4">
                        A clean, step-by-step cooking guide with timers, read-aloud features, and an AI chef to help you along the way.
                    </p>
                    <div className="h-1.5 w-full bg-emerald-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-2/3 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {text.length < 10 && (
                    <div className="flex items-center gap-3 text-stone-400 text-xs px-4">
                        <AlertCircle className="w-4 h-4" />
                        <span>Paste at least 10 characters to start.</span>
                    </div>
                )}

            </div>
        </div>

      </div>
    </Shell>
  );
}