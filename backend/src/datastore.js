/**
 * Initializes database
 */

const { ensureDirSync } = require('fs-extra')
const { dirname } = require('path')
const Datastore = require('nedb')

/**
 * Creates a MongoDB like collection
 * @param {string} dataFileFullPath
 */
function createDatastore(dataFileFullPath) {
  ensureDirSync(dirname(dataFileFullPath))

  return new Datastore({ filename: dataFileFullPath, autoload: true })
}

module.exports = { createDatastore }