/**
 * @typedef {import('../types').Ingredient} Ingredient
 * @typedef {import('../types').Recipe} Recipe
 */

const isValidString = str => typeof(str) === 'string' && str.trim()

/**
 * @param {Ingredient} ingredient
 */
const isValidIngredient = ingredient =>
      ingredient
      && isValidString(ingredient.name)
      && Number.isFinite(ingredient.quantity)
      && ingredient.quantity > 0
      && isValidString(ingredient.unit)


const ok = { ok: true }
const error = message => ({ ok: false, message })

/**
 * @param {Recipe} recipe
 * @returns {{ok: true} | {ok: false, message: string}}
 */
function validateRecipe(recipe) {
  if (!recipe) return error('Recipe required')

  if (!isValidString(recipe.name)) return error('Recipe must have valid name')

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    return error('Recipe must have at least one ingredient')
  }

  if (!recipe.ingredients.every(isValidIngredient)) {
    return error('All ingredients must have a name, a unit and a valid quantity')
  }

  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
    return error('Recipe must have at least one step')
  }

  if (!recipe.steps.every(isValidString)) return error('All step must be a non-empty text')

  return ok
}

module.exports = { validateRecipe }