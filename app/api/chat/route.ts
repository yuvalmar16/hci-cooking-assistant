import { NextResponse } from "next/server";
// FIX: Changed from "../../../" to "../../" to match your folder structure
import { openai, checkBudget } from "../../lib/openai"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, context } = body; 

    // 1. Safety Check: Verify the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
        checkBudget(lastMessage.content);
    }

    // 2. Define the Persona & Inject Context
    const DYNAMIC_SYSTEM_PROMPT = `
      You are "Susie", an expert, warm, and safety-conscious AI Sous-Chef.
      
      CURRENT CONTEXT: The user is currently working on this step: "${context}".
      
      GUIDELINES:
      1. Answer questions specifically related to the current step if possible.
      2. If the user asks a general cooking question, answer it normally.
      3. Keep answers concise (max 2-3 sentences) unless asked for details.
      4. Prioritize kitchen safety (knife skills, heat, cross-contamination).
      5. Tone: Encouraging, professional, and calm.
    `;

    // 3. Call OpenAI with History
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DYNAMIC_SYSTEM_PROMPT },
        ...messages 
      ],
      temperature: 0.7,
      max_tokens: 200, 
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    if (error?.message?.includes("Budget")) {
        return NextResponse.json({ error: "Budget limit reached." }, { status: 429 });
    }

    return NextResponse.json(
      { error: "Susie is having trouble connecting. Please try again." }, 
      { status: 500 }
    );
  }
}