/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { ShieldAlert, Frown, ChefHat, RefreshCcw, HelpCircle, UtensilsCrossed, Ban, AlertTriangle, ArrowRight } from "lucide-react";

interface RecipeErrorProps {
  title: string;
  description: string;
  onRetry: () => void;
}

export function RecipeError({ title, description, onRetry }: RecipeErrorProps) {
  
  const getErrorContent = () => {
    const t = title.toLowerCase();
    const d = description.toLowerCase();

    // CASE 1: TOTAL BLOCK (Purely Bad)
    if (t.includes("prohibited") || t.includes("strict") || t.includes("hateful")) {
      return {
        image: "https://media.istockphoto.com/id/822945158/photo/mature-woman-in-haz-mat-suit-cooking.jpg?s=612x612&w=0&k=20&c=vcmgS1lOOs2gLxIXTE5BULJeApio-5Tgmd_pEttsf9A=",
        headline: "Strictly Prohibited",
        sub: "I cannot find any edible ingredients in this list. I am a chef, not a hazmat team.",
        gradient: "from-red-100 to-red-50",
        accent: "text-red-600",
        button: "bg-red-600 hover:bg-red-700 text-white"
      };
    }

    // CASE 2: SAFETY (Salvageable)
    if (t.includes("unsafe") || t.includes("safety") || t.includes("banned")) {
      return {
        icon: <ShieldAlert className="w-12 h-12 text-red-500" />,
        headline: "Kitchen Safety Alert",
        sub: "My safety goggles are twitching. I detected some non-food items in your list.",
        gradient: "from-red-50 to-white",
        accent: "text-red-700",
        button: "bg-red-600 hover:bg-red-700 text-white"
      };
    }

    // CASE 3: NOT ENOUGH
    if (t.includes("not enough") || t.includes("simple") || t.includes("single")) {
      return {
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM5IoOpun0Z3iLQLJBkHCnj3udjGWrTCnq0A&s", // Empty plate
        headline: "I need a bit more!",
        sub: "That's a good start, but I can't make a full meal out of just that. Can you add a protein or a veggie?",
        gradient: "from-orange-50 to-white",
        accent: "text-orange-700",
        button: "bg-orange-500 hover:bg-orange-600 text-white"
      };
    }

    // CASE 4: GIBBERISH
    if (t.includes("unclear") || t.includes("input")) {
      return {
        icon: <HelpCircle className="w-12 h-12 text-amber-500" />,
        headline: "I'm Scratching My Head...",
        sub: "I'm a smart chef, but I didn't catch that. Is it a typo?",
        gradient: "from-amber-50 to-white",
        accent: "text-amber-700",
        button: "bg-amber-500 hover:bg-amber-600 text-white"
      };
    }

    // CASE 5: BUSY / SERVER ERROR
    if (t.includes("busy") || t.includes("error")) {
      return {
        icon: <ChefHat className="w-12 h-12 text-stone-400" />,
        headline: "Kitchen Overload!",
        sub: "The kitchen is super busy right now. Give me a shorter recipe or try again in a sec!",
        gradient: "from-stone-100 to-stone-50",
        accent: "text-stone-700",
        button: "bg-stone-800 hover:bg-stone-900 text-white"
      };
    }

    // DEFAULT
    return {
      icon: <Frown className="w-12 h-12 text-stone-400" />,
      headline: title,
      sub: "Something didn't go quite right.",
      gradient: "from-stone-100 to-white",
      accent: "text-stone-700",
      button: "bg-stone-800 hover:bg-stone-900 text-white"
    };
  };

  const content = getErrorContent();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in zoom-in-95 duration-500">
      
      {/* MAIN CARD */}
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100 relative group">
        
        {/* Header Background */}
        <div className={`h-32 w-full bg-gradient-to-b ${content.gradient} relative overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>
        </div>

        {/* Floating Visual (Image or Icon) */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            {(content as any).image ? (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    <img 
                        src={(content as any).image} 
                        alt="Error" 
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center">
                    {content.icon}
                </div>
            )}
        </div>

        {/* Content Body */}
        <div className="pt-20 pb-10 px-8 text-center">
            
            <h2 className={`text-3xl font-serif font-bold mb-3 ${content.accent}`}>
                {content.headline}
            </h2>
            
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
                {content.sub}
            </p>

            {/* Chef's Note Box */}
            <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 mb-8 relative text-left">
                <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold uppercase tracking-widest text-stone-400 border border-stone-100 rounded-full">
                    Chef's Note
                </div>
                <p className="text-stone-600 italic text-sm">
                    "{description}"
                </p>
            </div>

            {/* Retry Button */}
            <button 
                onClick={onRetry}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${content.button}`}
            >
                <RefreshCcw className="w-5 h-5" />
                Let's Try Again
            </button>

        </div>
      </div>

    </div>
  );
}