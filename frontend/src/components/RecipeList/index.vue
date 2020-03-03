<template>
  <div>
    <RecipeItem
      v-for="recipe in recipes"
      :recipe="recipe"
      :key="recipe.id"
      v-on:detail="itemDetail" />
  </div>
</template>

<script>
import RecipeItem from './RecipeItem.vue'

export default {
  name: 'RecipeList',
  props: [ 'recipes' ],
  components: {
    RecipeItem
  },
  computed: {
  },
  methods: {
    itemDetail(recipeId) {
      this.$emit('detail', recipeId)
    }
  }
}
</script>
