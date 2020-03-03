<template>
  <div>
    <h1>Listado de recetas</h1>
    <RecipeList v-if="hasData" :recipes="recipes" v-on:detail="recipeDetail" />
    <h2 v-else-if="gotError">No se pudo recuperar las recetas!</h2>
    <h2 v-else>No hay recetas todavía</h2>
  </div>
</template>

<script>
import RecipeList from '../components/RecipeList'
import { recipe } from '../api'

export default {
  name: 'Recipes',
  components: { RecipeList },
  data() {
    return {
      recipes: [],
      gotError: false,
    }
  },

  async created() {
    try {
      this.load(await recipe.all())
    } catch(err) {
      this.error(err)
    }
  },

  computed: {
    hasData() {
      return this.recipes.length > 0
    }
  },

  methods: {
    load(recipes) {
      this.recipes = recipes
      this.gotError = false
    },
    error() {
      this.recipes = []
      this.gotError = true
    },
    recipeDetail(recipeId) {
      this.$router.push(`recipes/${recipeId}`)
    }
  }
}
</script>