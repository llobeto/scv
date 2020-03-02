const { expect } = require('chai')

const { withDatastore, ErrorCodes } = require('../../src/recipe/index')

describe('Recipe', () => {
  describe('create', () => {
    it('Invalid recipe name throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        const recipe = await recipeService.create({
          name: 'Fried chicken',
          steps: ['Put the chicken in a pan with boiling oil', 'wait']
        })
        expect.fail()
      } catch(err) {
        expect(err.code === ErrorCodes.invalidArgument)
      }
    })
    it('Valid recipe is inserted in datastore', async () => {

      const validRecipe = {
        name: 'Fried chicken',
        ingredients: [
          {name: 'chicken', quantity: 1,  unit: 'unit'},
          {name: 'oil', quantity: 2,  unit: 'litres'}
        ],
        steps: ['Put the chicken in a pan with boiling oil', 'wait']
      }

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
})