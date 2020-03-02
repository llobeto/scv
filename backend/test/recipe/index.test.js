const { expect } = require('chai')

const { withDatastore, ErrorCodes } = require('../../src/recipe/index')

const validRecipe = {
  name: 'Fried chicken',
  ingredients: [
    {name: 'chicken', quantity: 1,  unit: 'unit'},
    {name: 'oil', quantity: 2,  unit: 'litres'}
  ],
  steps: ['Put the chicken in a pan with boiling oil', 'wait']
}

describe('Recipe', () => {
  describe('create', () => {
    it('Invalid recipe name throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.create({
          name: 'Fried chicken',
          steps: ['Put the chicken in a pan with boiling oil', 'wait']
        })
        expect.fail()
      } catch(err) {
        expect(err.code === ErrorCodes.invalidArgument)
      }
    })
    it('Valid recipe is inserted in datastore', async () => {

      const fakeDatastore = {
        insert(object, callback) {
          expect(object).to.be.deep.eq({ ratings: [], ...validRecipe })
          callback(undefined, { _id: 'an id', ...object})
        }
      }

      const recipeService = withDatastore(fakeDatastore)
      const recipe = await recipeService.create(validRecipe)

      expect(recipe).to.be.deep.eq({
        id: 'an id',
        ...validRecipe
      })
    })
  })

  describe('retrieve', () => {
    it('Invalid id throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.retrieve(8)
        expect.fail()
      } catch(err) {
        expect(err.code === ErrorCodes.invalidArgument)
      }
    })
    it('Empty id throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.retrieve('')
        expect.fail()
      } catch(err) {
        expect(err.code === ErrorCodes.invalidArgument)
      }
    })
    it('Valid id of unexistent recipe throws not-found', async () => {

      const fakeDatastore = {
        findOne(id, callback) {
          expect(id).to.be.eq('an id')
          callback(undefined, null)
        }
      }

      const recipeService = withDatastore(fakeDatastore)

      try {
        await recipeService.retrieve('an id')
        expect.fail()
      } catch(err) {
        expect(err.code === ErrorCodes.notFound)
      }
    })
    it('Valid id of existent object with no ratings is retrieved without score', async () => {

      const fakeDatastore = {
        findOne(query, callback) {
          expect(query).to.be.deep.eq({ _id: 'an id'})
          callback(undefined, { _id: query._id, ...validRecipe, ratings: []})
        }
      }

      const recipeService = withDatastore(fakeDatastore)
      const { id, score, ...recipe } = await recipeService.retrieve('an id')

      expect(recipe).to.be.deep.eq(validRecipe)
      expect(id).to.be.deep.eq('an id')
      expect(score).to.be.undefined
    })
    it('Valid id of existent object with ratings is retrieved with average score', async () => {

      const fakeDatastore = {
        findOne(query, callback) {
          expect(query).to.be.deep.eq({ _id: 'an id'})
          callback(undefined, { _id: query._id, ...validRecipe, ratings: [{ stars: 2 }, { stars: 3 }]})
        }
      }

      const recipeService = withDatastore(fakeDatastore)
      const { id, score, ...recipe } = await recipeService.retrieve('an id')

      expect(recipe).to.be.deep.eq(validRecipe)
      expect(id).to.be.deep.eq('an id')
      expect(score).to.be.eq(2.5)
    })
  })
})