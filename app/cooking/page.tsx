"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe, Step } from "../types"; 
import { useTimers } from "../context/TimerContext";
import { ChatPanel } from "../components/ChatPanel"; 
import { Lightbulb, TrendingUp, Mic, MicOff, CheckCircle, Utensils, Info } from "lucide-react";

// --- IMAGE GENERATOR HELPER ---
const getRecipeImage = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes("sushi") || t.includes("roll")) return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200";
  if (t.includes("wok") || t.includes("stir")) return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200";
  if (t.includes("indian") || t.includes("curry") || t.includes("tikka")) return "https://www.allrecipes.com/thmb/cF4D_jCqxkPpjg08TdHXk1E-3nM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/212721-indian-chicken-curry-murgh-kari-DDMFS-4x3-330302d59ca64543b3d7ead88c226f9a.jpg";
  if (t.includes("schnitzel") || t.includes("milanesa")) return "https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&w=1200";
  if (t.includes("cake") || t.includes("bake") || t.includes("dessert")) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200";
  if ((t.includes("chicken") && t.includes("potato")) || t.includes("roast")) return "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200";
  if (t.includes("fish") && t.includes("chips")) return "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=1200";
  if (t.includes("sandwich") || t.includes("burger") || t.includes("toast")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200";
  if (t.includes("shakshuka")) return "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1200";
  if (t.includes("omelet") || t.includes("egg") || t.includes("breakfast")) return "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1200";
  if (t.includes("pasta") || t.includes("spaghetti")) return "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=1200";
  if (t.includes("pizza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200";
  if (t.includes("salad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200";
  if (t.includes("soup")) return "https://www.thespruceeats.com/thmb/lko3xX8clhOrC894t9Drb6MoiX0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/easy-and-hearty-vegetable-soup-99538-hero-01-1d3b936ff03144af95ddca7640259c11.jpg";
  return "https://media.istockphoto.com/id/887636042/photo/the-start-of-something-delicious.jpg?s=612x612&w=0&k=20&c=2T_BCJQhhkfohcbcDZ14OV8rPStICJ9Q1_YjGUW2wCo=";
};

// --- DATA PARSING HELPER ---
const parseDuration = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseInt(val);
    if (!isNaN(num)) {
       return num < 60 ? num * 60 : num;
    }
  }
  return 0;
};

// --- TIMER LOGIC ---
const shouldShowTimer = (step: Step): boolean => {
  if (step.isFixedTime) return true;

  const text = step.instruction.toLowerCase();
  const cookingKeywords = [
    "boil", "fry", "bake", "roast", "simmer", "steam", "poach", 
    "cook", "heat", "sauté", "brown", "grill", "broil",
    "wait", "rest", "marinate", "chill", "freeze", "cool"
  ];
  const timeKeywords = ["minutes", "mins", "hour", "hrs", "seconds"];

  const isCookingAction = cookingKeywords.some(k => text.includes(k));
  const hasTimeMention = timeKeywords.some(k => text.includes(k));

  return isCookingAction || hasTimeMention;
};

// --- NEW: DEPENDENCY CHECKER (Fixes the "Burger" bug) ---
const hasIngredientDependency = (currentText: string, nextText: string): boolean => {
  // 1. Clean texts
  const cleanCurrent = currentText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  const cleanNext = nextText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

  // 2. Tokenize
  const currentWords = cleanCurrent.split(/\s+/);
  const nextWords = cleanNext.split(/\s+/);

  // 3. Ignored Words (Verbs & Prepositions)
  const ignoredWords = new Set([
    "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "and", "or",
    "place", "put", "add", "transfer", "remove", "serve", "plate", "garnish",
    "cook", "boil", "fry", "bake", "roast", "grill", "heat", "whisk", "mix",
    "minutes", "mins", "hours", "until", "soft", "tender", "done", "pan", "pot", "bowl",
    "into", "onto", "from", "over", "under", "through"
  ]);

  // 4. Intersection Check
  for (const word of nextWords) {
      if (word.length < 3) continue; 
      if (ignoredWords.has(word)) continue; 
      if (currentWords.includes(word)) return true; // Dependency found (e.g. "Burger")
  }
  return false;
};


export default function CookingPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [now, setNow] = useState(Date.now()); 
  
  const [showStartModal, setShowStartModal] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [isGlobalListening, setIsGlobalListening] = useState(false);
  const [lastHeard, setLastHeard] = useState(""); 
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [triggeredByVoice, setTriggeredByVoice] = useState(false);

  const router = useRouter();
  const { timers, addTimer, toggleTimer, removeTimer, pacingMultiplier, recordStepTime } = useTimers();
  const stepStartTime = useRef<number>(Date.now()); 
  
  const globalRecognitionRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now()); 
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("currentRecipe");
    if (stored) {
        const parsed = JSON.parse(stored);
        parsed.imageUrl = getRecipeImage(parsed.title);
        setRecipe(parsed);
    }
    else router.push("/");
    stepStartTime.current = Date.now();
  }, [router]);

  useEffect(() => {
    stepStartTime.current = Date.now();
  }, [currentStepIndex]);

  useEffect(() => {
    if (pacingMultiplier !== 1.0 && !isNaN(pacingMultiplier)) {
        localStorage.setItem("userVelocityProfile", pacingMultiplier.toString());
    }
  }, [pacingMultiplier]);

  const currentStep = recipe?.steps[currentStepIndex];
  const nextStep = recipe?.steps[currentStepIndex + 1];
  const isLastStep = recipe ? currentStepIndex === recipe.steps.length - 1 : false;
  const activeTimer = timers.find((t) => t.id === currentStep?.id);

  // --- TOTAL TIME CALCULATION ---
  const totalRemainingMinutes = useMemo(() => {
    if (!recipe || !recipe.steps) return 0;
    
    let totalSeconds = 0;
    const safeMultiplier = (!isNaN(pacingMultiplier) && pacingMultiplier > 0) ? pacingMultiplier : 1.0;

    recipe.steps.forEach((step, index) => {
        if (index < currentStepIndex) return;
        const stepDuration = parseDuration(step.duration);

        if (index === currentStepIndex) {
            if (activeTimer && activeTimer.id === step.id && activeTimer.status !== 'finished') {
                totalSeconds += activeTimer.remainingSeconds;
            } else {
                totalSeconds += step.isFixedTime ? stepDuration : (stepDuration * safeMultiplier);
            }
        } else {
            totalSeconds += step.isFixedTime ? stepDuration : (stepDuration * safeMultiplier);
        }
    });
    
    const minutes = Math.ceil(totalSeconds / 60);
    return isNaN(minutes) ? 0 : minutes;

  }, [recipe, currentStepIndex, pacingMultiplier, activeTimer, now]); 

  // --- UPDATED SMART OPTIMIZATION ENGINE ---
  const getOptimizationSuggestion = () => {
    if (!activeTimer || !nextStep) return null;
    
    // 1. Is the user waiting? (> 2 mins)
    const isLongWait = activeTimer.status === 'running' && activeTimer.remainingSeconds > 120; 
    
    // 2. Is the next step active labor? (Not another timer)
    const isNextManual = !nextStep.isFixedTime; 

    // 3. SAFETY: Is the next step logically dependent on the current one?
    const hasDependency = hasIngredientDependency(currentStep.instruction, nextStep.instruction);

    if (isLongWait && isNextManual && !hasDependency) {
        return (
            <div className="mt-8 mb-4 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg animate-pulse shadow-sm relative z-20">
                <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Smart Optimization</h4>
                        <p className="text-indigo-800 text-sm mt-1">While waiting, you can start the next step.</p>
                        <div className="mt-2 inline-block bg-white border border-indigo-200 px-3 py-1 rounded text-sm font-semibold text-indigo-700">
                            Action: {nextStep.instruction}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
  };

  const handleNext = useCallback(() => {
    if (!recipe || !currentStep) return; 
    const stepDuration = parseDuration(currentStep.duration);
    const timeSpentSeconds = (Date.now() - stepStartTime.current) / 1000;
    
    if (stepDuration > 0) {
        recordStepTime(stepDuration, timeSpentSeconds, currentStep.isFixedTime);
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
    const duration = parseDuration(currentStep.duration);

    if (duration === 0) { alert("No time limit detected for this step."); return; }
    
    if (!activeTimer) addTimer(currentStep.id, `Step ${currentStepIndex + 1}`, duration);
    else if (activeTimer.status === "paused") toggleTimer(currentStep.id);
  }, [currentStep, activeTimer, addTimer, toggleTimer, currentStepIndex]);

  const handleToggleTimer = useCallback(() => {
    if (activeTimer) toggleTimer(activeTimer.id);
  }, [activeTimer, toggleTimer]);

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


  const stopGlobalMic = () => {
    if (globalRecognitionRef.current) {
        globalRecognitionRef.current.stop();
        setIsGlobalListening(false);
    }
  };

  const startGlobalMic = useCallback(() => {
    if (!handsFreeMode || typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isGlobalListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = false; 
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsGlobalListening(true);
    recognition.onend = () => {
      setIsGlobalListening(false);
      if (!isChatOpen) { 
        setTimeout(() => { try { recognition.start(); } catch (e) {} }, 1000);
      }
    };

    recognition.onresult = (event: any) => {
      const resultIndex = event.results.length - 1;
      const transcript = event.results[resultIndex][0].transcript.toLowerCase().trim();
      setLastHeard(transcript); 
      console.log("Global Mic Heard:", transcript);

      if (transcript.includes("susie") || transcript.includes("suzi") || transcript.includes("hey susie")) {
          recognition.stop(); 
          setIsGlobalListening(false);
          setTriggeredByVoice(true);
          setIsChatOpen(true);
          return;
      }
      if (transcript.includes("next") || transcript.includes("done")) handleNextRef.current(); 
      else if (transcript.includes("back")) handleBackRef.current(); 
      else if (transcript.includes("start") || transcript.includes("clock")) handleStartTimerRef.current(); 
      else if (transcript.includes("stop") || transcript.includes("pause") || transcript.includes("timer")) {
        if (!transcript.includes("start")) handleToggleTimerRef.current();
      }
    };
    try { recognition.start(); globalRecognitionRef.current = recognition; } catch (e) {}
  }, [handsFreeMode, isChatOpen]); 

  useEffect(() => {
      if (handsFreeMode && !isChatOpen && !showStartModal) startGlobalMic();
      else stopGlobalMic();
      return () => stopGlobalMic();
  }, [handsFreeMode, isChatOpen, showStartModal, startGlobalMic]);


  const closeChat = () => {
      setIsChatOpen(false);
      setTriggeredByVoice(false); 
  };

  const confirmHandsFree = (enabled: boolean) => {
      setHandsFreeMode(enabled);
      setShowStartModal(false);
  };


  if (!recipe || !currentStep) return null;

  return (
    <Shell className="max-w-5xl relative overflow-hidden">
      
      {recipe.imageUrl && (
        <div className="absolute top-0 left-0 w-full h-96 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-white/90 to-stone-50 z-10"></div>
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {showStartModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <Mic className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Enable Hands-Free?</h2>
                <p className="text-stone-500 mb-8">
                    Smart Chef can listen to commands like &quot;Next&quot;, &quot;Start Timer&quot;, and &quot;Hey Susie&quot;.
                </p>
                <div className="grid gap-3">
                    <button onClick={() => confirmHandsFree(true)} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5" /> Yes, Enable Hands-Free
                    </button>
                    <button onClick={() => confirmHandsFree(false)} className="w-full py-4 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200">
                        No, Manual Mode
                    </button>
                </div>
            </div>
        </div>
      )}

      <ChatPanel isOpen={isChatOpen} onClose={closeChat} currentStep={currentStep.instruction} autoStartListening={triggeredByVoice} />

      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2 z-50">
        
        {isGlobalListening ? (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-red-200 shadow-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span> LISTENING
          </div>
        ) : (
           <div className="flex items-center gap-2 bg-stone-100/90 backdrop-blur-sm text-stone-400 px-3 py-1 rounded-full text-xs font-bold">
               <MicOff className="w-3 h-3" /> {handsFreeMode ? "PAUSED" : "OFF"}
           </div>
        )}

        {lastHeard && !isChatOpen && (
          <div className="bg-stone-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-80 max-w-[150px] truncate transition-all">&quot; {lastHeard} &quot;</div>
        )}

        {pacingMultiplier !== 1.0 && (
             <div className="flex items-center gap-1 bg-blue-50/90 backdrop-blur-sm text-blue-600 px-2 py-1 rounded text-[10px] font-mono border border-blue-100">
                <TrendingUp className="w-3 h-3" /> Velocity: {pacingMultiplier.toFixed(2)}x
             </div>
        )}

        <div className="mt-2 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-stone-200 px-4 py-2 rounded-xl shadow-lg animate-in slide-in-from-right duration-500">
            <div className="bg-orange-100 p-2 rounded-full"><Utensils className="w-4 h-4 text-orange-600" /></div>
            <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Dinner Ready In</p>
                <p className="text-lg font-bold text-stone-800 leading-none">~{totalRemainingMinutes} min</p>
            </div>
        </div>

      </div>

      <div className="relative z-10 flex gap-2 mb-12 mt-32"> 
        {recipe.steps.map((_, idx) => (
          <div key={idx} className={`h-2 flex-1 rounded-full transition-colors ${idx <= currentStepIndex ? "bg-emerald-500 shadow-lg" : "bg-stone-200/50"}`} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-24">
        <div className="flex-1 space-y-8">
          
          <div className="flex items-center justify-between">
            <div className="inline-block px-4 py-2 bg-emerald-100/90 backdrop-blur text-emerald-800 rounded-full font-bold tracking-wide text-sm uppercase shadow-sm">
              Step {currentStepIndex + 1}
            </div>
            <button onClick={() => setIsChatOpen(true)} className="md:hidden text-stone-500 font-medium underline bg-white/50 px-2 py-1 rounded">Ask AI for help</button>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium text-stone-900 leading-tight drop-shadow-sm">{currentStep.instruction}</h1>

          {getOptimizationSuggestion()}

          {currentStep.duration && shouldShowTimer(currentStep) ? (
            <div className="pt-4">
              {!activeTimer ? (
                <button onClick={handleStartTimer} className="flex items-center gap-3 px-6 py-3 border-2 border-emerald-500 text-emerald-700 bg-white/80 backdrop-blur rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-sm">
                  <span className="text-xl">⏱️</span> Start {Math.ceil(parseDuration(currentStep.duration)/60)}m Timer
                </button>
              ) : (
                <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl border-2 shadow-md backdrop-blur-sm ${activeTimer.status === 'finished' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-emerald-50/90 border-emerald-500 text-emerald-800'}`}>
                   <span className="text-3xl font-mono font-bold">{Math.floor(activeTimer.remainingSeconds / 60)}:{(activeTimer.remainingSeconds % 60).toString().padStart(2, '0')}</span>
                   {activeTimer.status === "finished" ? (
                     <span className="font-bold uppercase">Done!</span>
                   ) : (
                     <button onClick={handleToggleTimer} className="underline text-sm opacity-60 hover:opacity-100">
                       {activeTimer.status === "running" ? "Pause" : "Resume"}
                     </button>
                   )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="hidden md:block w-1/3 pt-20">
          <button onClick={() => setIsChatOpen(true)} className="mb-12 w-full p-6 bg-white/80 backdrop-blur rounded-2xl border-2 border-stone-200 text-left hover:border-emerald-400 hover:bg-white transition-all group shadow-sm">
             <span className="block text-emerald-700 font-bold mb-1">Need help?</span>
             <span className="text-stone-500 group-hover:text-stone-800">{handsFreeMode ? 'Say "Hey Susie"...' : 'Click to Ask...'}</span>
          </button>
          
           {timers.length > 0 && timers.some(t => t.id !== currentStep.id) && (
             <div className="mb-12">
               <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-4 bg-white/50 inline-block px-1 rounded">Running in Background</h3>
               <div className="space-y-3">
                 {timers.filter(t => t.id !== currentStep.id).map(t => {
                   const relevantStep = recipe.steps.find(s => s.id === t.id);
                   const stepName = relevantStep ? relevantStep.instruction : "Background Task";

                   return (
                   <div key={t.id} className={`group relative p-4 rounded-xl border flex justify-between items-center shadow-sm backdrop-blur-sm transition-all hover:scale-105 cursor-help ${t.status === 'finished' ? 'bg-amber-50/90 border-amber-200' : 'bg-white/90 border-stone-200'}`}>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-stone-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-bold mb-1 border-b border-stone-600 pb-1 text-emerald-400">{t.label}</div>
                        {stepName}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-800"></div>
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                           <p className="text-xs text-stone-500 font-bold uppercase">{t.label}</p>
                           <Info className="w-3 h-3 text-stone-300 group-hover:text-emerald-500" />
                       </div>
                       <p className={`font-mono text-xl ${t.status === 'finished' ? 'text-amber-600 font-bold' : 'text-stone-800'}`}>
                         {t.status === 'finished' ? 'DONE' : `${Math.floor(t.remainingSeconds / 60)}:${(t.remainingSeconds % 60).toString().padStart(2, '0')}`}
                       </p>
                     </div>
                     {t.status === 'finished' && (
                       <button onClick={() => removeTimer(t.id)} className="text-stone-400 hover:text-stone-600">×</button>
                     )}
                   </div>
                 )})}
               </div>
             </div>
          )}
          
          <div className="opacity-50 select-none">
            {nextStep ? (
              <div className="space-y-4">
                <span className="uppercase tracking-widest text-sm text-stone-500 font-bold bg-white/50 inline-block px-1 rounded">Up Next</span>
                <p className="text-2xl text-stone-600 font-medium leading-relaxed">{nextStep.instruction}</p>
              </div>
            ) : (
              <div className="text-stone-300 italic text-xl">Finish line ahead.</div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-stone-100 md:static md:bg-transparent md:border-0 md:p-0 md:mt-24 flex items-center justify-between gap-4 relative z-20">
        <button onClick={handleBack} className="px-8 py-4 text-stone-500 font-medium hover:text-stone-800 transition-colors bg-white/50 rounded-xl">Back</button>
        <button onClick={handleNext} className="flex-1 md:flex-none px-12 py-5 bg-stone-800 text-white text-xl rounded-full shadow-xl hover:bg-stone-900 transition-transform active:scale-95">
          {isLastStep ? "Finish Cooking" : "Next Step →"}
        </button>
      </div>

    </Shell>
  );
}