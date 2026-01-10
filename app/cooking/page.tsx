/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/Shell";
import { Recipe, Step } from "../types"; 
import { useTimers } from "../context/TimerContext";
import { ChatPanel } from "../components/ChatPanel"; 
// *** FIXED IMPORT: Added Sparkles ***
import { Lightbulb, TrendingUp, Mic, MicOff, CheckCircle, Utensils, Info, Play, Pause, Clock, Sparkles } from "lucide-react";

// --- HELPERS ---
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

const parseDuration = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseInt(val);
    if (!isNaN(num)) {
       return num < 60 ? num * 60 : num;
    }
  }
  return 0;
};

const shouldShowTimer = (step: Step): boolean => {
  if (step.isFixedTime) return true;
  const text = step.instruction.toLowerCase();
  const cookingKeywords = ["boil", "fry", "bake", "roast", "simmer", "steam", "poach", "cook", "heat", "sauté", "brown", "grill", "broil", "wait", "rest", "marinate", "chill", "freeze", "cool"];
  const timeKeywords = ["minutes", "mins", "hour", "hrs", "seconds"];
  const isCookingAction = cookingKeywords.some(k => text.includes(k));
  const hasTimeMention = timeKeywords.some(k => text.includes(k));
  return isCookingAction || hasTimeMention;
};

