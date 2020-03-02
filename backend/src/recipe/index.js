const { promisify } = require('util')
const { validateRecipe } = require('./recipe-validation')

/**
 * @typedef {import('../types').Ingredient} Ingredient
 * @typedef {import('../types').Recipe} Recipe
 * @typedef {import('../types').StoredRecipe} StoredRecipe
 * @typedef {import('../types').ErrorCodes} ErrorCodes
 * @typedef {import('nedb')} Datastore
 */

/** @type {ErrorCodes} */
const ErrorCodes = {
  invalidArgument: 'invalid-argument',
  notFound: 'not-found'
}

function error(code, message) {
  const err = new Error(message)
  err.code = code
  return err
}

/**
 * Recipe services
 * @param {Datastore} datastore - Datastore to use for recipe persistence
 */
function withDatastore(datastore) {

  const insert = promisify((doc, callback) => datastore.insert(doc, callback))

  /**
   * Creates a new recipe. Do not overwrite previowsly created recipes
   * (i.e. if it has an id property, it's ignored).
   * @param {Recipe} recipe
   * @returns {StoredRecipe}
   */
  async function create(recipe) {
    const validationResult = validateRecipe(recipe)

    if (!validationResult.ok) {
      throw error(ErrorCodes.invalidArgument, validationResult.message)
    }

    const { name, ingredients, steps} = recipe
    const { _id } = await insert({
      name,
      ingredients,
      steps,
      ratings: []
    })

    return { id: _id, name, ingredients, steps}
  }

  return { create }
}

module.exports = { withDatastore, ErrorCodes }