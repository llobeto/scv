const { expect } = require('chai')
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru()

const stubs = {
  path: {
    dirname: sinon.fake.returns('some directory')
  },

  'fs-extra': {
    ensureDirSync: sinon.fake()
  },

  nedb: function(options) {
    return options
  }
}

const { createDatastore } = proxyquire('../src/datastore', stubs)

describe('Datastore', () => {
  describe('Create Data Store', () => {
    it('Non-existent folders must be created and data file must be autoloaded', () => {

      const filePath = 'full path'

      const datastore = createDatastore(filePath)

      expect(datastore).to.deep.eq({ filename: filePath, autoload: true})
      expect(stubs['fs-extra'].ensureDirSync.calledOnceWith('some directory')).to.be.true
    })
  })
})