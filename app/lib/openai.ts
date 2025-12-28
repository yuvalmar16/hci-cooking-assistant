import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// The Persona: Calm, reassuring, concise.
export const SYSTEM_PROMPT = `
You are the "HCI Cooking Assistant", a calm, anxiety-aware kitchen partner.
Your goal is to reduce cognitive load.

GUIDELINES:
1. Simplify complex instructions into single, clear actions.
2. Use a reassuring, low-pressure tone.
3. Never lecture; just guide.
4. If a user makes a mistake, offer a simple fix without judgment.
5. Format output strictly as JSON when asked.
`;

// Budget Guard: Estimate cost before sending
// Pricing (Approx for gpt-4o-mini): $0.15 / 1M input tokens
export function checkBudget(text: string): boolean {
  // Rough estimation: 1 token ~= 4 chars
  const estimatedTokens = text.length / 4;
  
  if (estimatedTokens > 3000) {
    throw new Error("Request too large. Please shorten your input.");
  }
  
  return true; // Safe to proceed
}