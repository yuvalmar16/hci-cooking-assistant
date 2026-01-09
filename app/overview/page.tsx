"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe } from "../types";
import { RecipeError } from "../components/RecipeError"; 
import { Clock, ChefHat, ArrowLeft, Play, Utensils, CheckCircle2, Scale } from "lucide-react";

// --- IMAGE HELPER ---
const getRecipeImage = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes("sushi") || t.includes("roll") || t.includes("poke")) return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200";
  if (t.includes("wok") || t.includes("stir") || t.includes("fry") || t.includes("asian") || t.includes("teriyaki")) return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200";
  if (t.includes("curry") || t.includes("indian") || t.includes("masala") || t.includes("tikka")) return "https://www.allrecipes.com/thmb/cF4D_jCqxkPpjg08TdHXk1E-3nM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/212721-indian-chicken-curry-murgh-kari-DDMFS-4x3-330302d59ca64543b3d7ead88c226f9a.jpg";
  if (t.includes("steak") || t.includes("beef") || t.includes("meat")) return "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200";
  if (t.includes("schnitzel") || t.includes("milanesa") || t.includes("fried chicken") || t.includes("cutlet")) return "https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&w=1200";
  if (t.includes("roast") || (t.includes("chicken") && t.includes("potato"))) return "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200";
  if (t.includes("burger") || t.includes("sandwich") || t.includes("wrap") || t.includes("toast")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200";
  if (t.includes("salmon") || t.includes("fish") || t.includes("seafood") || t.includes("shrimp")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200";
  if (t.includes("pasta") || t.includes("spaghetti") || t.includes("carbonara") || t.includes("alfredo") || t.includes("lasagna")) return "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=1200";
  if (t.includes("pizza") || t.includes("flatbread")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200";
  if (t.includes("risotto") || t.includes("rice")) return "https://images.unsplash.com/photo-1536304993881-ffc028db6981?auto=format&fit=crop&w=1200";
  if (t.includes("salad") || t.includes("bowl") || t.includes("healthy") || t.includes("quinoa")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200";
  if (t.includes("soup") || t.includes("stew") || t.includes("chili") || t.includes("broth")) return "https://www.thespruceeats.com/thmb/lko3xX8clhOrC894t9Drb6MoiX0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/easy-and-hearty-vegetable-soup-99538-hero-01-1d3b936ff03144af95ddca7640259c11.jpg";
  if (t.includes("shakshuka")) return "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1200";
  if (t.includes("omelet") || t.includes("egg") || t.includes("breakfast") || t.includes("pancake") || t.includes("waffle")) return "https://images.unsplash.com/photo-1533089862017-5614fa6753f5?auto=format&fit=crop&w=1200";
  if (t.includes("cake") || t.includes("bake") || t.includes("cookie") || t.includes("dessert") || t.includes("pie") || t.includes("muffin")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200";

  return "https://media.istockphoto.com/id/887636042/photo/the-start-of-something-delicious.jpg?s=612x612&w=0&k=20&c=2T_BCJQhhkfohcbcDZ14OV8rPStICJ9Q1_YjGUW2wCo=";
};

export default function OverviewPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("currentRecipe");
    
    if (stored) {
      try {
        setRecipe(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recipe", e);
        router.push("/"); 
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleEditInputs = () => {
    const mode = localStorage.getItem("cookingMode");
    if (mode === "recipe") {
      router.push("/input/recipe");
    } else {
      router.push("/input/ingredients");
    }
  };

  const handleStartCooking = () => {
    localStorage.setItem("cookingStep", "0");
    router.push("/cooking");
  };

  if (!recipe) return null;

  const lowerTitle = recipe.title.toLowerCase();
  
  if (
    lowerTitle.includes("not enough") || 
    lowerTitle.includes("unsafe") || 
    lowerTitle.includes("unclear") || 
    lowerTitle.includes("error") || 
    lowerTitle.includes("prohibited") || 
    lowerTitle.includes("strict")
  ) {
    return (
      <Shell>
        <RecipeError 
          title={recipe.title} 
          description={recipe.description} 
          onRetry={handleEditInputs} 
        />
      </Shell>
    );
  }

  const imageUrl = getRecipeImage(recipe.title);

  return (
    <Shell>
      <div className="fade-in max-w-4xl mx-auto space-y-8 pb-24">
        
        {/* HEADER */}
        <header className="text-center space-y-4 pt-8">
          <div className="inline-flex p-4 bg-emerald-100 text-emerald-700 rounded-full shadow-sm mb-2">
            <ChefHat className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-800 tracking-tight">
            Dish Ready!
          </h1>
          <p className="text-stone-500 text-lg max-w-lg mx-auto">
            Here is the optimized plan SuChef created for you.
          </p>
        </header>

        {/* RECIPE CARD */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden relative group">
          
          {/* Hero Image */}
          <div className="w-full h-64 md:h-80 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
             <img 
               src={imageUrl} 
               alt={recipe.title} 
               className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
             />
             <div className="absolute bottom-0 left-0 p-8 z-20">
               <h2 className="text-3xl md:text-4xl font-bold text-white shadow-sm mb-2">
                 {recipe.title}
               </h2>
               <div className="flex gap-3 text-white/90 font-medium text-sm">
                 <span className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                   <Clock className="w-4 h-4" /> {recipe.totalTime}
                 </span>
                 <span className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                   <Utensils className="w-4 h-4" /> {recipe.steps?.length || 0} Steps
                 </span>
               </div>
             </div>
          </div>

          <div className="p-8 md:p-12 space-y-8 relative z-10">
            <div>
              <p className="text-stone-600 text-lg leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* --- UPDATED: INGREDIENTS GRID WITH AMOUNTS --- */}
            <div className="pt-6 border-t border-stone-100">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Mise en Place (Prep)</h3>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {recipe.ingredients?.length || 0} Items
                  </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {recipe.ingredients?.map((ing, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-emerald-200 transition-colors group">
                     
                     <span className="font-medium text-stone-700 flex items-center gap-3">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                       <span className="group-hover:text-emerald-800 transition-colors">{ing.name}</span>
                     </span>

                     {/* Shows Amount Clearly */}
                     <span className="font-bold text-stone-900 bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm border border-stone-100 flex items-center gap-1.5 whitespace-nowrap">
                       <Scale className="w-3 h-3 text-stone-400" />
                       {ing.amount}
                     </span>

                   </div>
                 ))}
               </div>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
          <button
            onClick={handleEditInputs}
            className="flex-1 px-8 py-5 bg-white border-2 border-stone-200 text-stone-600 font-bold text-lg rounded-full hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Edit Inputs
          </button>

          <button
            onClick={handleStartCooking} 
            className="flex-[2] px-8 py-5 bg-stone-900 text-white font-bold text-lg rounded-full shadow-xl shadow-stone-200 hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            Let's Cook
          </button>
        </div>
      </div>
    </Shell>
  );
}