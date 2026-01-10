/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { ChefHat, ShoppingBasket, ScrollText, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("Hello");
  const router = useRouter();

  useEffect(() => {
    // 1. Recover name
    const savedName = localStorage.getItem("chefName");
    if (!savedName) {
      router.push("/");
      return;
    }
    setName(savedName);

    // 2. Determine time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [router]);

  return (
    <Shell>
      <div className="relative min-h-[80vh] flex flex-col justify-center">
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* --- HEADER SECTION --- */}
        <header className="mb-16 mt-8 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            AI Kitchen Assistant
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-stone-800 tracking-tight font-serif">
            {greeting}, <span className="text-emerald-700">{name}</span>.
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-stone-500 font-light max-w-2xl">
            The kitchen is yours. What culinary mission shall we tackle today?
          </p>
        </header>

        {/* --- ACTION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Option 1: Ingredients (The "Forager" Card) */}
          <button
            onClick={() => router.push("/input/ingredients")}
            className="group relative overflow-hidden p-8 h-80 rounded-[2.5rem] bg-linear-to-br from-white to-emerald-50/50 border-2 border-white shadow-xl hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 text-left hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
               <ShoppingBasket className="w-40 h-40 text-emerald-900" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <ShoppingBasket className="w-7 h-7" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-stone-800 mb-2 group-hover:text-emerald-800 transition-colors">
                  I have ingredients
                </h2>
                <p className="text-stone-500 font-medium leading-relaxed pr-8">
                  Scan your fridge. Tell me what you have, and I'll dream up a dish.
                </p>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">
                Start Foraging <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Option 2: Paste Recipe (The "Editor" Card) */}
          <button
            onClick={() => router.push("/input/recipe")}
            className="group relative overflow-hidden p-8 h-80 rounded-[2.5rem] bg-linear-to-br from-white to-amber-50/50 border-2 border-white shadow-xl hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 text-left hover:-translate-y-1"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
               <ScrollText className="w-40 h-40 text-amber-900" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <ChefHat className="w-7 h-7" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-stone-800 mb-2 group-hover:text-amber-800 transition-colors">
                  Simplify a Recipe
                </h2>
                <p className="text-stone-500 font-medium leading-relaxed pr-8">
                  Paste a messy blog recipe. I'll strip the ads and give you clear steps.
                </p>
              </div>

              <div className="flex items-center gap-2 text-amber-600 font-bold group-hover:gap-4 transition-all">
                Start Cooking <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        
        </div>
      </div>
    </Shell>
  );
}