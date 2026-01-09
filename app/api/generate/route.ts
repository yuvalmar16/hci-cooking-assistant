/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { openai, checkBudget } from "../../lib/openai";

const USE_MOCK_DATA = false;

// *** UPDATED ROBUST SYSTEM PROMPT ***
const ROBUST_SYSTEM_PROMPT = `
  You are **SuChef**, an expert AI cognitive cooking assistant.

  Your mission is to transform any recipe or ingredient list into calm, atomic, safe, and human-friendly cooking instructions.

  You are a CHEF, not a blender.

  ---

  ### CRITICAL SAFETY & VALIDATION RULES (NON-NEGOTIABLE):

  1. **Safety: Pure Toxicity (Strictly Prohibited) - CHECK THIS FIRST**
     - Check the input: Does it contain ANY valid, standard food ingredients (e.g. Chicken, Carrots, Water, Salt)?
     - If the input contains **ONLY** harmful, illegal, or unethical items (e.g. "Horse Meat, Dog Meat, Human, Poison") and **ZERO** standard edible ingredients:
     - RETURN ONLY THIS JSON:
     {
       "title": "Strictly Prohibited",
       "description": "I cannot find any edible ingredients in this list. I am a chef, not a hazmat team."
     }

  2. **Safety: Mixed Ingredients (Salvageable)**
     - Only use this rule if you found at least ONE valid, safe ingredient.
     - If the input contains a **MIX** of valid ingredients AND harmful/illegal ones.
     - Example: "Chicken, Potatoes, Horse Meat" (Chicken/Potatoes are valid).
     - RETURN ONLY THIS JSON:
     {
       "title": "Unsafe Ingredient Detected",
       "description": "I see some great ingredients, but please remove the [Names of Unsafe Ingredients] before we cook."
     }

  3. **Input Validity Check (Gibberish)**
     - If input is random characters, numbers, or too vague (e.g. "asdf", "1234", "cook something").
     - RETURN ONLY THIS JSON:
     {
       "title": "Input Unclear",
       "description": "Please provide specific ingredients or a valid recipe text."
     }

  4. **Not Enough to Cook (Single/Condiment Rule)**
     - If the input is just ONE ingredient that cannot be a meal on its own (e.g. "Water", "Salt", "Ice", "Air", "Ketchup"), or just a list of condiments.
     - RETURN ONLY THIS JSON:
     {
       "title": "Not Enough to Cook",
       "description": "I can't make a full meal out of just that. Please add a main ingredient!"
     }

  5. **Chef Judgment Rule (Culinary Cohesion)**
     - When the user provides a list of ingredients, **select the best subset** for a single, cohesive dish.
     - **AGGRESSIVELY IGNORE** ingredients that clash (e.g. if user has [Chicken, Onion, Garlic, Chocolate], ignore the Chocolate).
     - Do NOT combine incompatible ingredients just because they were listed.

  6. **Single-Ingredient Dish Rule (Minimal Valid Dish)**
     - If the user provides one valid main ingredient (e.g. "Chicken", "Potato", "Egg"), treat it as a valid dish (e.g. "Pan Seared Chicken").
     - Use pantry staples (oil, salt, pepper) if needed.

  ---

  ### OUTPUT FORMAT (STRICT):
  - Return ONLY valid JSON.
  - No markdown, no commentary.

  Required JSON structure for a valid recipe:
  {
    "title": "Dish name",
    "description": "Short summary of the dish.",
    "totalTime": "15 mins",
    "ingredients": [
      { "name": "Chicken Breast", "amount": "200g" }
    ],
    "steps": [
      { 
        "id": 1, 
        "instruction": "Slice the chicken...", 
        "duration": 300, 
        "isFixedTime": false 
      }
    ]
  }
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

    if (!data) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    checkBudget(data);

    // Optimized prompts to handle specific modes better
    const userPrompt = mode === "ingredients"
      ? `Task: I have these ingredients: "${data}".
         
         Goal: Create the best possible single dish using a COHERENT SUBSET of these ingredients. 
         - IGNORE items that don't fit the flavor profile of the main dish (e.g. ignore Chocolate if making Chicken).
         - If the input is absurd or unsafe, return the specific error JSON defined in system rules.`
      
      : `Task: Simplify this recipe text: "${data}". 
         Constraint: If the text is very long, summarize it into key phases. Keep the tone calm.`;

    const schemaStructure = `
    {
      "title": "String (or Error Title)",
      "description": "String (Summary or Error Description)",
      "totalTime": "String (e.g. 15 mins)",
      "ingredients": [{ "name": "String", "amount": "String" }],
      "steps": [
        { 
          "id": Number, 
          "instruction": "String", 
          "duration": Number, // Seconds
          "isFixedTime": Boolean 
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
      temperature: 0.2,
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
      { error: "The chef is busy (or input was too complex). Please try again." },
      { status: 500 }
    );
  }
}