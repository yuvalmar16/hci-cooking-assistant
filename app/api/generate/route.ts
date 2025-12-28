import { NextResponse } from "next/server";
import { openai, SYSTEM_PROMPT, checkBudget } from "../../lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, data } = body;

    // 1. Security & Budget Check
    if (!data) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    checkBudget(data);

    // 2. Construct the Prompt
    const userPrompt = mode === "ingredients"
      ? `I have these ingredients: ${data}. Create a simple, comfort-food recipe using mostly these. Return ONLY valid JSON matching the Recipe schema.`
      : `Simplify this recipe text into calm, clear steps: "${data}". Return ONLY valid JSON matching the Recipe schema.`;

    const schemaStructure = `
    {
      "title": "String",
      "description": "String (calm summary)",
      "totalTime": "String (e.g. 15 mins)",
      "ingredients": [{ "name": "String", "amount": "String" }],
      "steps": [{ "id": Number, "instruction": "String", "duration": "String (optional, e.g. '5 mins')" }]
    }
    `;

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective & fast
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\nReturn JSON only." },
        { role: "user", content: userPrompt + "\nSchema:" + schemaStructure }
      ],
      response_format: { type: "json_object" }, // Enforce JSON
      temperature: 0.3, // Low creativity, high stability
      max_tokens: 1000,
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("No response from AI");

    const recipe = JSON.parse(resultText);
    return NextResponse.json(recipe);

  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "The chef is busy. Please try again." }, 
      { status: 500 }
    );
  }
}