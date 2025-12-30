"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface Timer {
  id: string; // Changed to string for better compatibility (e.g. "s1", "uuid")
  label: string;
  remainingSeconds: number;
  originalDuration: number; // Useful for progress bars
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
// Handles both API numbers (seconds) and text ("5 mins")
const parseDuration = (val: string | number): number => {
  if (typeof val === "number") return val;
  
  if (typeof val === "string") {
    const s = val.toLowerCase();
    const num = parseInt(s);
    if (isNaN(num)) return 0;
    
    if (s.includes("min")) return num * 60;
    if (s.includes("hour") || s.includes("hr")) return num * 3600;
    return num; // Default to seconds if just a string number
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

  // --- TICKER: Runs every second ---
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
    // Prevent duplicates
    setTimers((prev) => {
      if (prev.find((t) => t.id === id)) return prev;
      
      const seconds = parseDuration(duration);
      if (seconds <= 0) return prev; // Don't add invalid timers

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

  // --- ALGORITHM: Adaptive Velocity Tracking ---
  const recordStepTime = useCallback((expected: string | number, actual: number, isFixedTime?: boolean) => {
    // 1. SAFETY GUARD: If this is a physics task (Boiling), DO NOT learn from it.
    if (isFixedTime) {
       console.log("Skipping adaptation: Physics-based task.");
       return;
    }

    const expectedSeconds = parseDuration(expected);
    
    // Ignore invalid data or accidental clicks (< 5s)
    if (expectedSeconds <= 0 || actual < 5) return;

    const currentRatio = actual / expectedSeconds;
    
    // Clamp to avoid wild swings (e.g. user walked away)
    const clampedRatio = Math.min(Math.max(currentRatio, 0.5), 3.0);

    // Weighted Moving Average: 70% History, 30% New Data
    setPacingMultiplier((prev) => {
        const newMultiplier = parseFloat(((prev * 0.7) + (clampedRatio * 0.3)).toFixed(2));
        // Save to storage immediately
        if (typeof window !== "undefined") {
            localStorage.setItem("userVelocityProfile", newMultiplier.toString());
        }
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