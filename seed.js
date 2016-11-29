const knex = require('knex');
const uuid = require('uuid');
const _ = require('lodash');
const when = require('when');
require('dotenv').load();

/**
 * Insert seed data into the database.
 *
 * Can specify how much data is to be inserted.
 */

let pg;

pg = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  searchPath: 'trigger,view,public',
  debug: false
});

const seedLevel = Number(process.argv[2]) + 1; // 0, 1, 2
console.log('Received Seed Level: ', seedLevel - 1);
if (seedLevel > 3 || seedLevel < 0) {
  console.error('The seed level is too damn high!');
  process.exit(-1);
}

let makeIds = [];
let modelIds = [];
let makeNames = ['Toyota', 'Scion', 'Ford', 'Kia', 'Subaru', 'GMC', 'Hyundai', 'Mitsubishi', 'BMW', 'Dodge'];
let modelNames = ['Lancer', 'Dart', 'Fusion', 'Sunflower', 'F150', 'FRS', 'Sportage', 'Tuscon', 'M3', 'BRZ', 'Forester', 'Focus', 'Challenger', 'Impreza', 'WRX'];
let years = ['2014', '2015', '2016', '2017'];
let trimNames = ['Technology', 'Standard', 'AWD', 'Extended', 'Race', 'Base'];
let packageNames = ['A', 'B', 'Tech', 'C', 'Limited'];
let modelCodes = ['AAABBC', 'BBBCCD', 'CCCDDF', 'TT234S', '543SR', '33SD'];
let packageCodes = ['1', '2', '3', '4'];
let apxCodes = ['00', '01', '02', '11', '54'];

let numberOfMakes = seedLevel * seedLevel;
let numberOfModels = (seedLevel + 5) * Math.pow(5, seedLevel);
let numberOfTrims = (seedLevel + 10) * Math.pow(10, seedLevel);

let createdMakes = [];
let createdModels = [];
let createdTrims = [];

let totalRows = 0;

console.log('Creating Makes: ', numberOfMakes);
for (let i = 0; i < numberOfMakes; i++) {
  let id = uuid.v4();
  makeIds.push(id);
  totalRows = totalRows + 2;
  createdMakes.push(
    pg('trigger.make').insert({
      make_id: id,
      make_name: _.sample(makeNames)
    })
  );
  createdMakes.push(
    pg('view.make').insert({
      make_id: id,
      make_name: _.sample(makeNames)
    })
  );
}

when.all(createdMakes).then(() => {
  console.log('Creating Models: ', numberOfModels);
  for (let i = 0; i < numberOfModels * 0.75; i++) {
    let id = uuid.v4();
    modelIds.push(id);
    totalRows = totalRows + 2;
    createdModels.push(
      pg('trigger.model').insert({
        make_id: _.sample(makeIds),
        model_id: id,
        model_name: _.sample(modelNames),
        year: _.sample(years),
        model_type: 'N'
      })
    );
    createdModels.push(
      pg('view.model').insert({
        make_id: _.sample(makeIds),
        model_id: id,
        model_name: _.sample(modelNames),
        year: _.sample(years),
        model_type: 'N'
      })
    );
  }

  for (let i = 0; i < numberOfModels * 0.25; i++) {
    let id = uuid.v4();
    totalRows = totalRows + 2;
    createdModels.push(
      pg('trigger.model').insert({
        make_id: _.sample(makeIds),
        model_id: id,
        model_name: _.sample(modelNames),
        year: _.sample(years),
        model_type: 'C'
      })
    );
    createdModels.push(
      pg('view.model').insert({
        make_id: _.sample(makeIds),
        model_id: id,
        model_name: _.sample(modelNames),
        year: _.sample(years),
        model_type: 'C'
      })
    );
  }

  return when.all(createdModels);
}).then(() => {
  console.log('Creating Trims: ', numberOfTrims);
  for (let i = 0; i < numberOfTrims; i++) {
    let id = uuid.v4();
    totalRows = totalRows + 2;
    createdTrims.push(
      pg('trigger.trim').insert({
        trim_id: id,
        model_id: _.sample(modelIds),
        trim_name: _.sample(trimNames),
        package_name: _.sample(packageNames),
        model_code: _.sample(modelCodes),
        apx_code: _.sample(apxCodes),
        package_code: _.sample(packageCodes)
      })
    );
    createdTrims.push(
      pg('view.trim').insert({
        trim_id: id,
        model_id: _.sample(modelIds),
        trim_name: _.sample(trimNames),
        package_name: _.sample(packageNames),
        model_code: _.sample(modelCodes),
        apx_code: _.sample(apxCodes),
        package_code: _.sample(packageCodes)
      })
    );
  }

  return when.all(createdTrims);
})
.then(() => {
  console.info(`Finished [${totalRows}]`);
  process.exit(0);
});