const hasIngredientDependency = (currentText: string, nextText: string): boolean => {
  const cleanCurrent = currentText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  const cleanNext = nextText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  const currentWords = cleanCurrent.split(/\s+/);
  const nextWords = cleanNext.split(/\s+/);
  const ignoredWords = new Set(["the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "and", "or", "place", "put", "add", "transfer", "remove", "serve", "plate", "garnish", "cook", "boil", "fry", "bake", "roast", "grill", "heat", "whisk", "mix", "minutes", "mins", "hours", "until", "soft", "tender", "done", "pan", "pot", "bowl", "into", "onto", "from", "over", "under", "through"]);

  for (const word of nextWords) {
      if (word.length < 3) continue; 
      if (ignoredWords.has(word)) continue; 
      if (currentWords.includes(word)) return true;
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
  const activeTimer = recipe && recipe.steps[currentStepIndex] 
      ? timers.find((t) => t.id === String(recipe.steps[currentStepIndex].id)) 
      : undefined;

  const stepStartTime = useRef<number>(Date.now()); 
  const globalRecognitionRef = useRef<any>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const stored = localStorage.getItem("currentRecipe");
    const storedStep = localStorage.getItem("cookingStep");
    const lastSessionId = localStorage.getItem("activeRecipeTitle"); 

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            parsed.imageUrl = getRecipeImage(parsed.title);
            setRecipe(parsed);

            if (parsed.title !== lastSessionId) {
                console.log("New recipe detected. Resetting to Step 1.");
                setCurrentStepIndex(0);
                localStorage.setItem("cookingStep", "0");
                localStorage.setItem("activeRecipeTitle", parsed.title);
            } 
            else if (storedStep) {
                const idx = Number(storedStep);
                if (idx >= 0 && idx < parsed.steps.length) {
                    setCurrentStepIndex(idx);
                } else {
                    setCurrentStepIndex(0); 
                }
            }
        } catch (e) {
            console.error("Error parsing recipe", e);
            router.push("/");
        }
    } else {
        router.push("/");
    }
    stepStartTime.current = Date.now();
  }, [router]);

  useEffect(() => {
    localStorage.setItem("cookingStep", String(currentStepIndex));
  }, [currentStepIndex]);

  useEffect(() => {
    const interval = setInterval(() => { setNow(Date.now()); }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    stepStartTime.current = Date.now();
  }, [currentStepIndex]);

  const currentStep = recipe?.steps[currentStepIndex];
  const nextStep = recipe?.steps[currentStepIndex + 1];
  const isLastStep = recipe ? currentStepIndex === recipe.steps.length - 1 : false;

  const totalRemainingMinutes = useMemo(() => {
    if (!recipe || !recipe.steps) return 0;
    
    let totalSeconds = 0;
    const safeMultiplier = (!isNaN(pacingMultiplier) && pacingMultiplier > 0) ? pacingMultiplier : 1.0;

    recipe.steps.forEach((step, index) => {
        if (index < currentStepIndex) return;
        const stepDuration = parseDuration(step.duration);

        if (index === currentStepIndex) {
            if (activeTimer && activeTimer.id === String(step.id) && activeTimer.status !== 'finished') {
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

  const getOptimizationSuggestion = () => {
    if (!activeTimer || !nextStep || !currentStep) return null;
    
    const isLongWait = activeTimer.status === 'running' && activeTimer.remainingSeconds > 120; 
    const isNextManual = !nextStep.isFixedTime; 
    const hasDependency = hasIngredientDependency(currentStep.instruction, nextStep.instruction);

    if (isLongWait && isNextManual && !hasDependency) {
        return (
            <div className="mt-8 mb-4 bg-linear-to-r from-indigo-50 to-white border-l-4 border-indigo-500 p-6 rounded-xl shadow-lg relative z-20 animate-in slide-in-from-left duration-700">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <Lightbulb className="w-6 h-6 text-indigo-600 shrink-0" />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Chef's Trick</h4>
                        <p className="text-indigo-800 text-base mt-1">Don't just wait! You can prep the next step now.</p>
                        <div className="mt-3 inline-block bg-white border border-indigo-200 px-4 py-2 rounded-full text-sm font-semibold text-indigo-700 shadow-sm">
                            Next: {nextStep.instruction}
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
      localStorage.setItem("cookingStep", "0"); 
      router.push("/complete");
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
    const stepIdStr = String(currentStep.id);
    if (!activeTimer) addTimer(stepIdStr, `Step ${currentStepIndex + 1}`, duration);
    else if (activeTimer.status === "paused") toggleTimer(stepIdStr);
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
    <Shell className="relative overflow-hidden min-h-screen bg-stone-50">
      
      {/* --- BACKGROUND BLOBS --- */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* --- HERO IMAGE BACKGROUND --- */}
      {recipe.imageUrl && (
        <div className="absolute top-0 left-0 w-full h-120 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-stone-50/80 to-stone-50 z-10"></div>
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* --- MODAL --- */}
      {showStartModal && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-stone-900 mb-3 font-serif">Enable Chef Mode?</h2>
                <p className="text-stone-500 mb-8 text-lg leading-relaxed">
                    Keep your hands clean. Control the app by saying "Next", "Start Timer", or "Hey Susie".
                </p>
                <div className="grid gap-3">
                    <button onClick={() => confirmHandsFree(true)} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center justify-center gap-3 text-lg transition-transform active:scale-95 shadow-lg shadow-emerald-200">
                        <CheckCircle className="w-6 h-6" /> Yes, Enable Hands-Free
                    </button>
                    <button onClick={() => confirmHandsFree(false)} className="w-full py-4 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200 transition-colors">
                        No, Manual Mode
                    </button>
                </div>
            </div>
        </div>
      )}

      <ChatPanel isOpen={isChatOpen} onClose={closeChat} currentStep={currentStep.instruction} />

      {/* --- HEADER CONTROLS --- */}
      <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-3 z-50">
        
        {isGlobalListening ? (
          <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-full text-xs font-bold animate-pulse shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 bg-white rounded-full"></span> LISTENING
          </div>
        ) : (
           <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md text-stone-500 px-4 py-2 rounded-full text-xs font-bold border border-white/20 shadow-sm">
               <MicOff className="w-3 h-3" /> {handsFreeMode ? "PAUSED" : "OFF"}
           </div>
        )}

        {lastHeard && !isChatOpen && (
          <div className="bg-stone-900/90 backdrop-blur text-white text-sm px-4 py-2 rounded-xl shadow-xl max-w-50 truncate animate-in slide-in-from-right">&quot; {lastHeard} &quot;</div>
        )}

        {pacingMultiplier !== 1.0 && (
             <div className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-md text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200/50">
                <TrendingUp className="w-3 h-3" /> {pacingMultiplier.toFixed(2)}x Speed
             </div>
        )}

        <div className="mt-2 flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/50 px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top duration-700">
            <div className="bg-amber-100 p-2 rounded-full"><Utensils className="w-5 h-5 text-amber-600" /></div>
            <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Dinner Ready In</p>
                <p className="text-xl font-bold text-stone-800 leading-none">~{totalRemainingMinutes} min</p>
            </div>
        </div>

      </div>

      {/* --- PROGRESS BAR --- */}
      <div className="relative z-10 flex gap-2 mb-16 mt-32 max-w-5xl mx-auto px-4"> 
        {recipe.steps.map((_, idx) => (
          <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentStepIndex ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-stone-200/50"}`} />
        ))}
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-24 max-w-6xl mx-auto px-6 pb-32">
        <div className="flex-1 space-y-8">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-emerald-100 text-emerald-800 rounded-full font-bold tracking-wide text-sm uppercase shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Step {currentStepIndex + 1} of {recipe.steps.length}
            </div>
            <button onClick={() => setIsChatOpen(true)} className="md:hidden text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg text-sm">Ask Chef AI</button>
          </div>
          
          {/* Instruction Text */}
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-stone-800 leading-tight drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentStep.instruction}
          </h1>

          {getOptimizationSuggestion()}

          {/* Timer Section */}
          {currentStep.duration && shouldShowTimer(currentStep) ? (
            <div className="pt-6">
              {!activeTimer ? (
                <button 
                    onClick={handleStartTimer} 
                    className="group flex items-center gap-4 px-8 py-5 bg-white border-2 border-emerald-100 rounded-full shadow-lg hover:shadow-emerald-100 hover:border-emerald-400 transition-all duration-300"
                >
                  <div className="bg-emerald-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Required Time</p>
                    <p className="text-xl font-bold text-stone-800">Start {Math.ceil(parseDuration(currentStep.duration)/60)}m Timer</p>
                  </div>
                </button>
              ) : (
                <div className={`inline-flex items-center gap-6 px-8 py-6 rounded-4xl border backdrop-blur-xl shadow-2xl transition-all ${activeTimer.status === 'finished' ? 'bg-amber-50 border-amber-200' : 'bg-white/90 border-emerald-100'}`}>
                   <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-stone-100" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className={activeTimer.status === 'finished' ? "text-amber-500" : "text-emerald-500"} strokeDasharray={175} strokeDashoffset={175 - (175 * activeTimer.remainingSeconds) / activeTimer.originalDuration} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {activeTimer.status === 'running' ? <Pause className="w-6 h-6 text-stone-400" /> : <Play className="w-6 h-6 text-stone-400" />}
                        </div>
                   </div>
                   
                   <div>
                       <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{activeTimer.label}</p>
                       <span className={`text-5xl font-mono font-bold tracking-tighter ${activeTimer.status === 'finished' ? 'text-amber-600' : 'text-stone-800'}`}>
                         {Math.floor(activeTimer.remainingSeconds / 60)}:{(activeTimer.remainingSeconds % 60).toString().padStart(2, '0')}
                       </span>
                   </div>

                   {activeTimer.status !== "finished" && (
                     <button onClick={handleToggleTimer} className="ml-4 p-4 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
                        {activeTimer.status === "running" ? "Pause" : "Resume"}
                     </button>
                   )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <div className="hidden md:block w-1/3 pt-24">
          <button 
            onClick={() => setIsChatOpen(true)} 
            className="mb-12 w-full p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-lg hover:shadow-xl hover:bg-white transition-all group text-left relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles className="w-24 h-24 text-emerald-900" />
             </div>
             <span className="block text-emerald-700 font-bold mb-1 text-lg">Chef Intelligence</span>
             <span className="text-stone-500 group-hover:text-stone-800 relative z-10">{handsFreeMode ? 'Say "Hey Susie"...' : 'Click to ask a question...'}</span>
          </button>
          
           {timers.length > 0 && timers.some(t => t.id !== String(currentStep.id)) && (
             <div className="mb-12 animate-in slide-in-from-right duration-500">
               <h3 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4 ml-2">Active Timers</h3>
               <div className="space-y-3">
                 {timers.filter(t => t.id !== String(currentStep.id)).map(t => {
                   const relevantStep = recipe.steps.find(s => String(s.id) === t.id);
                   const stepName = relevantStep ? relevantStep.instruction : "Background Task";

                   return (
                   <div key={t.id} className={`group relative p-4 rounded-2xl border flex justify-between items-center shadow-sm backdrop-blur-sm transition-all hover:scale-105 cursor-help ${t.status === 'finished' ? 'bg-amber-50/90 border-amber-200' : 'bg-white/80 border-stone-100'}`}>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-stone-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-bold mb-1 border-b border-stone-600 pb-1 text-emerald-400">{t.label}</div>
                        {stepName}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                           <p className="text-xs text-stone-500 font-bold uppercase">{t.label}</p>
                           {t.status === 'finished' && <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>}
                       </div>
                       <p className={`font-mono text-2xl ${t.status === 'finished' ? 'text-amber-600 font-bold' : 'text-stone-800'}`}>
                         {t.status === 'finished' ? 'DONE' : `${Math.floor(t.remainingSeconds / 60)}:${(t.remainingSeconds % 60).toString().padStart(2, '0')}`}
                       </p>
                     </div>
                     {t.status === 'finished' && (
                       <button onClick={() => removeTimer(t.id)} className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-100 rounded-full transition-colors">×</button>
                     )}
                   </div>
                 )})}
               </div>
             </div>
          )}
          
          <div className="opacity-60 select-none grayscale">
            {nextStep ? (
              <div className="space-y-4">
                <span className="uppercase tracking-widest text-xs text-stone-400 font-bold ml-1">Coming Up</span>
                <div className="p-6 rounded-3xl border-2 border-stone-200/50 bg-stone-50">
                    <p className="text-xl text-stone-600 font-medium font-serif leading-relaxed line-clamp-3">{nextStep.instruction}</p>
                </div>
              </div>
            ) : (
              <div className="text-stone-300 italic text-xl font-serif text-center mt-10">Bon Appétit awaits.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-lg border-t border-stone-100 md:static md:bg-transparent md:border-0 md:p-0 md:mt-24 flex items-center justify-between gap-4 relative z-20 max-w-5xl mx-auto">
        <button 
            onClick={handleBack} 
            className="px-8 py-4 text-stone-500 font-bold hover:text-stone-800 transition-colors bg-white border border-stone-200 rounded-2xl hover:border-stone-300 active:scale-95"
        >
            Back
        </button>
        <button 
            onClick={handleNext} 
            className="flex-1 md:flex-none px-12 py-5 bg-stone-900 text-white text-xl font-bold rounded-4xl shadow-2xl hover:bg-black hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {isLastStep ? "Finish Cooking" : "Next Step →"}
        </button>
      </div>

    </Shell>
  );
}