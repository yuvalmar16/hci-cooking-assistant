"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe } from "../types";
import { useTimers } from "../context/TimerContext";
import { ChatPanel } from "../components/ChatPanel"; // Import ChatPanel

export default function CookingPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat State
  const router = useRouter();
  
  const { timers, addTimer, toggleTimer, removeTimer } = useTimers();

  useEffect(() => {
    const stored = localStorage.getItem("currentRecipe");
    if (stored) setRecipe(JSON.parse(stored));
    else router.push("/");
  }, [router]);

  if (!recipe) return null;

  const currentStep = recipe.steps[currentStepIndex];
  const nextStep = recipe.steps[currentStepIndex + 1];
  const isLastStep = currentStepIndex === recipe.steps.length - 1;
  const activeTimer = timers.find((t) => t.id === currentStep.id);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Shell className="max-w-5xl relative">
      
      {/* CHAT PANEL */}
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        currentStep={currentStep.instruction}
      />

      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {recipe.steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-colors ${
              idx <= currentStepIndex ? "bg-emerald-500" : "bg-stone-200"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-12 md:gap-24">
        
        {/* Active Step */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold tracking-wide text-sm uppercase">
              Step {currentStepIndex + 1}
            </div>
            
            {/* ASK AI BUTTON (Small, unobtrusive) */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="md:hidden text-stone-500 font-medium underline"
            >
              Ask AI for help
            </button>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium text-stone-900 leading-tight">
            {currentStep.instruction}
          </h1>

          {/* TIMER LOGIC */}
          {currentStep.duration && (
            <div className="pt-4">
              {!activeTimer ? (
                <button
                  onClick={() => addTimer(currentStep.id, `Step ${currentStepIndex + 1}`, currentStep.duration!)}
                  className="flex items-center gap-3 px-6 py-3 border-2 border-emerald-500 text-emerald-700 rounded-full font-bold hover:bg-emerald-50 transition-colors"
                >
                  <span className="text-xl">⏱️</span>
                  Start {currentStep.duration} Timer
                </button>
              ) : (
                <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl border-2 ${activeTimer.status === 'finished' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-emerald-50 border-emerald-500 text-emerald-800'}`}>
                   <span className="text-3xl font-mono font-bold">
                     {formatTime(activeTimer.remainingSeconds)}
                   </span>
                   {activeTimer.status === "finished" ? (
                     <span className="font-bold uppercase">Done!</span>
                   ) : (
                     <button onClick={() => toggleTimer(currentStep.id)} className="underline text-sm opacity-60 hover:opacity-100">
                       {activeTimer.status === "running" ? "Pause" : "Resume"}
                     </button>
                   )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar (Desktop) */}
        <div className="hidden md:block w-1/3 pt-20">
          
          {/* ASK AI BUTTON (Desktop Prominent) */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="mb-12 w-full p-6 bg-stone-100 rounded-2xl border-2 border-stone-200 text-left hover:border-emerald-400 hover:bg-white transition-all group"
          >
             <span className="block text-emerald-700 font-bold mb-1">Need help?</span>
             <span className="text-stone-500 group-hover:text-stone-800">Ask the Chef...</span>
          </button>

          {/* Active Parallel Timers */}
          {timers.length > 0 && timers.some(t => t.id !== currentStep.id) && (
             <div className="mb-12">
               <h3 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4">Parallel Tasks</h3>
               <div className="space-y-3">
                 {timers.filter(t => t.id !== currentStep.id).map(t => (
                   <div key={t.id} className={`p-4 rounded-xl border flex justify-between items-center ${t.status === 'finished' ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-200'}`}>
                     <div>
                       <p className="text-xs text-stone-500 font-bold uppercase">{t.label}</p>
                       <p className={`font-mono text-xl ${t.status === 'finished' ? 'text-amber-600 font-bold' : 'text-stone-800'}`}>
                         {t.status === 'finished' ? 'DONE' : formatTime(t.remainingSeconds)}
                       </p>
                     </div>
                     {t.status === 'finished' && (
                       <button onClick={() => removeTimer(t.id)} className="text-stone-400 hover:text-stone-600">×</button>
                     )}
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* Context Preview */}
          <div className="opacity-50 select-none">
            {nextStep ? (
              <div className="space-y-4">
                <span className="uppercase tracking-widest text-sm text-stone-400 font-bold">Up Next</span>
                <p className="text-2xl text-stone-600 font-medium leading-relaxed">{nextStep.instruction}</p>
              </div>
            ) : (
              <div className="text-stone-300 italic text-xl">Finish line ahead.</div>
            )}
          </div>
        </div>

      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-stone-100 md:static md:bg-transparent md:border-0 md:p-0 md:mt-24 flex items-center justify-between gap-4">
        <button onClick={() => { if(currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1); else router.back(); }} className="px-8 py-4 text-stone-500 font-medium hover:text-stone-800 transition-colors">Back</button>
        <button onClick={() => { if(isLastStep) { alert("Meal complete!"); router.push("/"); } else { setCurrentStepIndex(prev => prev + 1); window.scrollTo(0, 0); } }} className="flex-1 md:flex-none px-12 py-5 bg-stone-800 text-white text-xl rounded-full shadow-xl hover:bg-stone-900 transition-transform active:scale-95">
          {isLastStep ? "Finish Cooking" : "Next Step →"}
        </button>
      </div>

    </Shell>
  );
}