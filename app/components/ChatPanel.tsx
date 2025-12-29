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
  autoStartListening?: boolean; // NEW PROP
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- AUTO START LISTENING (The Fix) ---
  useEffect(() => {
    if (isOpen && autoStartListening) {
      // Small timeout to allow the previous mic to fully release
      setTimeout(() => {
        startListening();
      }, 300);
    }
    // Cleanup when panel closes
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

    // Prevent double start
    if (recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false; // Chat should stop after one sentence

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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulated response for demo (replace with your real API)
      setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: `(Simulated AI): I can help you with "${userMessage}" regarding step: ${currentStep.substring(0, 15)}...` }]);
          setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform z-[100] flex flex-col font-sans border-l border-stone-200">
      <div className="p-4 bg-emerald-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h2 className="font-bold text-lg">Susie (AI Chef)</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-stone-800 text-white rounded-tr-none" : "bg-white text-stone-800 border border-stone-200 rounded-tl-none"}`}>
              {msg.role === "assistant" && <div className="flex items-center gap-1 mb-1 opacity-50 text-xs font-bold uppercase"><Sparkles className="w-3 h-3" /> Susie</div>}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-stone-400 text-xs ml-4">Susie is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-stone-200">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isRecording ? "Listening..." : "Ask Susie..."}
            className={`flex-1 p-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isRecording ? "border-red-400 bg-red-50 placeholder-red-400" : "border-stone-300 focus:border-emerald-500"}`}
          />
          <button onClick={toggleVoiceInput} className={`absolute right-14 p-2 rounded-full ${isRecording ? "text-red-600 animate-pulse" : "text-stone-400"}`}>
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}