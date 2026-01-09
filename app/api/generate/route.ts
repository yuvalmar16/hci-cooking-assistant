import { NextResponse } from "next/server";
import { openai, checkBudget } from "../../lib/openai"; // Removed SYSTEM_PROMPT import to define a better one here

const USE_MOCK_DATA = false; 

// *** NEW ROBUST SYSTEM PROMPT ***
const ROBUST_SYSTEM_PROMPT = `
You are SuChef, an expert AI cognitive cooking assistant. Your goal is to simplify cooking into calm, atomic, and safe steps.

### CRITICAL SAFETY & VALIDATION RULES:
1. **Safety First:** If the input contains harmful, unethical, or illegal ingredients (e.g., "human meat", "rotten meat", "poison"), or if the input is unsafe to cook:
   - RETURN A JSON with title: "Unsafe Input Detected" and description: "I cannot generate a recipe for this input due to safety guidelines."
   - Do NOT generate steps.

2. **Gibberish/Invalid Input:** If the input is random numbers, gibberish, or too vague (e.g., "1234", "asdf", "simple recipe" with no context):
   - RETURN A JSON with title: "Input Unclear" and description: "Please provide specific ingredients or a valid recipe text."

3. **Hallucination Check:** - Use ONLY the provided ingredients plus basic pantry staples (oil, salt, pepper, water). 
   - If an ingredient is exotic/unavailable (e.g., "elephant meat"), treat it as a generic protein or reject it. Do NOT invent a complex recipe with ingredients the user didn't list.

4. **Complexity Management (Mole Poblano Rule):**
   - If the input is a massive, complex text (like traditional Mole), DO NOT try to preserve every detail.
   - **AGGRESSIVELY SIMPLIFY:** Compress the recipe into 10-15 key "Atomic Steps".
   - Merge minor sub-tasks (e.g., "toast chili", "soak chili", "drain chili" -> "Prepare chilies: Toast, soak, and drain").

### OUTPUT FORMAT:
You must return valid JSON only.
`;

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

    // Optimized prompts to handle specific modes better
    const userPrompt = mode === "ingredients"
      ? `Task: Create a recipe using these ingredients: "${data}". 
         Constraint: Use mostly these ingredients. If the ingredient list is absurd (e.g. "elephant"), return an error JSON.`
      : `Task: Simplify this recipe text: "${data}". 
         Constraint: If the text is very long, summarize it into key phases. Keep the tone calm.`;

    const schemaStructure = `
    {
      "title": "String (or 'Error' if invalid)",
      "description": "String (Short summary or error explanation)",
      "totalTime": "String (e.g. 15 mins)",
      "ingredients": [{ "name": "String", "amount": "String" }],
      "steps": [
        { 
          "id": Number, 
          "instruction": "String (Active verb start)", 
          "duration": Number, // REQUIRED: Time in SECONDS (e.g. 300). Use 0 if negligible.
          "isFixedTime": Boolean // true = passive waiting (boil/bake), false = active work (chop/mix)
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ROBUST_SYSTEM_PROMPT },
        { role: "user", content: userPrompt + "\n\nRETURN JSON matching this Schema:\n" + schemaStructure }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature to reduce hallucinations
      max_tokens: 1000,
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("No response from AI");

    const recipe = JSON.parse(resultText);

    // Fallback: If AI returns an "Error" title, we can handle it gracefully on frontend
    // or throw a 400 here. For now, we return it so the UI can show the description.
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
      { error: "The chef is busy (or input was too complex). Please try again with shorter text." }, 
      { status: 500 }
    );
  }
}