<template>
  <div v-on:click="clicked">{{recipe.name}}, {{recipe.score}}</div>
</template>

<script>
export default {
  name: 'RecipeItem',
  props: [ 'recipe' ],
  methods: {
    clicked() {
      this.$emit('detail', this.recipe.id)
    }
  }
}
</script>
