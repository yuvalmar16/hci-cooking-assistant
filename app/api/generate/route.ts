import { NextResponse } from "next/server";
import { openai, checkBudget } from "../../lib/openai";

const USE_MOCK_DATA = false;

// *** UPDATED ROBUST SYSTEM PROMPT ***
const ROBUST_SYSTEM_PROMPT = `
  You are **SuChef**, an expert AI cognitive cooking assistant.

  Your mission is to transform any recipe or ingredient list into calm, atomic, safe, and human-friendly cooking instructions.

  You are a CHEF, not a blender.

  ---

  ### CRITICAL SAFETY & VALIDATION RULES (ORDER OF OPERATIONS):

  1. **Safety: Pure Toxicity (Strictly Prohibited)**
     - If input contains ONLY harmful/illegal items (e.g. "Poison, Human Meat, Bleach").
     - RETURN ERROR JSON: 
     { "title": "Strictly Prohibited", "description": "I cannot find any edible ingredients in this list. I am a chef, not a hazmat team." }

  2. **Safety: Mixed Ingredients (Salvageable)**
     - If input mixes valid food with prohibited items (e.g. "Chicken, Horse Meat").
     - RETURN ERROR JSON: 
     { "title": "Unsafe Ingredient Detected", "description": "I see some great ingredients, but please remove the [Names of Unsafe Ingredients] before we cook." }

  3. **Input Validity (Gibberish)**
     - If input is nonsense.
     - RETURN ERROR JSON: 
     { "title": "Input Unclear", "description": "Please provide specific ingredients or a valid recipe text." }

  4. **Not Enough to Cook**
     - If input is just condiments or a single non-meal item.
     - RETURN ERROR JSON: 
     { "title": "Not Enough to Cook", "description": "I can't make a full meal out of just that. Please add a main ingredient!" }

  5. **VARIETY RULE (The Buffet) - CHECK THIS BEFORE GENERATING A RECIPE**
     - If the user provides a **LARGE** list of ingredients that could make **3 DISTINCTLY DIFFERENT** main dishes (e.g. Beef AND Chicken AND Pork).
     - **DO NOT** generate a single recipe combining them.
     - RETURN THIS SPECIFIC JSON STRUCTURE INSTEAD:
     {
       "type": "suggestions",
       "options": [
         { "title": "Option 1 Title", "description": "Short description of dish 1", "keyIngredient": "Beef" },
         { "title": "Option 2 Title", "description": "Short description of dish 2", "keyIngredient": "Chicken" },
         { "title": "Option 3 Title", "description": "Short description of dish 3", "keyIngredient": "Pork" }
       ]
     }

  6. **Chef Judgment Rule (Culinary Cohesion)**
     - When generating a specific recipe, **select the best subset** for a single, cohesive dish.
     - **AGGRESSIVELY IGNORE** ingredients that clash.

  7. **Single-Ingredient Dish Rule**
     - If valid single item (e.g. "Steak"), make a standard dish.

  ---

  ### STANDARD OUTPUT FORMAT (When creating a full recipe):
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
    // --- ACCEPT HISTORY & OPTION FROM FRONTEND ---
    const { mode, data, history, selectedOption } = body;

    // --- MOCK DATA CHECK ---
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

    // --- FORMAT HISTORY CONTEXT ---
    let historyContext = "";
    if (history && history.length > 0) {
      historyContext = `
      \n\n=== USER TASTE MEMORY (ADAPT TO THIS) ===
      The user has provided feedback on previous meals. ADJUST the recipe to respect these preferences:
      ${history}
      =========================================\n
      `;
    }

    // --- CONSTRUCT USER PROMPT ---
    let userPrompt = "";

    // SCENARIO 1: User selected a specific suggestion from the buffet
    if (selectedOption) {
        userPrompt = `
        Task: The user has a list of ingredients: "${data}".
        
        COMMAND: The user specifically chose to cook: "${selectedOption}".
        
        Goal: Generate the full recipe for "${selectedOption}" using the provided ingredients.
        - IGNORE ingredients that don't fit "${selectedOption}".
        - Follow strict safety rules.
        ${historyContext}
        `;
    } 
    // SCENARIO 2: Ingredient Mode (Check for Variety vs Single Recipe)
    else if (mode === "ingredients") {
        userPrompt = `
        Task: Analyze these ingredients: "${data}".
        ${historyContext}

        Goal: Determine the best output.
        - **CHECK FOR VARIETY FIRST:** If there are distinct main proteins/styles (e.g. Beef vs Chicken), return the "suggestions" JSON format with 3 options.
        - **OTHERWISE:** Create the single best dish using a COHERENT SUBSET of these ingredients.
        - **SAFETY:** Scan for toxicity first.
        `;
    } 
    // SCENARIO 3: Recipe Simplification Mode
    else {
        userPrompt = `
        Task: Simplify this recipe text: "${data}". 
        ${historyContext}
        Constraint: If the text is very long, summarize it into key phases. Keep the tone calm.
        `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ROBUST_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Slightly higher temp for creative suggestions
      max_tokens: 1000,
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("No response from AI");

    const result = JSON.parse(resultText);

    return NextResponse.json(result);

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