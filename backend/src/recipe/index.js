const { promisify } = require('util')
const { validateRecipe } = require('./recipe-validation')

/**
 * @typedef {import('./types').Stars} Stars
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

  // Promisified version of datastore methods
  const insert = promisify((doc, callback) => datastore.insert(doc, callback))
  const findById = promisify((id, callback) => datastore.findOne({ _id: id }, callback))
  const findAll = promisify(callback => datastore.find({}, callback))
  const updateById = promisify((id, data, callback) => datastore.update({ _id: id }, data, {}, callback))

  const scoreBasedOnRatings = ratings =>
    ratings.length > 0 ?
      ratings.map(rating => rating.stars).reduce((a, b) => a + b, 0) / ratings.length
      : undefined


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


  async function basicRetrieve(id) {
    if (typeof(id) !== 'string' || !id) {
      throw error(ErrorCodes.invalidArgument, 'A valid id must be provided')
    }

    /** @type {DBRecipe} */
    const document = await findById(id)

    if (!document) throw error(ErrorCodes.notFound, 'Cannot find recipe with id ' + id)

    return document
  }


  /**
   *
   * @param {string} id
   * @returns {Promise<StoredRecipe>}
   */
  async function retrieve(id) {

    const { _id, name, ingredients, steps, ratings } = await basicRetrieve(id)

    return {
      id: _id,
      name,
      ingredients,
      steps,
      score: scoreBasedOnRatings(ratings)
    }
  }


  /**
   *
   * @param {string} id
   * @param {Stars} stars
   */
  async function rate(id, stars) {

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw error(ErrorCodes.invalidArgument, 'Star rating must be an integer number from 1 to 5')
    }

    const { ratings } = await basicRetrieve(id)

    const newRating = { stars, time: Date.now() }

    await updateById(id, { ratings: [ newRating, ...ratings ] })
  }

  /**
   * Search for all the recipes having a text in it's ingredients or name
   * @param {string} text
   */
  async function find(text) {

    const nonAlphanumeric = /[^\p{L}\p{N} ]+/gu
    const simplifyTexts = (...texts) =>
      texts
        .map(o => String(o).trim())
        .join(' ')
        .replace(nonAlphanumeric, '')
        .toLocaleLowerCase()

    const recipeText = recipe =>
      simplifyTexts(recipe.name, ...recipe.ingredients.map(ingredient => ingredient.name))

    const allRecipes = await findAll()

    if (!text) return allRecipes

    const textToFind = simplifyTexts(text)

    return allRecipes.filter(recipe => recipeText(recipe).indexOf(textToFind) >= 0)
  }

  /**
   * Best recipes in a given period of days until now and
   * @param {number} days
   * @param {number} count
   */
  async function best(days, count) {

    if (!Number.isInteger(days) || days <= 0) {
      throw error(ErrorCodes.invalidArgument, 'Invalid period')
    }
    if (!Number.isInteger(count) || count <= 0) {
      throw error(ErrorCodes.invalidArgument, 'Invalid count')
    }

    const fromTime = Date.now() - (days * 24 * 60 * 60 * 1000)

    function convertRecipe({ _id, ratings, ...recipe }) {
      const validRatings = ratings.filter(rating => rating.time >= fromTime)
      return {
        id: _id,
        score: scoreBasedOnRatings(validRatings),
        ...recipe
      }
    }

    const allRecipes = await findAll()

    return allRecipes
      .map(convertRecipe)
      .filter(recipe => recipe.score != undefined)
      .sort((recipe1, recipe2) => recipe2.score - recipe1.score)
      .slice(0, count)
  }

  return { create,  retrieve, rate, find, best }
}

module.exports = { withDatastore, ErrorCodes }