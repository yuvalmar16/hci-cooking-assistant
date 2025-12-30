import { NextResponse } from "next/server";
import { openai, SYSTEM_PROMPT, checkBudget } from "../../lib/openai";

const USE_MOCK_DATA = false; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, data } = body;

    // --- MOCK DATA (Optional) ---
    if (USE_MOCK_DATA) {
      return NextResponse.json({ 
        title: "Mock Pasta",
        steps: [
            { id: 1, instruction: "Boil water", duration: 600, isFixedTime: true },
            { id: 2, instruction: "Chop onions", duration: 300, isFixedTime: false }
        ]
      });
    }
    // ----------------------------

    if (!data) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    checkBudget(data);

    const userPrompt = mode === "ingredients"
      ? `I have these ingredients: ${data}. Create a simple, comfort-food recipe using mostly these. Return ONLY valid JSON matching the Recipe schema.`
      : `Simplify this recipe text into calm, clear steps: "${data}". Return ONLY valid JSON matching the Recipe schema.`;

    // *** THE FIX IS HERE: Changed duration to Number (seconds) ***
    const schemaStructure = `
    {
      "title": "String",
      "description": "String (calm summary)",
      "totalTime": "String (e.g. 15 mins)",
      "ingredients": [{ "name": "String", "amount": "String" }],
      "steps": [
        { 
          "id": Number, 
          "instruction": "String", 
          "duration": Number, // MUST BE IN SECONDS (e.g., 300 for 5 mins). DO NOT USE STRINGS.
          "isFixedTime": Boolean (true if passive like boiling/baking, false if active labor like chopping)
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\nIMPORTANT: 'duration' must be a NUMBER in seconds." },
        { role: "user", content: userPrompt + "\nSchema:" + schemaStructure }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, 
      max_tokens: 1000,
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("No response from AI");

    const recipe = JSON.parse(resultText);
    return NextResponse.json(recipe);

  } catch (error: any) {
    console.error("OpenAI Error:", error);
    if (error?.status === 429) {
         return NextResponse.json(
            { error: "Billing Quota Exceeded. Please check OpenAI settings." }, 
            { status: 429 }
         );
    }
    return NextResponse.json(
      { error: "The chef is busy. Please try again." }, 
      { status: 500 }
    );
  }
}