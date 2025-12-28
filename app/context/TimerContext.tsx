"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Timer {
  id: number; // Links to the step ID
  label: string;
  durationSeconds: number;
  remainingSeconds: number;
  status: "idle" | "running" | "paused" | "finished";
}

interface TimerContextType {
  timers: Timer[];
  addTimer: (id: number, label: string, durationStr: string) => void;
  toggleTimer: (id: number) => void;
  removeTimer: (id: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);

  // Parse "5 mins" or "1 hour" into seconds
  const parseDuration = (str: string): number => {
    const num = parseInt(str);
    if (str.includes("min")) return num * 60;
    if (str.includes("hour") || str.includes("hr")) return num * 3600;
    return 300; // Default 5 mins
  };

  const addTimer = (id: number, label: string, durationStr: string) => {
    if (timers.find((t) => t.id === id)) return; // No duplicates
    const seconds = parseDuration(durationStr);
    
    setTimers((prev) => [
      ...prev,
      {
        id,
        label,
        durationSeconds: seconds,
        remainingSeconds: seconds,
        status: "running", // Auto-start for simplicity
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

  // The Heartbeat: Ticks every second
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
    <TimerContext.Provider value={{ timers, addTimer, toggleTimer, removeTimer }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimers must be used within a TimerProvider");
  return context;
}