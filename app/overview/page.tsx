/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe } from "../types";
import { RecipeError } from "../components/RecipeError"; 
import { Clock, ArrowLeft, Play, Utensils, CheckCircle2, Scale, ChefHat, Sparkles } from "lucide-react";

// --- IMAGE HELPER ---
const getRecipeImage = (title: string): string => {
  const t = title.toLowerCase();

  // --- ASIAN & SUSHI ---
  if (t.includes("sushi") || t.includes("sashimi") || t.includes("nigiri")) return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200";
  if (t.includes("ramen") || t.includes("udon") || t.includes("noodle soup")) return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200";
  if (t.includes("poke") || t.includes("bowl")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200";
  if (t.includes("pad thai") || t.includes("thai")) return "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200";
  if (t.includes("curry") || t.includes("tikka") || t.includes("butter chicken")) return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200";
  if (t.includes("dumpling") || t.includes("dim sum") || t.includes("gyoza")) return "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200";
  if (t.includes("fried rice") || t.includes("stir fry")) return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200";
  if (t.includes("spring roll") || t.includes("egg roll")) return "https://static01.nyt.com/images/2024/01/10/multimedia/nd-egg-rolls-jgqc/nd-egg-rolls-jgqc-mediumSquareAt3X.jpg";
  
  // --- ITALIAN & PASTA ---
  if (t.includes("pizza") || t.includes("calzone")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200";
  if (t.includes("lasagna")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpb7GD06qzsRopSzFIMYPyvIEGpflBaEnYPg&s";
  if (t.includes("carbonara")) return "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200";
  if (t.includes("spaghetti") || t.includes("bolognese")) return "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=1200";
  if (t.includes("ravioli") || t.includes("tortellini")) return "https://static01.nyt.com/images/2024/01/26/multimedia/LH-Ravioli-lgpf/LH-Ravioli-lgpf-threeByTwoLargeAt2X.jpg";
  if (t.includes("risotto")) return "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200";
  if (t.includes("gnocchi")) return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200";

  // --- MEXICAN & LATIN ---
  if (t.includes("taco")) return "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200";
  if (t.includes("burrito") || t.includes("wrap")) return "https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?auto=format&fit=crop&w=1200";
  if (t.includes("nacho")) return "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=1200";
  if (t.includes("quesadilla")) return "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=1200";
  if (t.includes("guacamole") || t.includes("avocado")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2x5oxhv9365dk7jiXsa3qhj0a7QsBDXD4YA&s";
  if (t.includes("paella")) return "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1200";

  // --- AMERICAN & GRILL ---
  if (t.includes("burger") || t.includes("cheeseburger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200";
  if (t.includes("steak") || t.includes("ribeye") || t.includes("filet")) return "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200";
  if (t.includes("bbq") || t.includes("ribs") || t.includes("barbecue")) return "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200";
  if (t.includes("fried chicken") || t.includes("nugget") || t.includes("tender")) return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200";
  if (t.includes("wing") || t.includes("buffalo")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk-5Zcd6B5P1QrHWX_4KD-wl9wCAu6-pKZWw&s";
  if (t.includes("hot dog") || t.includes("sausage")) return "https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=1200";
  if (t.includes("mac and cheese") || t.includes("macaroni")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDdmlMPSMkf5SOaACLxV_jA7_UK8G7F_fRYA&s";

  // --- BREAKFAST ---
  if (t.includes("pancake")) return "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200";
  if (t.includes("waffle")) return "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=1200";
  if (t.includes("omelet") || t.includes("scramble")) return "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1200";
  if (t.includes("shakshuka")) return "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1200";
  if (t.includes("benedict") || t.includes("poached")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJCs6Ub63c5g_oH_UgQeEU2529SyQaGDNEpQ&s";
  if (t.includes("french toast")) return "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200";
  if (t.includes("smoothie") || t.includes("shake")) return "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200";
  if (t.includes("oatmeal") || t.includes("porridge")) return "https://feelgoodfoodie.net/wp-content/uploads/2025/07/Steel-Cut-Oatmeal-09.jpg";

  // --- SEAFOOD ---
  if (t.includes("salmon")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200";
  if (t.includes("shrimp") || t.includes("prawn")) return "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1200";
  if (t.includes("lobster") || t.includes("crab")) return "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=1200";
  if (t.includes("oyster") || t.includes("clam") || t.includes("mussel")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHInR8I1qg4cEY9OcLSu5B-fNO3df-4511Tw&s";
  // --- RUSSIAN ---
  if (t.includes("borscht") || t.includes("beet soup")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAys3DiVhon2cMzXdtc_WP8hqzldch7CltsQ&s";
  if (t.includes("stroganoff")) return "https://feelgoodfoodie.net/wp-content/uploads/2025/02/Beef-Stroganoff-12.jpg";
  if (t.includes("pelmeni") || t.includes("pierogi") || t.includes("varenyky")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi6CRzVVxPKkjq9QfZP20GWcO-YrCOPHLhQw&s";
  if (t.includes("blini") || t.includes("crepe")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9OsYHe-3X_-eVXua9pDXlm8KXQPpWcyPhtA&s";
  if (t.includes("olivier") || t.includes("potato salad")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJin68trQa7Q1pRzi_pefwrTc6aKxpw6I22A&s";
  if (t.includes("pirozhki") || t.includes("bun")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ8doVPbnUMLGEIQBbVvbLx0mQScMm1V94Kg&s";

  // --- ARABIC & MIDDLE EASTERN ---
  if (t.includes("hummus")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUqOpl_1aLFSA5VDJ5nHdCPdCdlwhfdzHY-g&s";
  if (t.includes("falafel")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1v0ezNu0tG2DE1OOlNVNgyZRM-MsAv01X2A&s";
  if (t.includes("shawarma") || t.includes("kebab") || t.includes("doner")) return "https://pekis.net/sites/default/files/styles/1200x1200/public/2025-04/Shawarma.webp?itok=mV9tgrFh";
  if (t.includes("tabbouleh") || t.includes("tabouleh")) return "https://media-cdn.tripadvisor.com/media/photo-m/1280/1a/fb/62/95/tabula.jpg";
  if (t.includes("baklava")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo8uR5qDhur1wydhLCyZOw9l-Ck_SXLGKoaw&s";
  if (t.includes("mansaf") || t.includes("maqluba") || t.includes("kabsa")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEYs8Nrfv17YzejlA5mjoNNSAI5buzUvIv4Q&s";
  if (t.includes("pita") || t.includes("flatbread")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQimJncFyWMFID8Zv2Y2rRKw-IZ0VQc6kdAiQ&s";
  // --- SALADS & VEGGIES ---
  if (t.includes("caesar")) return "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=1200";
  if (t.includes("greek salad")) return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200";
  if (t.includes("salad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200";
  if (t.includes("soup") || t.includes("stew") || t.includes("chowder")) return "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200";
  if (t.includes("tofu") || t.includes("vegan")) return "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=1200";

  // --- DESSERTS ---
  if (t.includes("chocolate cake") || t.includes("brownie")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200";
  if (t.includes("cheesecake")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVx3l209jDCJWm0xlCYP2Apvyl9gGhIhONEQ&s";
  if (t.includes("cookie")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD1Z1JeI-xSFEsYha_QhF384oxRucDg-Z3qg&s";
  if (t.includes("ice cream") || t.includes("gelato")) return "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1200";
  if (t.includes("donut") || t.includes("doughnut")) return "https://media.istockphoto.com/id/538335769/photo/donut-with-sprinkles-isolated.jpg?s=612x612&w=0&k=20&c=rCA_fEe8H3qwXT20aYfRJTrMHpSB8deFuiKK0ygQLwg=";
  if (t.includes("pie") || t.includes("tart")) return "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=1200";

  // --- FALLBACK ---
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
    <Shell className="min-h-screen bg-stone-50">
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-96 bg-linear-to-b from-stone-900 to-stone-50 z-0"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto pt-8 pb-32 px-6">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between text-white/80 mb-8">
            <button onClick={() => router.push("/")} className="hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> Home
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-bold text-white">AI Generated Plan</span>
            </div>
        </div>

        {/* RECIPE CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700 relative">
          
          {/* Hero Image Section */}
          <div className="relative w-full h-80 md:h-96">
             <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />
             <img 
               src={imageUrl} 
               alt={recipe.title} 
               className="w-full h-full object-cover"
             />
             
             {/* Floating Title Over Image */}
             <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
                    <ChefHat className="w-4 h-4" /> Ready to Cook
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-lg">
                  {recipe.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-white/90 font-medium">
                  <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <Clock className="w-4 h-4" /> {recipe.totalTime}
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <Utensils className="w-4 h-4" /> {recipe.steps?.length || 0} Steps
                  </span>
                </div>
             </div>
          </div>

          <div className="p-8 md:p-12">
            
            {/* Description */}
            <div className="mb-12">
              <p className="text-xl text-stone-600 leading-relaxed font-light">
                {recipe.description}
              </p>
            </div>

            {/* Ingredients Grid */}
            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-emerald-600" /> Prep List
                  </h3>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    {recipe.ingredients?.length || 0} Items
                  </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {recipe.ingredients?.map((ing, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group">
                     <span className="font-medium text-stone-700 flex items-center gap-3">
                       <CheckCircle2 className="w-5 h-5 text-emerald-100 group-hover:text-emerald-500 transition-colors" />
                       <span className="group-hover:text-stone-900 transition-colors">{ing.name}</span>
                     </span>
                     <span className="font-bold text-stone-500 text-sm bg-stone-100 px-3 py-1.5 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                       {ing.amount}
                     </span>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </div>

        {/* BOTTOM FLOATING ACTION BAR */}
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-2 rounded-4xl shadow-2xl flex items-center gap-2 max-w-2xl w-full">
                <button
                    onClick={handleEditInputs}
                    className="px-8 py-4 text-stone-500 font-bold hover:text-stone-800 transition-colors rounded-3xl hover:bg-stone-100 flex-1"
                >
                    Edit
                </button>
                <button
                    onClick={handleStartCooking} 
                    className="flex-2 px-10 py-4 bg-stone-900 text-white font-bold text-lg rounded-[1.8rem] shadow-lg hover:bg-black hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Play className="w-5 h-5 fill-current" /> Let's Cook
                </button>
            </div>
        </div>

      </div>
    </Shell>
  );
}