const knex = require('knex');
const uuid = require('uuid');
const Stopwatch = require('timer-stopwatch');
const lorem = require('lorem-ipsum');
const when = require('when');
require('dotenv').load({silent: true});

module.exports = function SchemaTest(schema, testResults) {
  testResults[schema] = {};
  let singleMake = {};
  let singleModel = {};
  let singleTrim = {};
  let oneHundredMakes = [];
  let tenThousandMakes = [];
  let oneHundredModels = [];
  let tenThousandModels = [];
  let oneHundredTrims = [];
  let tenThousandTrims = [];

  let pg = null;

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

  describe('Make', () => {
    testResults[schema].make = {};

    describe('Insert', () => {
      testResults[schema].make.insert = {};
      it('1', done => {
        let timer = new Stopwatch();

        singleMake = {
          make_id: uuid.v4(),
          make_name: lorem({count: 1, units: 'words'})
        };

        timer.start();
        pg(`${schema}.make`).insert(singleMake).then(() => {
          timer.stop();
          testResults[schema].make.insert[1] = timer.ms;
          done();
        }).catch(done);
      });

      it('100', done => {
        let timer = new Stopwatch();
        let promises = [];

        timer.start();
        for (let i = 0; i < 100; i++) {
          let record = {
            make_id: uuid.v4(),
            make_name: lorem({count: 1, units: 'words'})
          };

          oneHundredMakes.push(record);
          promises.push(pg(`${schema}.make`).insert(record));
        }

        when.all(promises).then(() => {
          timer.stop();
          testResults[schema].make.insert[100] = timer.ms;
          done();
        }).catch(done);
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises = [];

        timer.start();
        for (let i = 0; i < 10000; i++) {
          let record = {
            make_id: uuid.v4(),
            make_name: lorem({count: 1, units: 'words'})
          };

          tenThousandMakes.push(record);
          promises.push(pg(`${schema}.make`).insert(record));
        }

        when.all(promises).then(() => {
          timer.stop();
          testResults[schema].make.insert[10000] = timer.ms;
          done();
        }).catch(done);
      });
    });

    describe('Update', () => {
      testResults[schema].make.update = {};

      it('1', done => {
        let timer = new Stopwatch();

        singleMake.make_name = lorem({count: 1, units: 'words'});
        timer.start();
        pg(`${schema}.make`).update(singleMake).where({make_id: singleMake.make_id})
        .then(() => {
          timer.stop();
          testResults[schema].make.update[1] = timer.ms;
          done();
        });
      });

      it('100', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = oneHundredMakes.map(make => {
          return pg(`${schema}.make`).update({make_name: lorem({count: 1, units: 'words'})}).where({make_id: make.make_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].make.update[100] = timer.ms;
          done();
        });
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = tenThousandMakes.map(make => {
          return pg(`${schema}.make`).update({make_name: lorem({count: 1, units: 'words'})}).where({make_id: make.make_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].make.update[10000] = timer.ms;
          done();
        });
      });
    });

    describe('Delete', () => {
      testResults[schema].make.delete = {};

      it('100', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = oneHundredMakes.map(make => {
          return pg(`${schema}.make`).del().where({make_id: make.make_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].make.delete[100] = timer.ms;
          done();
        });
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = tenThousandMakes.map(make => {
          return pg(`${schema}.make`).del().where({make_id: make.make_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].make.delete[10000] = timer.ms;
          done();
        });
      });
    });
  });

  describe('Model', () => {
    testResults[schema].model = {};

    describe('Insert', () => {
      testResults[schema].model.insert = {};
      it('1', done => {
        let timer = new Stopwatch();

        singleModel = {
          model_id: uuid.v4(),
          make_id: singleMake.make_id,
          model_name: lorem({count: 3, units: 'words'}),
          year: '2016',
          model_type: 'N'
        };

        timer.start();
        pg(`${schema}.model`).insert(singleModel).then(() => {
          timer.stop();
          testResults[schema].model.insert[1] = timer.ms;
          done();
        }).catch(done);
      });

      it('100', done => {
        let timer = new Stopwatch();
        let promises = [];

        timer.start();
        for (let i = 0; i < 100; i++) {
          let record = {
            model_id: uuid.v4(),
            make_id: singleMake.make_id,
            model_name: lorem({count: 3, units: 'words'}),
            year: '2016',
            model_type: 'N'
          };

          oneHundredModels.push(record);
          promises.push(pg(`${schema}.model`).insert(record));
        }

        when.all(promises).then(() => {
          timer.stop();
          testResults[schema].model.insert[100] = timer.ms;
          done();
        }).catch(done);
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises = [];

        timer.start();
        for (let i = 0; i < 10000; i++) {
          let record = {
            model_id: uuid.v4(),
            make_id: singleMake.make_id,
            model_name: lorem({count: 3, units: 'words'}),
            year: '2016',
            model_type: 'N'
          };

          tenThousandModels.push(record);
          promises.push(pg(`${schema}.model`).insert(record));
        }

        when.all(promises).then(() => {
          timer.stop();
          testResults[schema].model.insert[10000] = timer.ms;
          done();
        }).catch(done);
      });
    });

    describe('Update', () => {
      testResults[schema].model.update = {};

      it('1', done => {
        let timer = new Stopwatch();

        singleModel.model_name = lorem({count: 4, units: 'words'});
        timer.start();
        pg(`${schema}.model`).update(singleModel).where({model_id: singleModel.model_id})
        .then(() => {
          timer.stop();
          testResults[schema].model.update[1] = timer.ms;
          done();
        });
      });

      it('100', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = oneHundredModels.map(model => {
          return pg(`${schema}.model`).update({model_name: lorem({count: 4, units: 'words'})}).where({model_id: model.model_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].model.update[100] = timer.ms;
          done();
        });
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = tenThousandModels.map(model => {
          return pg(`${schema}.model`).update({model_name: lorem({count: 4, units: 'words'})}).where({model_id: model.model_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].model.update[10000] = timer.ms;
          done();
        });
      });
    });

    describe('Delete', () => {
      testResults[schema].model.delete = {};

      it('100', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = oneHundredModels.map(model => {
          return pg(`${schema}.model`).del().where({model_id: model.model_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].model.delete[100] = timer.ms;
          done();
        });
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = tenThousandModels.map(model => {
          return pg(`${schema}.model`).del().where({model_id: model.model_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].model.delete[10000] = timer.ms;
          done();
        });
      });
    });
  });

  describe('Trim', () => {
    testResults[schema].trim = {};

    describe('Insert', () => {
      testResults[schema].trim.insert = {};
      it('1', done => {
        let timer = new Stopwatch();

        singleTrim = {
          trim_id: uuid.v4(),
          model_id: singleModel.model_id,
          trim_name: lorem({count: 2, units: 'words'}),
          package_name: lorem({count: 1, units: 'words'}),
          model_code: lorem({count: 1, units: 'words'}),
          apx_code: lorem({count: 1, units: 'words'}),
          package_code: lorem({count: 1, units: 'words'})
        };

        timer.start();
        pg(`${schema}.trim`).insert(singleTrim).then(() => {
          timer.stop();
          testResults[schema].trim.insert[1] = timer.ms;
          done();
        }).catch(done);
      });

      it('100', done => {
        let timer = new Stopwatch();
        let promises = [];

        timer.start();
        for (let i = 0; i < 100; i++) {
          let record = {
            trim_id: uuid.v4(),
            model_id: singleModel.model_id,
            trim_name: lorem({count: 2, units: 'words'}),
            package_name: lorem({count: 1, units: 'words'}),
            model_code: lorem({count: 1, units: 'words'}),
            apx_code: lorem({count: 1, units: 'words'}),
            package_code: lorem({count: 1, units: 'words'})
          };

          oneHundredTrims.push(record);
          promises.push(pg(`${schema}.trim`).insert(record));
        }

        when.all(promises).then(() => {
          timer.stop();
          testResults[schema].trim.insert[100] = timer.ms;
          done();
        }).catch(done);
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises = [];

        timer.start();
        for (let i = 0; i < 10000; i++) {
          let record = {
            trim_id: uuid.v4(),
            model_id: singleModel.model_id,
            trim_name: lorem({count: 2, units: 'words'}),
            package_name: lorem({count: 1, units: 'words'}),
            model_code: lorem({count: 1, units: 'words'}),
            apx_code: lorem({count: 1, units: 'words'}),
            package_code: lorem({count: 1, units: 'words'})
          };

          tenThousandTrims.push(record);
          promises.push(pg(`${schema}.trim`).insert(record));
        }

        when.all(promises).then(() => {
          timer.stop();
          testResults[schema].trim.insert[10000] = timer.ms;
          done();
        }).catch(done);
      });
    });

    describe('Update', () => {
      testResults[schema].trim.update = {};

      it('1', done => {
        let timer = new Stopwatch();

        singleTrim.trim_name = lorem({count: 4, units: 'words'});
        timer.start();
        pg(`${schema}.trim`).update(singleTrim).where({trim_id: singleTrim.trim_id})
        .then(() => {
          timer.stop();
          testResults[schema].trim.update[1] = timer.ms;
          done();
        });
      });

      it('100', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = oneHundredTrims.map(trim => {
          return pg(`${schema}.trim`).update({trim_name: lorem({count: 4, units: 'words'})}).where({trim_id: trim.trim_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].trim.update[100] = timer.ms;
          done();
        });
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = tenThousandTrims.map(trim => {
          return pg(`${schema}.trim`).update({trim_name: lorem({count: 4, units: 'words'})}).where({trim_id: trim.trim_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].trim.update[10000] = timer.ms;
          done();
        });
      });
    });

    describe('Delete', () => {
      testResults[schema].trim.delete = {};

      it('100', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = oneHundredTrims.map(trim => {
          return pg(`${schema}.trim`).del().where({trim_id: trim.trim_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].trim.delete[100] = timer.ms;
          done();
        });
      });

      it('10000', done => {
        let timer = new Stopwatch();
        let promises;

        timer.start();
        promises = tenThousandTrims.map(trim => {
          return pg(`${schema}.trim`).del().where({trim_id: trim.trim_id});
        });

        when.all(promises)
        .then(() => {
          timer.stop();
          testResults[schema].trim.delete[10000] = timer.ms;
          done();
        });
      });
    });
  });
};
