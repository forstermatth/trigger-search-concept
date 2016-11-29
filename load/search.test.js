const knex = require('knex');
const uuid = require('uuid');
const Stopwatch = require('timer-stopwatch');
const fs = require('fs');
const when = require('when');
const _ = require('lodash');
require('dotenv').load({silent: true});

describe('Search Tests', function () {
  this.timeout(0);
  let pg;
  let testResults = {};

  let makeNames = ['Toyota', 'Scion', 'Ford', 'Kia', 'Subaru', 'GMC', 'Hyundai', 'Mitsubishi', 'BMW', 'Dodge'];
  let modelNames = ['Lancer', 'Dart', 'Fusion', 'Sunflower', 'F150', 'FRS', 'Sportage', 'Tuscon', 'M3', 'BRZ', 'Forester', 'Focus', 'Challenger', 'Impreza', 'WRX'];
  let years = ['2014', '2015', '2016', '2017'];
  let trimNames = ['Technology', 'Standard', 'AWD', 'Extended', 'Race', 'Base'];
  let packageNames = ['A', 'B', 'Tech', 'C', 'Limited'];

  before(done => {
    pg = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
      searchPath: 'trigger,view,public',
      debug: false,
      pool: {min: 1, max: 1},
      acquireConnectionTimeout: 120000
    });

    pg('view.make').insert({
      make_id: uuid.v4(),
      make_name: 'Init Insert'
    }).then(() => {
      done();
    }).catch(done);
  });

  after(() => {
    fs.writeFileSync('./load/search.results.json', JSON.stringify(testResults, null, 2));
  });

  describe('View Scheme', () => {
    testResults.view = {};

    it('general model query', done => {
      let timer = new Stopwatch();

      timer.start();
      pg.raw(`select model_id, trim_id from view.vehicle_search where document like '%${_.sample(years) + _.sample(makeNames) + _.sample(modelNames)}%' limit 10`)
      .then(res => {
        timer.stop();
        testResults.view.general = {
          time: timer.ms,
          foundResult: !!res.rowCount
        };
        done();
      }).catch(done);
    });

    it('specific trim query', done => {
      let timer = new Stopwatch();

      timer.start();
      pg.raw(`select model_id, trim_id from view.vehicle_search where document like '%${_.sample(years) + _.sample(makeNames) + _.sample(modelNames) + _.sample(trimNames) + _.sample(packageNames)}%' limit 10`)
      .then(res => {
        timer.stop();
        testResults.view.specific = {
          time: timer.ms,
          foundResult: !!res.rowCount
        };
        done();
      }).catch(done);
    });

    it('100', done => {
      let timer = new Stopwatch();
      let promises = [];

      timer.start();
      for (let i = 0; i < 100; i++) {
        promises.push(pg.raw(`select model_id, trim_id from view.vehicle_search where document like '%${_.sample(years) + _.sample(makeNames) + _.sample(modelNames) + _.sample(trimNames) + _.sample(packageNames)}%' limit 10`));
      }

      when.all(promises).then(() => {
        timer.stop();
        testResults.view[100] = timer.ms;
        done();
      }).catch(done);
    });

    it('1000', done => {
      let timer = new Stopwatch();
      let promises = [];

      timer.start();
      for (let i = 0; i < 1000; i++) {
        promises.push(pg.raw(`select model_id, trim_id from view.vehicle_search where document like '%${_.sample(years) + _.sample(makeNames) + _.sample(modelNames) + _.sample(trimNames) + _.sample(packageNames)}%' limit 10`));
      }

      when.all(promises).then(() => {
        timer.stop();
        testResults.view[1000] = timer.ms;
        done();
      }).catch(done);
    });
  });

  describe('Trigger Scheme', () => {
    testResults.trigger = {};

    it('general model query', done => {
      let timer = new Stopwatch();

      timer.start();
      pg.raw(`select model_id, trim_id from trigger.vehicle_search where document @@ plainto_tsquery('${_.sample(years)} ${_.sample(makeNames)} ${_.sample(modelNames)}') limit 10`)
      .then(res => {
        timer.stop();
        testResults.trigger.general = {
          time: timer.ms,
          foundResult: !!res.rowCount
        };
        done();
      }).catch(done);
    });

    it('specific trim query', done => {
      let timer = new Stopwatch();

      timer.start();
      pg.raw(`select model_id, trim_id from trigger.vehicle_search where document @@ plainto_tsquery('${_.sample(years)} ${_.sample(makeNames)} ${_.sample(modelNames)} ${_.sample(trimNames)} ${_.sample(packageNames)}') limit 10`)
      .then(res => {
        timer.stop();
        testResults.trigger.specific = {
          time: timer.ms,
          foundResult: !!res.rowCount
        };
        done();
      }).catch(done);
    });

    it('100', done => {
      let timer = new Stopwatch();
      let promises = [];

      timer.start();
      for (let i = 0; i < 100; i++) {
        promises.push(pg.raw(`select model_id, trim_id from trigger.vehicle_search where document @@ plainto_tsquery('${_.sample(years)} ${_.sample(makeNames)} ${_.sample(modelNames)} ${_.sample(trimNames)} ${_.sample(packageNames)}') limit 10`));
      }

      when.all(promises).then(() => {
        timer.stop();
        testResults.trigger[100] = timer.ms;
        done();
      }).catch(done);
    });

    it('1000', done => {
      let timer = new Stopwatch();
      let promises = [];

      timer.start();
      for (let i = 0; i < 1000; i++) {
        promises.push(pg.raw(`select model_id, trim_id from trigger.vehicle_search where document @@ plainto_tsquery('${_.sample(years)} ${_.sample(makeNames)} ${_.sample(modelNames)} ${_.sample(trimNames)} ${_.sample(packageNames)}') limit 10`));
      }

      when.all(promises).then(() => {
        timer.stop();
        testResults.trigger[1000] = timer.ms;
        done();
      }).catch(done);
    });
  });

});
