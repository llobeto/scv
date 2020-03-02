function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next)
      .then(data => res.json(data))
      .catch(next);
  };
}

/**
 *
 * @param {object} app Express app
 * @param {object} recipeService
 */
function setUpApp(app, recipeService) {

  app.get('/recipes/:id', wrapAsync(
    req => recipeService.retrieve(req.params.id)
  ))

  app.get('/recipes', wrapAsync(
    req => recipeService.find(req.query.text)
  ))

  app.get('/recipes/best/:days', wrapAsync(function(req) {
    const days = Number.parseInt(req.params.days)
    const count = Number.parseInt(req.query.count) || Number.MAX_SAFE_INTEGER
    return recipeService.best(days, count)
  }))

  app.post('/recipes', wrapAsync(
    req => recipeService.create(req.body)
  ))

  app.post('/recipes/:id/ratings', wrapAsync(
    req => recipeService.rate(req.params.id, req.body.stars)
  ))
}


module.exports = { setUpApp }