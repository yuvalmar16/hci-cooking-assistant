export interface Step {
  id: number;
  instruction: string;
  duration?: string; 
  isFixedTime?: boolean; // NEW: True = Physics (Boil), False = Labor (Chop)
}


export interface Ingredient {
  name: string;
  amount?: string;
  available?: boolean; // Used for the checklist
}

export interface Step {
  id: number;
  instruction: string;
  duration?: string; // e.g., "5 mins"
  timerSeconds?: number; // e.g., 300
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  totalTime: string;
}