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
    <div className="flex flex-col items-center justify-center space-y-8 fade-in">
      <label htmlFor="name" className="text-4xl md:text-5xl font-medium text-stone-800 text-center leading-tight">
        What should I call you?
      </label>

      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-md space-y-6">
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full text-center text-3xl md:text-4xl border-b-2 border-stone-300 bg-transparent py-4 focus:border-emerald-500 focus:outline-none placeholder:text-stone-300 transition-colors"
          autoFocus
        />

        <button
          type="submit"
          disabled={!name.trim()}
          className="px-12 py-4 bg-emerald-600 text-white text-xl rounded-full shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </form>
    </div>
  );
}