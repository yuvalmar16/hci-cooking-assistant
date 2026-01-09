/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      
      {/* --- BACKGROUND IMAGE & BLUR --- */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://heartresearch.org.uk/wp-content/uploads/2025/07/cooking-from-scratch.webp')" 
        }}
      >
        {/* Dark Overlay with Blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* --- CARD CONTAINER --- */}
      <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center text-center">
          
          {/* --- LOGO --- */}
          <div className="mb-6 drop-shadow-md">
            <img 
              src="/LOGO.png" 
              alt="SuChef Logo" 
              className="w-52 h-52 object-contain mx-auto hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* --- FIXED HEADINGS --- */}
          <h2 className="text-3xl font-bold text-stone-700 mb-2 tracking-wide">
            Welcome to SouZie!
          </h2>
          
          <p className="text-stone-500 text-lg font-medium mb-1">
            Your personal cooking assistant.
          </p>

          <p className="text-stone-400 text-sm mb-8">
            Let's get cooking! Please enter your name to continue.
          </p>
          {/* ---------------------- */}

          {/* --- FORM --- */}
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            
            <div className="relative text-left">
              <label 
                htmlFor="name" 
                className="block text-stone-500 text-xs uppercase font-bold tracking-wider mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name here"
                // Updated focus color to emerald-500
                className="w-full border-b border-stone-300 py-3 text-stone-800 text-lg bg-transparent focus:border-emerald-500 focus:outline-none placeholder:text-stone-300 transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              // Updated to Emerald Green (Standard App Theme)
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg shadow-emerald-100 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              Continue
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}