"use client";

import { useTimers } from "../context/TimerContext";
import { useEffect, useState } from "react";

export function TimerAlert() {
  const { timers, removeTimer } = useTimers();
  const [alertedIds, setAlertedIds] = useState<Set<number>>(new Set());
  
  const finishedTimers = timers.filter((t) => t.status === "finished");

  const playCalmChime = () => {
    if (typeof window === "undefined") return;

    // 1. Setup Audio Context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();

    // 2. Define the Chord (C Major: C5, E5, G5)
    // Frequencies: C5=523.25, E5=659.25, G5=783.99
    const notes = [523.25, 659.25, 783.99];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine"; // Keep it soft
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // 3. Staggered Entrance (Arpeggio effect)
      // Each note starts slightly after the previous one (0.1s apart)
      const startTime = ctx.currentTime + (index * 0.1);
      
      // Volume Envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1); // Fade in
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5); // Long fade out

      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  };

  useEffect(() => {
    const newFinishedTimers = finishedTimers.filter(t => !alertedIds.has(t.id));

    if (newFinishedTimers.length > 0) {
      playCalmChime();
      
      setAlertedIds(prev => {
        const next = new Set(prev);
        newFinishedTimers.forEach(t => next.add(t.id));
        return next;
      });
    }
  }, [finishedTimers, alertedIds]);

  if (finishedTimers.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col gap-2 p-4 animate-slide-down">
      {finishedTimers.map((timer) => (
        <div
          key={timer.id}
          className="mx-auto max-w-lg w-full bg-amber-100 border-l-8 border-amber-500 shadow-xl rounded-r-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="bg-amber-200 p-2 rounded-full text-amber-700 animate-bounce-slow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-amber-900 uppercase tracking-wide text-sm">
                Timer Complete
              </p>
              <p className="text-amber-800 text-lg">
                {timer.label} is ready.
              </p>
            </div>
          </div>

          <button
            onClick={() => removeTimer(timer.id)}
            className="px-4 py-2 bg-white text-amber-700 font-bold rounded-lg shadow hover:bg-amber-50 transition-colors"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}