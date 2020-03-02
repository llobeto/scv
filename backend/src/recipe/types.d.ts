import { Recipe } from '../types';
/**
 * Some type for better code assistance
 */

export type Stars = 1 | 2 | 3 | 4 | 5

export type Rating = {
  stars: Stars;
  time: number;
}

export type DBRecipe = Recipe & {
  _id: String;
  ratings: Rating[];
}