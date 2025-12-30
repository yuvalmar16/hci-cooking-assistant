export interface Ingredient {
  name: string;
  amount?: string;
  available?: boolean;
}

// FIX: Changed id to 'any' to stop the conflict with the other hidden definition
export interface Step {
  id: any;                 
  instruction: string;
  duration?: string;       
  timerSeconds?: number;   
  isFixedTime?: boolean;   
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  totalTime: string;
  imageUrl?: string;       
}