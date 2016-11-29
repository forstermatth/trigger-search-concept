
const Table = require('cli-table2');
const fs = require('fs');
const colors = require('colors/safe');
const _ = require('lodash');

let operationResults = JSON.parse(fs.readFileSync('./load/operation.results.json').toString());
let searchResults = JSON.parse(fs.readFileSync('./load/search.results.json').toString());

function setColors(triggerResults, viewResults) {

  _.map(triggerResults, (triggerResult, key) => {
    let viewResult = viewResults[key];

    if (triggerResult < viewResult) {
      triggerResult = colors.green(triggerResult);
      viewResult = colors.red(viewResult);
    } else if (triggerResult > viewResult) {
      triggerResult = colors.red(triggerResult);
      viewResult = colors.green(viewResult);
    }

    viewResults[key] = viewResult;
    triggerResults[key] = triggerResult;

    return null;
  });
}

setColors(operationResults.trigger.make.insert, operationResults.view.make.insert);
setColors(operationResults.trigger.make.update, operationResults.view.make.update);
setColors(operationResults.trigger.make.delete, operationResults.view.make.delete);

setColors(operationResults.trigger.model.insert, operationResults.view.model.insert);
setColors(operationResults.trigger.model.update, operationResults.view.model.update);
setColors(operationResults.trigger.model.delete, operationResults.view.model.delete);

setColors(operationResults.trigger.trim.insert, operationResults.view.trim.insert);
setColors(operationResults.trigger.trim.update, operationResults.view.trim.update);
setColors(operationResults.trigger.trim.delete, operationResults.view.trim.delete);

let operationsTable = new Table({
  head: [colors.white('Operaton Results (ms)'), 'Schema', {content: '#', hAlign: 'center'}, 'Make', 'Model', 'Trim', 'Delta']
});

operationsTable.push(
  [{rowSpan: 6, content: 'Insert', vAlign: 'center', hAlign: 'center'},
    colors.cyan('Trigger'), '1', operationResults.trigger.make.insert[1], operationResults.trigger.model.insert[1], operationResults.trigger.trim.insert[1]],
    [colors.magenta('View'), '1', operationResults.view.make.insert[1], operationResults.view.model.insert[1], operationResults.view.trim.insert[1]],
    [colors.cyan('Trigger'), '100', operationResults.trigger.make.insert[100], operationResults.trigger.model.insert[100], operationResults.trigger.trim.insert[100]],
    [colors.magenta('View'), '100', operationResults.view.make.insert[100], operationResults.view.model.insert[100], operationResults.view.trim.insert[100]],
    [colors.cyan('Trigger'), '10000', operationResults.trigger.make.insert[10000], operationResults.trigger.model.insert[10000], operationResults.trigger.trim.insert[10000]],
    [colors.magenta('View'), '10000', operationResults.view.make.insert[10000], operationResults.view.model.insert[10000], operationResults.view.trim.insert[10000]],
  [{rowSpan: 6, content: 'Update', vAlign: 'center', hAlign: 'center'},
    colors.cyan('Trigger'), '1', operationResults.trigger.make.update[1], operationResults.trigger.model.update[1], operationResults.trigger.trim.update[1]],
    [colors.magenta('View'), '1', operationResults.view.make.update[1], operationResults.view.model.update[1], operationResults.view.trim.update[1]],
    [colors.cyan('Trigger'), '100', operationResults.trigger.make.update[100], operationResults.trigger.model.update[100], operationResults.trigger.trim.update[100]],
    [colors.magenta('View'), '100', operationResults.view.make.update[100], operationResults.view.model.update[100], operationResults.view.trim.update[100]],
    [colors.cyan('Trigger'), '10000', operationResults.trigger.make.update[10000], operationResults.trigger.model.update[10000], operationResults.trigger.trim.update[10000]],
    [colors.magenta('View'), '10000', operationResults.view.make.update[10000], operationResults.view.model.update[10000], operationResults.view.trim.update[10000]],
  [{rowSpan: 4, content: 'Delete', vAlign: 'center', hAlign: 'center'},
    colors.cyan('Trigger'), '100', operationResults.trigger.make.delete[100], operationResults.trigger.model.delete[100], operationResults.trigger.trim.delete[100]],
    [colors.magenta('View'), '100', operationResults.view.make.delete[100], operationResults.view.model.delete[100], operationResults.view.trim.delete[100]],
    [colors.cyan('Trigger'), '10000', operationResults.trigger.make.delete[10000], operationResults.trigger.model.delete[10000], operationResults.trigger.trim.delete[10000]],
    [colors.magenta('View'), '10000', operationResults.view.make.delete[10000], operationResults.view.model.delete[10000], operationResults.view.trim.delete[10000]]
);

let searchTable = new Table({
  head: [colors.white('Search Comparisons (ms)'), 'Schema', {content: 'Time', hAlign: 'center'}]
});

if (!searchResults.trigger.general.foundResult) searchResults.trigger.general.time = colors.bgYellow.black(searchResults.trigger.general.time);
if (!searchResults.trigger.specific.foundResult) searchResults.trigger.specific.time = colors.bgYellow.black(searchResults.trigger.specific.time);
if (!searchResults.view.general.foundResult) searchResults.view.general.time = colors.bgYellow.black(searchResults.view.general.time);
if (!searchResults.view.specific.foundResult) searchResults.view.specific.time = colors.bgYellow.black(searchResults.view.specific.time);

searchTable.push(
  [{content: 'General', rowSpan: 2, hAlign: 'center', vAlign: 'center'}, colors.cyan('Trigger'), searchResults.trigger.general.time],
  [colors.magenta('View'), searchResults.view.general.time],
  [{content: 'Specific', rowSpan: 2, hAlign: 'center', vAlign: 'center'}, colors.cyan('Trigger'), searchResults.trigger.specific.time],
  [colors.magenta('View'), searchResults.view.specific.time],
  [{content: 'Under Load', rowSpan: 4, hAlign: 'center', vAlign: 'center'}, colors.cyan('Trigger'), searchResults.trigger[100]],
  [colors.magenta('View'), searchResults.view[100]],
  ['Trigger', searchResults.trigger[1000]],
  [colors.magenta('View'), searchResults.view[1000]]
);

console.log(searchTable.toString());
console.log(operationsTable.toString());
