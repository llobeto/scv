<template>
  <div>
    <div v-if="recipe">
      <h1>{{recipe.name}}</h1>

      <h2>Ingredientes</h2>

      Para <input type="text" v-model="enteredPeopleCount" /> personas:

      <div v-if="validCount">
        <div v-for="ingredient in ingredients" :key="ingredient.key">
          {{ingredient.name}}, {{ingredient.quantity}} {{ingredient.unit}}
        </div>
      </div>

      <div v-else-if="emptyCount">¿Para cuántas personas?</div>
      <div v-else>Debe especificar un número mayor que cero</div>
    </div>
    <div v-else>No se pudo cargar esta receta.</div>
  </div>
</template>

<script>
import { recipe } from '../api'

export default {
  data() {
    return {
      recipe: undefined,
      enteredPeopleCount: '1'
    }
  },

  async created() {
    try {
      this.recipe = await recipe.retrieve(this.$route.params.id)
    } catch(err) {
      console.error(err)
    }
  },

  computed: {
    validCount() {
      return this.peopleCount !== undefined && this.peopleCount > 0
    },
    emptyCount() {
      return !this.enteredPeopleCount
    },
    peopleCount() {
      return Number.parseFloat(this.enteredPeopleCount) || undefined
    },
    ingredients() {
      const count = this.peopleCount
      return this.recipe.ingredients
        .map(({ quantity, ...rest }, key) => ({ quantity: quantity * count, key, ...rest}))
    }
  }
}
</script>