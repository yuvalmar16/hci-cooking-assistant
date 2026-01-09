/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { ShieldAlert, Frown, ChefHat, RefreshCcw, HelpCircle, UtensilsCrossed, Ban, Skull } from "lucide-react";

interface RecipeErrorProps {
  title: string;
  description: string;
  onRetry: () => void;
}

export function RecipeError({ title, description, onRetry }: RecipeErrorProps) {
  
  // Determine the "Vibe" based on the error title
  const getErrorContent = () => {
    
    const t = title.toLowerCase();
    const d = description.toLowerCase();

    // CASE 1: TOTAL BLOCK (Purely Bad)
    if (t.includes("prohibited") || t.includes("strict")) {
      return {
        image: "https://media.istockphoto.com/id/822945158/photo/mature-woman-in-haz-mat-suit-cooking.jpg?s=612x612&w=0&k=20&c=vcmgS1lOOs2gLxIXTE5BULJeApio-5Tgmd_pEttsf9A=",
        icon: <Ban className="w-24 h-24 text-red-600" />,
        headline: "Strictly Prohibited",
        sub: "I cannot find any edible ingredients in this list. I am a chef, not a hazmat team.",
        color: "bg-red-100 border-red-300 text-red-900"
      };
    }

    // CASE 2: MIXED SAFETY (Salvageable)
    if (t.includes("unsafe") || t.includes("safety") || t.includes("banned")) {
      const isPlural = t.includes("ingredients") || d.includes(" and ");
      return {
        icon: <ShieldAlert className="w-24 h-24 text-red-500" />,
        headline: isPlural ? "Multiple Red Flags!" : "Wait! One bad apple...",
        sub: description.includes("remove") 
             ? `I see some great ingredients, but I detected ${isPlural ? "a few unsafe items" : "something unsafe"}. Please remove ${isPlural ? "them" : "it"} so we can cook.` 
             : "My safety goggles are twitching. I can't cook with that list.",
        color: "bg-red-50 border-red-100 text-red-800"
      };
    }

    // CASE 3: NOT ENOUGH
    if (t.includes("not enough") || t.includes("simple") || t.includes("single")) {
      return {
        // --- NEW IMAGE ADDED HERE ---
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM5IoOpun0Z3iLQLJBkHCnj3udjGWrTCnq0A&s",
        icon: <UtensilsCrossed className="w-24 h-24 text-orange-400" />,
        headline: "I need a bit more!",
        sub: "That's a good start, but I can't make a whole meal out of just that. Can you add a protein or a veggie?",
        color: "bg-orange-50 border-orange-100 text-orange-800"
      };
    }

    // CASE 4: GIBBERISH
    if (t.includes("unclear") || t.includes("input")) {
      return {
        // --- NEW IMAGE ADDED HERE ---
        image: "https://i.imgflip.com/5uq1hx.jpg",
        icon: <HelpCircle className="w-24 h-24 text-amber-400" />,
        headline: "I'm Scratching My Head...",
        sub: "I'm a smart chef, but I didn't catch that. Try listing real ingredients?",
        color: "bg-amber-50 border-amber-100 text-amber-800"
      };
    }

    // CASE 5: BUSY
    if (t.includes("busy") || t.includes("error")) {
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
        
        {/* CONDITIONAL IMAGE OR ICON */}
        {/* We check if 'image' exists on the content object */}
        {(content as any).image ? (
           <div className="rounded-2xl overflow-hidden shadow-sm border-4 border-white/50 mx-auto w-full max-w-55">
             <img 
               src={(content as any).image} 
               alt="Error Illustration" 
               className="w-full h-auto object-cover"
             />
           </div>
        ) : (
           <div className="animate-bounce-slow drop-shadow-md">
             {content.icon}
           </div>
        )}

        {/* TEXT */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {content.headline}
          </h2>
          <p className="text-sm font-medium opacity-80 leading-relaxed px-4">
            {content.sub} 
            <br/>
            <span className="text-xs italic opacity-60 mt-3 block bg-white/50 p-2 rounded-lg border border-black/5">
              Chef says: "{description}"
            </span>
          </p>
        </div>

        {/* RETRY BUTTON */}
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-opacity-80 text-inherit font-bold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-sm uppercase tracking-widest border border-current"
        >
          <RefreshCcw className="w-4 h-4" />
          Fix Inputs
        </button>

      </div>
    </div>
  );
}