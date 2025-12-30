import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Sparkles, Mic, Square } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  autoStartListening?: boolean;
}

export function ChatPanel({ isOpen, onClose, currentStep, autoStartListening }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Susie. What do you need help with?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Auto-Start from Voice Command
  useEffect(() => {
    if (isOpen && autoStartListening) {
      setTimeout(() => {
        startListening();
      }, 300);
    }
    return () => {
        stopListening();
    };
  }, [isOpen, autoStartListening]);

  const toggleVoiceInput = () => {
    if (isRecording) stopListening();
    else startListening();
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false; 

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
    }
  };

  // --- THE REAL CONNECTION ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput(""); // Clear input immediately
    
    // Add user message to UI
    const newHistory = [...messages, { role: "user", content: userMessage } as Message];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Call the Real API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory, // Send conversation history
          context: currentStep, // Send the current cooking step (e.g., "Chop onions")
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the cloud right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl transform transition-transform z-[100] flex flex-col font-sans border-l border-stone-200">
      
      {/* Header */}
      <div className="p-4 bg-emerald-600 text-white flex justify-between items-center shadow-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h2 className="font-bold text-lg">Susie (AI Chef)</h2>
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
              className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
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
      <div className="p-4 bg-white border-t border-stone-200 flex-shrink-0">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isRecording ? "Listening..." : "Ask Susie..."}
            className={`flex-1 p-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isRecording ? "border-red-400 bg-red-50 placeholder-red-400" : "border-stone-300 focus:border-emerald-500"}`}
          />
          
          <button onClick={toggleVoiceInput} className={`absolute right-14 p-2 rounded-full ${isRecording ? "text-red-600 animate-pulse" : "text-stone-400 hover:text-stone-600"}`}>
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}