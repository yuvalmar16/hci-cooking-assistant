"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe } from "../types";

export default function OverviewPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New error state
  const router = useRouter();

  useEffect(() => {
    const mode = localStorage.getItem("cookingMode");
    const ingredients = localStorage.getItem("userIngredients");
    const rawRecipe = localStorage.getItem("rawRecipe");

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            data: mode === "ingredients" ? ingredients : rawRecipe,
          }),
        });
        
        const data = await res.json();

        // Safety Check: Did the server return an error?
        if (data.error) {
          throw new Error(data.error);
        }

        // Safety Check: Is the data actually a recipe?
        if (!data.ingredients || !data.steps) {
          throw new Error("Received incomplete recipe data.");
        }

        setRecipe(data);
        localStorage.setItem("currentRecipe", JSON.stringify(data));
      } catch (err: any) {
        console.error("Failed to generate", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse space-y-4">
          <p className="text-2xl text-stone-400 font-light">Thinking...</p>
          <p className="text-sm text-stone-300">Consulting the Chef</p>
        </div>
      </Shell>
    );
  }

  // Error State Display
  if (error) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-full">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-stone-700">Recipe Generation Failed</h2>
          <p className="text-stone-500 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-900"
          >
            Try Again
          </button>
        </div>
      </Shell>
    );
  }

  if (!recipe) return null;

  return (
    <Shell>
      <div className="fade-in space-y-8 pb-24">
        <header className="border-b border-stone-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">
            {recipe.title}
          </h1>
          <p className="mt-2 text-stone-500 text-lg">
            {recipe.description} • {recipe.totalTime}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-semibold text-stone-700 mb-4 uppercase tracking-wider text-sm">
              Checklist
            </h2>
            <ul className="space-y-3">
              {/* Added safe optional chaining '?.map' */}
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-center space-x-3 text-lg text-stone-600">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs">
                    ✓
                  </div>
                  <span>
                    <span className="font-semibold text-stone-800">{ing.amount}</span> {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <h3 className="text-emerald-800 font-medium text-lg">
                System Status
              </h3>
              <p className="text-3xl font-bold text-emerald-700 mt-2">
                You are ready.
              </p>
            </div>
            
            <button
              onClick={() => router.push("/cooking")}
              className="w-full py-5 bg-stone-800 text-stone-50 text-xl rounded-full shadow-lg hover:bg-stone-900 hover:scale-105 transition-all"
            >
              Start Cooking
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}