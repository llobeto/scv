const { promisify } = require('util')
const { validateRecipe } = require('./recipe-validation')

/**
 * @typedef {import('../types').Ingredient} Ingredient
 * @typedef {import('../types').Recipe} Recipe
 * @typedef {import('../types').StoredRecipe} StoredRecipe
 * @typedef {import('./types').DBRecipe} DBRecipe
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
   * @returns {Promise<StoredRecipe>}
   */
  async function create(recipe) {
    const validationResult = validateRecipe(recipe)

    if (!validationResult.ok) {
      throw error(ErrorCodes.invalidArgument, validationResult.message)
    }

    const { name, ingredients, steps} = recipe
    const { _id: id } = await insert({
      name,
      ingredients,
      steps,
      ratings: []
    })

    return { id, name, ingredients, steps}
  }

  const findById = promisify((id, callback) => datastore.findOne({ _id: id }, callback))

  /**
   *
   * @param {string} id
   * @returns {Promise<StoredRecipe>}
   */
  async function retrieve(id) {
    if (typeof(id) !== 'string' || !id) {
      throw error(ErrorCodes.invalidArgument, 'A valid id must be provided')
    }

    /** @type {DBRecipe} */
    const document = await findById(id)

    if (!document) throw error(ErrorCodes.notFound, 'Cannot find recipe with id ' + id)

    const { _id, name, ingredients, steps, ratings } = document

    // Average of all stars
    const score = ratings.length > 0 ?
      ratings.map(rating => rating.stars).reduce((a, b) => a + b, 0) / ratings.length
      : undefined

    return {
      id: _id,
      name,
      ingredients,
      steps,
      score
    }
  }

  return { create,  retrieve }
}

module.exports = { withDatastore, ErrorCodes }