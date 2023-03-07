// hello_algolia.js

const algoliasearch = require('algoliasearch')

// Connect and authenticate with your Algolia app
const client = algoliasearch('1WK0J33355', 'a548ac682c4adafb02246352cee0d5e3')

// Create a new index and add a record
const index = client.initIndex('test_index')
const record = {objectID: 1, name: 'test_record'}
index.saveObject(record).wait()

// Search the index and print the results
index
  .search('test_record')
  .then(({hits}) => console.log(hits[0]))
  .catch(err => console.error(err))
