"use client";

import { ShieldAlert, Frown, ChefHat, RefreshCcw, HelpCircle } from "lucide-react";

interface RecipeErrorProps {
  title: string;
  description: string;
  onRetry: () => void;
}

export function RecipeError({ title, description, onRetry }: RecipeErrorProps) {
  
  // Determine the "Vibe" based on the error title
  const getErrorContent = () => {
    
    // CASE 1: SAFETY (e.g., "Human Meat", "Poison")
    if (title.toLowerCase().includes("unsafe") || title.toLowerCase().includes("safety")) {
      return {
        icon: <ShieldAlert className="w-24 h-24 text-red-400" />,
        headline: "Whoa there, Cowboy!",
        sub: "My safety goggles are twitching. I can't cook with that.",
        color: "bg-red-50 border-red-100 text-red-800"
      };
    }

    // CASE 2: GIBBERISH (e.g., "asdf", "1234")
    if (title.toLowerCase().includes("unclear") || title.toLowerCase().includes("input")) {
      return {
        icon: <HelpCircle className="w-24 h-24 text-amber-400" />,
        headline: "I'm Scratching My Head...",
        sub: "I'm a smart chef, but I didn't catch that. Try listing real ingredients?",
        color: "bg-amber-50 border-amber-100 text-amber-800"
      };
    }

    // CASE 3: BUSY / COMPLEXITY (e.g., Mole Poblano timeout)
    if (title.toLowerCase().includes("busy") || title.toLowerCase().includes("error")) {
      return {
        icon: <ChefHat className="w-24 h-24 text-stone-400 animate-pulse" />,
        headline: "Kitchen Overload!",
        sub: "The kitchen is super busy right now. Give me a shorter recipe or try again in a sec!",
        color: "bg-stone-50 border-stone-200 text-stone-600"
      };
    }

    // DEFAULT
    return {
      icon: <Frown className="w-24 h-24 text-stone-400" />,
      headline: title,
      sub: description,
      color: "bg-stone-50 border-stone-200 text-stone-600"
    };
  };

  const content = getErrorContent();

  return (
    <div className="flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      
      {/* CARD */}
      <div className={`max-w-md w-full rounded-3xl p-8 text-center border-2 ${content.color} shadow-xl flex flex-col items-center gap-6`}>
        
        {/* ICON (Bouncing Animation) */}
        <div className="animate-bounce-slow drop-shadow-md">
          {content.icon}
        </div>

        {/* TEXT */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {content.headline}
          </h2>
          <p className="text-sm font-medium opacity-80 leading-relaxed px-4">
            {content.sub} 
            <br/>
            <span className="text-xs italic opacity-60 mt-2 block">
              (Tech speak: {description})
            </span>
          </p>
        </div>

        {/* RETRY BUTTON */}
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-opacity-80 text-inherit font-bold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-sm uppercase tracking-widest border border-current"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>

      </div>
    </div>
  );
}