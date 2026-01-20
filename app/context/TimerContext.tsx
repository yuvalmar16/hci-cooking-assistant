/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface Timer {
  id: string; 
  label: string;
  remainingSeconds: number;
  originalDuration: number; 
  status: "running" | "paused" | "finished";
}

interface TimerContextType {
  timers: Timer[];
  addTimer: (id: string, label: string, duration: string | number) => void;
  toggleTimer: (id: string) => void;
  removeTimer: (id: string) => void;
  pacingMultiplier: number;
  recordStepTime: (expected: string | number, actual: number, isFixedTime?: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// --- HELPER: Safe Duration Parser ---
const parseDuration = (val: string | number | undefined | null): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const s = val.toLowerCase();
    const num = parseInt(s);
    if (isNaN(num)) return 0;
    if (s.includes("min")) return num * 60;
    if (s.includes("hour") || s.includes("hr")) return num * 3600;
    return num; 
  }
  return 0;
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [pacingMultiplier, setPacingMultiplier] = useState(1.0);

  // --- PERSISTENCE: Load Velocity Profile ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userVelocityProfile");
      if (stored) {
        const val = parseFloat(stored);
        if (!isNaN(val) && val > 0) setPacingMultiplier(val);
      }
    }
  }, []);

  // --- TICKER ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.status !== "running") return t;
          if (t.remainingSeconds <= 0) return { ...t, status: "finished", remainingSeconds: 0 };
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  const addTimer = useCallback((id: string, label: string, duration: string | number) => {
    setTimers((prev) => {
      if (prev.find((t) => t.id === id)) return prev;
      const seconds = parseDuration(duration);
      if (seconds <= 0) return prev; 

      return [
        ...prev,
        {
          id,
          label,
          remainingSeconds: seconds,
          originalDuration: seconds,
          status: "running",
        },
      ];
    });
  }, []);

  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "running" ? "paused" : "running" }
          : t
      )
    );
  }, []);

  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- ALGORITHM: Adaptive Velocity Tracking (With Outlier Rejection) ---
  const recordStepTime = useCallback((expected: string | number, actual: number, isFixedTime?: boolean) => {
    
    // 1. SAFETY: Ignore Physics Tasks (Boiling/Baking)
    if (isFixedTime) {
       console.log("Skipping adaptation: Physics-based task.");
       return;
    }

    const expectedSeconds = parseDuration(expected);
    
    // 2. VALIDATION: Ignore bad data
    if (expectedSeconds <= 0 || actual <= 0) return;

    // Calculate Ratio (e.g. Took 100s for 50s task = 2.0x)
    const currentRatio = actual / expectedSeconds;

    // 3. OUTLIER REJECTION (The Fix)
    // - Too Fast: If < 15% of expected time (Skipping steps)
    // - Too Slow: If > 400% of expected time (Walked away / AFK)
    if (currentRatio < 0.15) {
        console.log(`Ignored Speed Update: Too fast (${currentRatio.toFixed(2)}x). Assumed skipping.`);
        return;
    }
    if (currentRatio > 4.0) {
        console.log(`Ignored Speed Update: Too slow (${currentRatio.toFixed(2)}x). Assumed AFK.`);
        return;
    }

    // 4. WEIGHTED UPDATE (Smooth change)
    // Clamp limits to keep multiplier sane (0.5x to 3.0x)
    const clampedRatio = Math.min(Math.max(currentRatio, 0.5), 3.0);

    setPacingMultiplier((prev) => {
        // Weight: 80% History, 20% New Data (More conservative learning)
        const newMultiplier = parseFloat(((prev * 0.8) + (clampedRatio * 0.2)).toFixed(2));
        
        if (typeof window !== "undefined") {
            localStorage.setItem("userVelocityProfile", newMultiplier.toString());
        }
        
        console.log(`Updated Velocity: ${prev} -> ${newMultiplier} (Based on ${currentRatio.toFixed(2)}x performance)`);
        return newMultiplier;
    });
  }, []);

  return (
    <TimerContext.Provider value={{ timers, pacingMultiplier, addTimer, toggleTimer, removeTimer, recordStepTime }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimers must be used within a TimerProvider");
  return context;
}