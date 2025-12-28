"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe } from "../types";
import { useTimers } from "../context/TimerContext";
import { ChatPanel } from "../components/ChatPanel"; 
import { Lightbulb, TrendingUp } from "lucide-react"; // Added Icons for the new features

export default function CookingPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState(""); 
  const router = useRouter();
  
  const { timers, addTimer, toggleTimer, removeTimer, pacingMultiplier, recordStepTime } = useTimers();
  const stepStartTime = useRef<number>(Date.now()); 

  useEffect(() => {
    const stored = localStorage.getItem("currentRecipe");
    if (stored) setRecipe(JSON.parse(stored));
    else router.push("/");
    stepStartTime.current = Date.now();
  }, [router]);

  useEffect(() => {
    stepStartTime.current = Date.now();
  }, [currentStepIndex]);

  // --- 1. SMART ENGINEERING: USER PERSISTENCE (Long-Term Memory) ---
  // Saves the machine learning data (pacingMultiplier) to local storage
  // so the system "remembers" if the user is fast/slow for future sessions.
  useEffect(() => {
    if (pacingMultiplier !== 1.0) {
        localStorage.setItem("userVelocityProfile", pacingMultiplier.toString());
        // For debugging/demo purposes:
        console.log("💾 Updated User Velocity Profile:", pacingMultiplier);
    }
  }, [pacingMultiplier]);

  // --- DERIVED STATE ---
  const currentStep = recipe?.steps[currentStepIndex];
  const nextStep = recipe?.steps[currentStepIndex + 1];
  const isLastStep = recipe ? currentStepIndex === recipe.steps.length - 1 : false;
  const activeTimer = timers.find((t) => t.id === currentStep?.id);

  // --- 2. SMART ENGINEERING: PARALLEL OPTIMIZATION (DAG Logic) ---
  // Analyzes the dependency graph: If current step is Passive (Waiting > 2min)
  // AND next step is Active (Manual labor), suggest parallel execution.
  const getOptimizationSuggestion = () => {
    if (!activeTimer || !nextStep) return null;

    const isLongWait = activeTimer.status === 'running' && activeTimer.remainingSeconds > 120; // > 2 mins
    const isNextManual = !nextStep.isFixedTime; // Assuming fixedTime = physics, !fixedTime = manual

    if (isLongWait && isNextManual) {
        return (
            <div className="mt-8 mb-4 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg animate-pulse shadow-sm">
                <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">
                            Smart Optimization Detected
                        </h4>
                        <p className="text-indigo-800 text-sm mt-1">
                            While waiting for the timer ({Math.floor(activeTimer.remainingSeconds / 60)}m), 
                            you have enough time to start the next step.
                        </p>
                        <div className="mt-2 inline-block bg-white border border-indigo-200 px-3 py-1 rounded text-sm font-semibold text-indigo-700">
                            Suggested Action: {nextStep.instruction}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
  };

  // --- NAVIGATION COMMANDS ---
  const handleNext = useCallback(() => {
    if (!recipe || !currentStep) return; 

    // Adaptive Logic
    const timeSpentSeconds = (Date.now() - stepStartTime.current) / 1000;
    if (currentStep.duration) {
      recordStepTime(currentStep.duration, timeSpentSeconds, currentStep.isFixedTime);
    }

    if (isLastStep) {
      alert("Meal complete!");
      router.push("/");
    } else {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo(0, 0); 
    }
  }, [recipe, currentStep, isLastStep, recordStepTime, router]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
    else router.back();
  }, [currentStepIndex, router]);

  const handleStartTimer = useCallback(() => {
    if (!currentStep) return;
    if (!currentStep.duration) {
      alert("This step has no time limit set.");
      return;
    }
    if (!activeTimer) {
      addTimer(currentStep.id, `Step ${currentStepIndex + 1}`, currentStep.duration);
    } else if (activeTimer.status === "paused") {
      toggleTimer(currentStep.id); // Resume if paused and user says "start"
    }
  }, [currentStep, activeTimer, addTimer, toggleTimer, currentStepIndex]);

  // NEW: Toggle Timer Logic (Pause/Resume)
  const handleToggleTimer = useCallback(() => {
    if (activeTimer) {
      toggleTimer(activeTimer.id);
    }
  }, [activeTimer, toggleTimer]);

  // --- REFS FOR STABLE ACCESS ---
  const handleNextRef = useRef(handleNext);
  const handleBackRef = useRef(handleBack);
  const handleStartTimerRef = useRef(handleStartTimer);
  const handleToggleTimerRef = useRef(handleToggleTimer);

  useEffect(() => {
    handleNextRef.current = handleNext;
    handleBackRef.current = handleBack;
    handleStartTimerRef.current = handleStartTimer;
    handleToggleTimerRef.current = handleToggleTimer;
  }, [handleNext, handleBack, handleStartTimer, handleToggleTimer]);


  // --- STABLE VOICE RECOGNITION ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = false; 
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => { 
        try { recognition.start(); } catch (e) { /* Already started */ } 
      }, 500);
    };

    recognition.onresult = (event: any) => {
      const resultIndex = event.results.length - 1;
      const transcript = event.results[resultIndex][0].transcript.toLowerCase().trim();
      
      setLastHeard(transcript); 
      console.log("🎤 Heard:", transcript);

      if (transcript.includes("next") || transcript.includes("done") || transcript.includes("continue")) {
        handleNextRef.current(); 
      } 
      else if (transcript.includes("back") || transcript.includes("previous")) {
        handleBackRef.current(); 
      } 
      else if (transcript.includes("start") || transcript.includes("begin") || transcript.includes("clock")) {
        handleStartTimerRef.current(); 
      }
      else if (transcript.includes("stop") || transcript.includes("pause") || transcript.includes("resume") || transcript.includes("timer")) {
        if (transcript.includes("start") || transcript.includes("begin")) {
            // Safety
        } else {
            handleToggleTimerRef.current();
        }
      }
    };

    try { recognition.start(); } catch (e) {}

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  }, []); 

  if (!recipe || !currentStep) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getAdjustedTime = (durationStr: string, isFixed?: boolean) => {
    if (isFixed) return null; 
    if (pacingMultiplier === 1.0) return null;
    const num = parseInt(durationStr);
    if (isNaN(num)) return null;
    const originalMinutes = durationStr.includes("min") ? num : 0;
    if (originalMinutes === 0) return null;
    const newTime = Math.round(originalMinutes * pacingMultiplier);
    return `${newTime} mins`;
  };

  return (
    <Shell className="max-w-5xl relative">
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        currentStep={currentStep.instruction}
      />

      {/* Mic Status & Debug */}
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2 z-50">
        {isListening ? (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-red-200 shadow-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            LISTENING
          </div>
        ) : (
           <div className="text-xs text-stone-300">Mic Off</div>
        )}

        {lastHeard && (
          <div className="bg-stone-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-80 max-w-[150px] truncate transition-all">
            " {lastHeard} "
          </div>
        )}

        {/* --- DEMO: Show Velocity Factor --- */}
        {pacingMultiplier !== 1.0 && (
             <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-mono border border-blue-100">
                <TrendingUp className="w-3 h-3" />
                Velocity: {pacingMultiplier.toFixed(2)}x
             </div>
        )}
      </div>

      <div className="flex gap-2 mb-12 mt-8">
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
        
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold tracking-wide text-sm uppercase">
              Step {currentStepIndex + 1}
            </div>
            <button onClick={() => setIsChatOpen(true)} className="md:hidden text-stone-500 font-medium underline">
              Ask AI for help
            </button>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium text-stone-900 leading-tight">
            {currentStep.instruction}
          </h1>

          {/* --- OPTIMIZATION UI INJECTION --- */}
          {getOptimizationSuggestion()}

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

        <div className="hidden md:block w-1/3 pt-20">
          <button onClick={() => setIsChatOpen(true)} className="mb-12 w-full p-6 bg-stone-100 rounded-2xl border-2 border-stone-200 text-left hover:border-emerald-400 hover:bg-white transition-all group">
             <span className="block text-emerald-700 font-bold mb-1">Need help?</span>
             <span className="text-stone-500 group-hover:text-stone-800">Ask the Chef...</span>
          </button>

          {/* Existing Parallel Tasks UI */}
          {timers.length > 0 && timers.some(t => t.id !== currentStep.id) && (
             <div className="mb-12">
               <h3 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4">Running in Background</h3>
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

          <div className="opacity-50 select-none">
            {nextStep ? (
              <div className="space-y-4">
                <span className="uppercase tracking-widest text-sm text-stone-400 font-bold">Up Next</span>
                <p className="text-2xl text-stone-600 font-medium leading-relaxed">{nextStep.instruction}</p>
                
                {nextStep.duration && !nextStep.isFixedTime && pacingMultiplier !== 1.0 && (
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold animate-pulse">
                    <span>⚡ Adjusted for you: {getAdjustedTime(nextStep.duration, nextStep.isFixedTime)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-stone-300 italic text-xl">Finish line ahead.</div>
            )}
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-stone-100 md:static md:bg-transparent md:border-0 md:p-0 md:mt-24 flex items-center justify-between gap-4">
        <button onClick={handleBack} className="px-8 py-4 text-stone-500 font-medium hover:text-stone-800 transition-colors">Back</button>
        <button onClick={handleNext} className="flex-1 md:flex-none px-12 py-5 bg-stone-800 text-white text-xl rounded-full shadow-xl hover:bg-stone-900 transition-transform active:scale-95">
          {isLastStep ? "Finish Cooking" : "Next Step →"}
        </button>
      </div>

    </Shell>
  );
}