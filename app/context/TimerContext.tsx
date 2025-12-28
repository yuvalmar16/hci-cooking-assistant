"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Timer {
  id: number;
  label: string;
  durationSeconds: number;
  remainingSeconds: number;
  status: "idle" | "running" | "paused" | "finished";
}

interface TimerContextType {
  timers: Timer[];
  pacingMultiplier: number;
  addTimer: (id: number, label: string, durationStr: string) => void;
  toggleTimer: (id: number) => void;
  removeTimer: (id: number) => void;
  recordStepTime: (expectedDurationStr: string, actualSeconds: number, isFixedTime?: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [pacingMultiplier, setPacingMultiplier] = useState(1.0); 

  const parseDuration = (str: string): number => {
    if (!str) return 0;
    const num = parseInt(str);
    if (isNaN(num)) return 0;
    if (str.includes("min")) return num * 60;
    if (str.includes("hour") || str.includes("hr")) return num * 3600;
    return 300; 
  };

  // --- ALGORITHM: Adaptive Velocity Tracking ---
  const recordStepTime = (expectedDurationStr: string, actualSeconds: number, isFixedTime?: boolean) => {
    // 1. SAFETY GUARD: If this is a physics task (Boiling), DO NOT learn from it.
    if (isFixedTime) {
       console.log("Skipping adaptation: Physics-based task detected.");
       return;
    }

    const expectedSeconds = parseDuration(expectedDurationStr);
    
    // Ignore invalid data or accidental clicks (< 5s)
    if (expectedSeconds === 0 || actualSeconds < 5) return;

    const currentRatio = actualSeconds / expectedSeconds;
    
    // Clamp to avoid wild swings (e.g. user walked away)
    const clampedRatio = Math.min(Math.max(currentRatio, 0.5), 3.0);

    // Weighted Moving Average: 70% History, 30% New Data
    setPacingMultiplier((prev) => parseFloat(((prev * 0.7) + (clampedRatio * 0.3)).toFixed(2)));
  };
  // ---------------------------------------------

  const addTimer = (id: number, label: string, durationStr: string) => {
    if (timers.find((t) => t.id === id)) return;
    
    const seconds = parseDuration(durationStr);
    
    setTimers((prev) => [
      ...prev,
      {
        id,
        label,
        durationSeconds: seconds,
        remainingSeconds: seconds,
        status: "running", 
      },
    ]);
  };

  const toggleTimer = (id: number) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "running" ? "paused" : "running" }
          : t
      )
    );
  };
  
  const removeTimer = (id: number) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.status !== "running") return t;
          if (t.remainingSeconds <= 0) return { ...t, status: "finished" };
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
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