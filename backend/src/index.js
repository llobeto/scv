const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { DATA_FOLDER, PORT } = require('../conf')
const { createDatastore } = require('./datastore')
const { withDatastore } = require('./recipe-service')
const { invalidArgument, notFound } = require('./error-codes')
const { setUpApp } = require('./app')


const recipeDatastore = createDatastore(DATA_FOLDER)
const recipeService = withDatastore(recipeDatastore)

const httpStatusCode = {
  [invalidArgument]: 400,
  [notFound]: 404,
  unknown: 500
}

const app = express()

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200,
  allowedHeaders: '*'
}))
app.use(bodyParser.json())

setUpApp(app, recipeService)

app.use(function(err, _, res, _) {
  const message = err.message || 'Unknown internal error'
  const status = httpStatusCode[err.code] || httpStatusCode.unknown
  res.status(status);
  res.json({ message });
  console.error(`Error: ${message}. Status ${status} returned.`)
  console.error(err)
})

app.listen(PORT, () => {
  console.log('Server started at port ' + PORT)
})

