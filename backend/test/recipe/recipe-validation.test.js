const { expect } = require('chai')
const { validateRecipe } = require('../../src/recipe/recipe-validation')

describe('Recipe validation', () => {
  describe('validateRecipe', () => {
    it('No recipe returns error', async () => {
      const result = validateRecipe()

      expect(result.ok).to.be.false
    })
    it('Non-string recipe name returns error', async () => {
      const result = validateRecipe({ name: 7 })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('name')
    })

    it('Empty recipe name returns error', async () => {
      const result = validateRecipe({ name: '  ' })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('name')
    })
    it('Non-array ingredients returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: 'Invalid' })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('No ingredients returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Falsy ingredients returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [undefined] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Unnamed ingredients returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [{ quantity: 2, unit: 'kg'}] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Non-numeric ingredient quantity returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [{ name: 'Chicken', quantity: '1', unit: 'kg'}] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Negative ingredient quantity returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [{ name: 'Chicken', quantity: -1, unit: 'kg'}] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Negative ingredient quantity returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [{ name: 'Chicken', quantity: -1, unit: 'kg'}] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Invalid ingredient unit returns error', async () => {
      const result = validateRecipe({ name: 'Fried chicken', ingredients: [{ name: 'Chicken', quantity: -1, unit: ' '}] })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('ingredient')
    })
    it('Invalid steps returns error', async () => {
      const result = validateRecipe({
        name: 'Fried chicken',
        ingredients: [{ name: 'Chicken', quantity: 1, unit: 'kg'}],
        steps: '?'
      })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('step')
    })
    it('Empty steps returns error', async () => {
      const result = validateRecipe({
        name: 'Fried chicken',
        ingredients: [{ name: 'Chicken', quantity: 1, unit: 'kg'}],
        steps: []
      })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('step')
    })
    it('Invalid step returns error', async () => {
      const result = validateRecipe({
        name: 'Fried chicken',
        ingredients: [{ name: 'Chicken', quantity: 1, unit: 'kg'}],
        steps: ['Put the chickem in a pan with boiling oil', 'wait', 7]
      })

      expect(result.ok).to.be.false
      expect(result.message).to.contain('step')
    })
    it('Full valid recipe returns ok', async () => {
      const result = validateRecipe({
        name: 'Fried chicken',
        ingredients: [{ name: 'Chicken', quantity: 1, unit: 'kg'}],
        steps: ['Put the chickem in a pan with boiling oil', 'wait']
      })

      expect(result.ok).to.be.true
    })
  })
})