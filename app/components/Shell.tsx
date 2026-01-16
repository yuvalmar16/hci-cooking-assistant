import React from "react";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className = "" }: ShellProps) {
  return (
    <main className={`min-h-screen w-full bg-stone-50 flex flex-col items-center ${className}`}>
      {/* RESPONSIVE CONTAINER:
         - w-full: Full width by default
         - max-w-7xl: Limits width on large screens so it doesn't stretch too far
         - px-4: Small side padding on mobile
         - md:px-8: Larger padding on tablets/desktop
         - py-6: Top/bottom padding
      */}
      <div className="w-full max-w-7xl px-4 md:px-8 py-6 md:py-12 flex-1 flex flex-col">
        {children}
      </div>
    </main>
  );
}