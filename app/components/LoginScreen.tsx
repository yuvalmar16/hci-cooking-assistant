/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, ArrowRight, User } from "lucide-react";

export function LoginScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  // On mount, check if name already exists
  useEffect(() => {
    const savedName = localStorage.getItem("chefName");
    if (savedName) {
      router.push("/home");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Save name and redirect
    localStorage.setItem("chefName", name.trim());
    router.push("/home");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-stone-900">
      
      {/* --- BACKGROUND IMAGE & GRADIENT --- */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=2000&q=80')" 
        }}
      >
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
      </div>

      {/* --- CARD CONTAINER --- */}
      <div className="relative z-10 w-full max-w-md p-6 animate-in slide-in-from-bottom-8 duration-700">
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center relative overflow-hidden group">
          
          {/* Decorative Glow */}
          <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-1000"></div>

          {/* --- LOGO SECTION --- */}
          <div className="relative mb-8 inline-block">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6 transform group-hover:scale-105 transition-transform duration-500">
               {/* Replace with your actual logo path, or use this icon fallback if image fails */}
               <img 
                 src="/LOGO.png" 
                 alt="SuChef Logo" 
                 className="w-24 h-24 object-contain"
                 onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-16 h-16 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>';
                 }}
               />
            </div>
          </div>

          {/* --- HEADINGS --- */}
          <div className="relative space-y-3 mb-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-md">
              Welcome to <span className="text-emerald-400">SouZie</span>
            </h2>
            <p className="text-stone-200 text-lg font-light">
              Your personal AI culinary companion.
            </p>
          </div>

          {/* --- FORM --- */}
          <form onSubmit={handleSubmit} className="relative w-full space-y-6">
            
            <div className="relative group/input">
              <div className="absolute top-1/2 -translate-y-1/2 left-5 text-stone-400 group-focus-within/input:text-emerald-500 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should I call you?"
                className="w-full bg-black/20 border border-white/10 text-white placeholder:text-stone-400 rounded-2xl py-4 pl-14 pr-6 text-lg focus:outline-none focus:bg-black/40 focus:border-emerald-500/50 transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            >
              Let's Get Cooking 
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>

          </form>

        </div>
        
        <p className="text-center text-stone-500 text-sm mt-6 font-medium">
            Ready to master the kitchen?
        </p>

      </div>
    </div>
  );
}