const { expect } = require('chai')

const { invalidArgument, notFound } = require('../../src/error-codes')
const { withDatastore } = require('../../src/recipe-service/index')

const validRecipe = {
  name: 'Fried chicken',
  ingredients: [
    {name: 'chicken', quantity: 1,  unit: 'unit'},
    {name: 'oil', quantity: 2,  unit: 'litres'}
  ],
  steps: ['Put the chicken in a pan with boiling oil', 'wait']
}

const anotherValidRecipe = {
  name: 'Caesar Salad',
  ingredients: [
    {name: 'chicken', quantity: 1,  unit: 'unit'},
    {name: 'oil', quantity: 0.1,  unit: 'litres'},
    {name: 'letuce', quantity: 200,  unit: 'grams'}
  ],
  steps: ['Mix all together']
}

const rating = (stars, howOldInDays) =>
  ({ stars, time: Date.now() - (howOldInDays * 24 * 60 * 60* 1000) })

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
        expect(err.code === invalidArgument)
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
        expect(err.code === invalidArgument)
      }
    })
    it('Empty id throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.retrieve('')
        expect.fail()
      } catch(err) {
        expect(err.code === invalidArgument)
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
        expect(err.code === notFound)
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


  describe('rate', () => {
    it('Invalid id throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.rate(8, 5)
        expect.fail()
      } catch(err) {
        expect(err.code === invalidArgument)
      }
    })
    it('Empty id throw error with code invalid-argument and datastore is not used', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.rate('', 5)
        expect.fail()
      } catch(err) {
        expect(err.code === invalidArgument)
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
        await recipeService.rate('an id', 5)
        expect.fail()
      } catch(err) {
        expect(err.code === notFound)
      }
    })
    it('Invalid star number throws invalid-argument', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.rate('an id', 2.5)
        expect.fail()
      } catch(err) {
        expect(err.code === invalidArgument)
      }
    })
    it('Too big star number throws invalid-argument', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.rate('an id', 7)
        expect.fail()
      } catch(err) {
        expect(err.code === invalidArgument)
      }
    })
    it('Too small star number throws invalid-argument', async () => {

      const recipeService = withDatastore({})

      try {
        await recipeService.rate('an id', 0)
        expect.fail()
      } catch(err) {
        expect(err.code === invalidArgument)
      }
    })
    it('Valid arguments, updated successfully', async () => {

      const existentRating = { stars: 2, time: 6 }
      const startTime = Date.now()

      const fakeDatastore = {
        findOne(query, callback) {
          expect(query).to.be.deep.eq({ _id: 'an id'})
          callback(undefined, { _id: query._id, ...validRecipe, ratings: [existentRating]})
        },
        update(query, data, options, callback) {
          expect(query).to.be.deep.eq({ _id: 'an id'})
          expect(data.ratings.length).to.be.eq(2)
          expect(data.ratings[0].stars).to.be.eq(1)
          expect(data.ratings[0].time).to.be.lte(Date.now())
          expect(data.ratings[0].time).to.be.gte(startTime)
          expect(data.ratings[1]).to.be.deep.eq(existentRating)
          expect(options).to.be.deep.eq({})
          callback(undefined, undefined)
        }
      }

      const recipeService = withDatastore(fakeDatastore)
      await recipeService.rate('an id', 1)
    })
  })


  describe('find', () => {

    const fakeDatastore = {
      find(query, callback) {
        expect(query).to.be.deep.eq({})
        callback(undefined, [
          { _id: '1', ratings: [ rating(2, 2), rating(3, 3)], ...validRecipe },
          { _id: '2', ratings: [ rating(2, 1), rating(5, 10)], ...anotherValidRecipe }
        ])
      }
    }
    const recipeService = withDatastore(fakeDatastore)

    it('Empty search string returns all the recipes', async () => {
      const results = await recipeService.find()
      expect(results).to.be.deep.eq([
        { id: '1', score: 2.5, ...validRecipe },
        { id: '2', score: 3.5, ...anotherValidRecipe}
      ])
    })
    it('When a recipe name matches it is returned', async () => {
      const results = await recipeService.find('fried!')
      expect(results).to.be.deep.eq([ { id: '1', score: 2.5, ...validRecipe } ])
    })
    it('When a recipe ingredient name matches, the recipe is returned', async () => {
      const results = await recipeService.find('LETUCE')
      expect(results).to.be.deep.eq([ { id: '2', score: 3.5, ...anotherValidRecipe} ])
    })
  })


  describe('best', () => {

    const fakeDatastore = {
      find(query, callback) {
        expect(query).to.be.deep.eq({})
        callback(undefined, [
          // Expected score: 2
          {
            _id: '1',
            ratings: [ rating(2, 1) ],
          ...validRecipe
          },
          // Expected score: 2.5
          {
            _id: '2',
            ratings: [ rating(2, 2), rating(3, 3), rating(4, 6)],
          ...validRecipe
          },
          // Expected: ignored (no score)
          {
            _id: '3',
            ratings: [],
          ...validRecipe
          },
          // Expected score: ignored (out of count)
          {
            _id: '4',
            ratings: [ rating(1, 2), rating(5, 6)],
          ...validRecipe
          }
        ])
      }
    }
    const recipeService = withDatastore(fakeDatastore)

    it('Invalid argument days, throw invalid-argument', async () => {
      try {
        await recipeService.best('many', 5)
        expect.fail()
      } catch(err) {
        expect(err.code).to.be.eq(invalidArgument)
      }
    })
    it('Negative days, throw invalid-argument', async () => {
      try {
        await recipeService.best(-3, 5)
        expect.fail()
      } catch(err) {
        expect(err.code).to.be.eq(invalidArgument)
      }
    })
    it('Invalid argument count, throw invalid-argument', async () => {
      try {
        await recipeService.best(5, 'many')
        expect.fail()
      } catch(err) {
        expect(err.code).to.be.eq(invalidArgument)
      }
    })
    it('Negative count, throw invalid-argument', async () => {
      try {
        await recipeService.best(5, -2)
        expect.fail()
      } catch(err) {
        expect(err.code).to.be.eq(invalidArgument)
      }
    })
    it('Valid arguments, successfuly filtered and truncated', async () => {
      const results = await recipeService.best(5, 2)
      expect(results.length).to.be.eq(2)
      expect(results[0].score).to.be.eq(2.5)
      expect(results[0].id).to.be.eq('2')
      expect(results[1].score).to.be.eq(2)
      expect(results[1].id).to.be.eq('1')
    })
  })
})