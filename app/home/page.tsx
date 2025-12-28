"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";

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
      <header className="mb-12 mt-4">
        <h1 className="text-4xl md:text-5xl font-medium text-stone-800">
          {greeting}, {name}.
        </h1>
        <p className="mt-4 text-xl text-stone-500">
          How shall we cook today?
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Ingredients */}
        <button
          onClick={() => router.push("/input/ingredients")}
          className="group relative flex flex-col items-start justify-center p-8 h-64 bg-white rounded-3xl shadow-lg hover:shadow-emerald-100 border-2 border-stone-100 hover:border-emerald-500 transition-all duration-300 text-left"
        >
          <div className="mb-4 p-4 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:scale-110 transition-transform">
            {/* Simple Icon: Basket */}
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
            I have ingredients
          </h2>
          <p className="mt-2 text-stone-500">
            Find recipes based on what you have in the fridge.
          </p>
        </button>

        {/* Option 2: Paste Recipe */}
        <button
          onClick={() => router.push("/input/recipe")}
          className="group relative flex flex-col items-start justify-center p-8 h-64 bg-white rounded-3xl shadow-lg hover:shadow-emerald-100 border-2 border-stone-100 hover:border-emerald-500 transition-all duration-300 text-left"
        >
          <div className="mb-4 p-4 bg-stone-100 text-stone-600 rounded-2xl group-hover:scale-110 transition-transform">
            {/* Simple Icon: Clipboard */}
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
            Paste a recipe
          </h2>
          <p className="mt-2 text-stone-500">
            Clean up a chaotic web recipe into simple steps.
          </p>
        </button>
      </div>
    </Shell>
  );
}