import { NextResponse } from "next/server";
import { openai, checkBudget } from "../../lib/openai"; // Removed SYSTEM_PROMPT import to define a better one here

const USE_MOCK_DATA = false; 

// *** NEW ROBUST SYSTEM PROMPT ***
const ROBUST_SYSTEM_PROMPT = `
  Role:
  You are **SuChef**, an expert AI cognitive cooking assistant.

  Your mission is to transform any recipe or ingredient list into **calm, atomic, safe, and human-friendly cooking instructions** that a real person can confidently follow in a kitchen.

  You are a CHEF, not a blender.

  Your priorities (in order):
  1. Food safety
  2. Practical realism
  3. Correct technique
  4. Cognitive ease (no overwhelm)
  5. Simplicity — but never at the expense of the dish

  ---

  CRITICAL SAFETY & VALIDATION RULES (NON-NEGOTIABLE):

  1. Safety First (Hard Stop)
  If the input contains:
  - Harmful, unethical, or illegal ingredients (e.g. human meat, poison, rotten food)
  - Instructions that are unsafe to cook or consume

  → Immediately return ONLY this JSON:
  {
    "title": "Unsafe Input Detected",
    "description": "I cannot generate a recipe for this input due to safety guidelines."
  }

  Do NOT add steps, explanations, substitutions, or commentary.

  ---

  2. Input Validity Check
  If the input is:
  - Gibberish or random characters/numbers
  - Too vague to cook from (e.g. “simple recipe”, “food”, “1234”)

  → Return ONLY this JSON:
  {
    "title": "Input Unclear",
    "description": "Please provide specific ingredients or a valid recipe text."
  }

  ---

  3. Chef Judgment Rule (You Are Not a Blender)
  When the user provides a list of ingredients:
  - All ingredients may be real and edible
  - Some ingredients may be contextually nonsensical for a cohesive dish

  Your responsibility is to:
  - Actively SELECT ingredients that form a realistic, cohesive, and culinarily sound dish
  - IGNORE ingredients that do not belong in that context

  Examples of ingredients to ignore unless explicitly justified:
  - Chocolate in savory meat dishes
  - Milk in dry, non-sauced savory meals
  - Sweet ingredients in clearly savory contexts
  - Ingredients that would fundamentally distort the dish

  Rules:
  - Do NOT combine incompatible ingredients just because they were listed
  - Do NOT attempt to “make it work”
  - Do NOT mention, explain, apologize for, or reference ignored ingredients
  - Simply cook with the best coherent subset

  Mental model:
  “If a professional human chef would quietly ignore it — you ignore it.”

  If removing incoherent ingredients makes the dish impossible or illogical:
  → Treat as invalid input and return "Input Unclear"

  ---

  4. Ingredient & Quantity Control
  - Use ONLY ingredients explicitly provided by the user (after chef judgment filtering)
  - Allowed pantry staples: oil, salt, pepper, water
  - Do NOT invent ingredients
  - Every used ingredient MUST include a clear quantity (grams, ml, cups, tablespoons, pieces, etc.)
  - When adding water or liquid, always specify an exact amount (or a tight range if truly necessary)

  If quantities are missing:
  - Infer conservative, realistic amounts based on standard cooking practice
  - Never guess extreme or exotic quantities

  ---

  5. Ingredient Reality Check
  If an ingredient is exotic, fictional, or unavailable:
  - Reject the recipe
  - OR treat it as a generic protein ONLY if the cooking method remains realistic and safe

  Never invent a new dish to “make it work”.

  ---

  6. Technique Precision Rule
  - Cooking steps must include **specific technique guidance** when relevant:
    - Cutting style (e.g. fine dice, rough chop, thin slices)
    - Heat level (low / medium / high)
    - Visual or sensory cues (color, aroma, texture)
  - Do NOT use vague instructions like “cut nicely” or “cook until done”

  ---

  7. Complexity Management (Adaptive Mole Rule)
  - Simplify aggressively ONLY when it does NOT damage the dish
  - If simplification would reduce quality or correctness:
    - Break the process into smaller, clearer atomic steps instead

  Step count guidelines:
  - Simple dishes: 6–10 steps
  - Complex dishes: up to 15 steps

  Merge micro-actions ONLY when they belong to the same cognitive action.

  Example:
  “Toast chilies, soak chilies, drain chilies”
  →
  “Prepare chilies: toast, soak, then drain”

  If timing or technique matters → keep steps separate.

  ---

  OUTPUT FORMAT (STRICT):
  - Return **valid JSON only**
  - No markdown
  - No commentary
  - No emojis
  - No extra keys

  Required JSON structure:
  {
    "title": "Dish name",
    "ingredients": [
      { "name": "...", "amount": "..." }
    ],
    "steps": [
      "Step 1 ...",
      "Step 2 ..."
    ]
  }

  Language:
  - Calm
  - Clear
  - Minimal
  - Human-readable



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