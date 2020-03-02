/**
 * Some type for better code assistance
 */

export type Stars = 1 | 2 | 3 | 4 | 5

export type Rating = {
  stars: Stars;
  time: number;
}

export type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
}

export type Recipe = {
  name: String;
  steps: String[];
  ingredients: Ingredient[];
}

export type StoredRecipe = Recipe & {
  id: String;
  score?: number;
}

export type ErrorCodes = {
  notFound: string;
  invalidArgument: string;
}