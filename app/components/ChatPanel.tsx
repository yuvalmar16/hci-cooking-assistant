/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  recipeTitle: string;
  autoStartListening?: boolean; // <--- ADDED THIS TO FIX BUILD ERROR
}

export function ChatPanel({ isOpen, onClose, currentStep, recipeTitle, autoStartListening }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hi! I'm Susie. We're cooking "${recipeTitle}". How can I help with this step?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset/Update chat if the recipe changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
        setMessages([
            { role: "assistant", content: `Hi! I'm Susie. We're cooking "${recipeTitle}". How can I help with this step?` }
        ]);
    }
  }, [recipeTitle]);

  // --- SEND MESSAGE ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput(""); // Clear input immediately

    // Add user message to history
    const newHistory = [...messages, { role: "user", content: userMessage } as Message];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // --- BUILD CONTEXT ---
      const richContext = `
        Current Recipe Name: "${recipeTitle}"
        Current Step Instruction: "${currentStep}"
        User Goal: The user is currently cooking this step. Provide helpful, short, specific culinary advice.
      `;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          context: richContext, 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-112.5 bg-white shadow-2xl transform transition-transform z-100 flex flex-col font-sans border-l border-stone-200">
      
      {/* Header */}
      <div className="p-4 bg-emerald-600 text-white flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">Susie (AI Chef)</h2>
            <p className="text-[10px] uppercase tracking-widest font-medium opacity-80 mt-1 truncate max-w-[200px]">
              {recipeTitle}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div 
              className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm wrap-break-word whitespace-pre-wrap ${
                msg.role === "user" 
                  ? "bg-stone-800 text-white rounded-tr-none" 
                  : "bg-white text-stone-800 border border-stone-200 rounded-tl-none"
              }`}
            >
              {msg.role === "assistant" && idx === 0 && (
                <div className="flex items-center gap-1 mb-1 opacity-50 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Susie
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-stone-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-200 shrink-0">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Susie a question..."
            className="flex-1 p-3 pr-4 rounded-xl border border-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            autoFocus
          />
          
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading} 
            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}