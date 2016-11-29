const fs = require('fs');
const operationTest = require('./operation.test.function.js');
require('dotenv').load({silent: true});

describe('Operation Tests', function () {
  this.timeout(0);
  let testResults = {};

  after(() => {
    fs.writeFileSync('./load/operation.results.json', JSON.stringify(testResults, null, 2));
  });

  describe('View Schema', () => {
    operationTest('view', testResults);
  });

  describe('Trigger Schema', () => {
    operationTest('trigger', testResults);
  });
});
