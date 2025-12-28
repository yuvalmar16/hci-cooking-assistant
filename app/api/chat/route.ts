import { NextResponse } from "next/server";
import { openai, SYSTEM_PROMPT, checkBudget } from "../../lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, context } = body; // context = current step instruction

    checkBudget(message);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + " Keep answers under 2 sentences. Be helpful and calm." },
        { role: "user", content: `I am on this step: "${context}". User asks: "${message}"` }
      ],
      max_tokens: 150, // Strict limit for chat
    });

    return NextResponse.json({ 
      text: completion.choices[0].message.content 
    });

  } catch (error) {
    return NextResponse.json({ text: "I'm having trouble connecting. Try again." }, { status: 500 });
  }
}