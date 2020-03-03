import Vue from 'vue'
import VueRouter from 'vue-router'
import Recipes from '../views/Recipes.vue'
import Recipe from '../views/Recipe.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Recipes',
    component: Recipes
  },
  {
    path: '/recipes/:id',
    name: 'Recipe',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Recipe
  }
]

const router = new VueRouter({
  routes
})

export default router
