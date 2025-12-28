import React from "react";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className = "" }: ShellProps) {
  return (
    <main
      className={`flex min-h-screen flex-col px-6 py-12 md:px-12 max-w-3xl mx-auto ${className}`}
    >
      {children}
    </main>
  );
}