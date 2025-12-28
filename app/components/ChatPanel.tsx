"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
}

export function ChatPanel({ isOpen, onClose, currentStep }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "I'm here. What's wrong?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      // Call the Real OpenAI Endpoint
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: currentStep,
        }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.text }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "I couldn't reach the chef. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-stone-200 flex justify-between items-center">
          <h2 className="font-bold text-stone-800">Kitchen Assistant</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600">
            Close
          </button>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-lg leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-100"
                    : "bg-white text-stone-800 border border-stone-100 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-stone-100">
                <span className="animate-pulse text-stone-400">...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 p-4 bg-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-4 bg-stone-800 text-white rounded-xl hover:bg-stone-900 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}