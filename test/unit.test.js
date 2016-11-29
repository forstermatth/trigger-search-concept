/*eslint quotes:0 no-shadow:0*/

const knex = require('knex');
const uuid = require('uuid');
const expect = require('chai').expect;
require('dotenv').load({silent: true});

describe('Unit', () => {
  let pg;
  let makeId = uuid.v4();
  let newModelId = uuid.v4();
  let certifiedModelId = uuid.v4();
  let trimId = uuid.v4();

  before(() => {
    pg = knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
      searchPath: 'trigger,view,public',
      debug: false,
      pool: {min: 1, max: 1},
      acquireConnectionTimeout: 120000
    });
  });

  describe('#make', () => {

    it('allows insertion', done =>{
      pg('trigger.make').insert({
        make_id: makeId,
        make_name: 'Toyota Test'
      })
      .then(result => {
        expect(result.rowCount).to.equal(1);
        done();
      });
    });
  });

  describe('#model', () => {

    it('allows insertion of new type', done =>{
      pg('trigger.model').insert({
        make_id: makeId,
        model_id: newModelId,
        year: 2016,
        model_name: 'Elantra',
        model_type: 'N'
      })
      .then(result => {
        expect(result.rowCount).to.equal(1);
        done();
      }).catch(done);
    });

    it('allows insertion of certified type', done =>{
      pg('trigger.model').insert({
        make_id: makeId,
        model_id: certifiedModelId,
        year: 2014,
        model_name: 'RAV4 Test',
        model_type: 'C'
      })
      .then(result => {
        expect(result.rowCount).to.equal(1);
        done();
      }).catch(done);
    });
  });

  describe('#trim', () => {
    it('allows insertion', done => {
      pg('trigger.trim').insert({
        trim_id: trimId,
        model_id: newModelId,
        trim_name: 'Extended Test',
        package_name: 'AWD Technology Package',
        model_code: 'T5R22',
        package_code: 'B',
        apx_code: '10'
      })
      .then(result => {
        expect(result.rowCount).to.equal(1);
        done();
      });
    });
  });

  describe('#vehicle_search', () => {
    it('has built search rows', done => {
      pg('trigger.vehicle_search').select()
      .then(rows => {
        expect(rows.length).to.be.at.least(2);
        done();
      }).catch(done);
    });

    it('case insensitive search by default', done => {
      pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('rav4 TOYOTA')")
      .then(result => {
        expect(result.rowCount).to.be.at.least(1);
        done();
      }).catch(done);
    });

    it('order insensitive search', done => {
      pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('toyota 2016 Elantra B')")
      .then(result => {
        expect(result.rowCount).to.be.at.least(1);
        done();
      }).catch(done);
    });

    it('reflects updates to the make table', done => {
      pg('trigger.make').update({
        make_name: 'Scion'
      }).where({make_id: makeId})
      .then(() => {

        pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('toyota 2016 Elantra B t')")
        .then(result => {
          expect(result.rowCount).to.equal(0);

          pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('scion 2016 Elantra B t')")
          .then(result => {
            expect(result.rowCount).to.be.at.least(1);
            done();
          }).catch(done);
        }).catch(done);
      });
    });

    it('reflects updates to certified models', done => {
      pg('trigger.model').update({
        model_name: 'FRS'
      }).where({model_id: certifiedModelId})
      .then(() => {

        pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('2014 scion RAV4')")
        .then(result => {
          expect(result.rowCount).to.equal(0);

          pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('2014 scion FRS')")
          .then(result => {
            expect(result.rowCount).to.be.at.least(1);
            done();
          }).catch(done);
        }).catch(done);
      });
    });

    it('reflects updates to new models', done => {
      pg('trigger.model').update({
        model_name: 'QB'
      }).where({model_id: newModelId})
      .then(() => {

        pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('scion 2016 Elantra B t')")
        .then(result => {
          expect(result.rowCount).to.equal(0);

          pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('scion 2016 QB B t')")
          .then(result => {
            expect(result.rowCount).to.be.at.least(1);
            done();
          }).catch(done);
        }).catch(done);
      });
    });

    it('removes trim records to allow for deletion', done => {
      pg('trigger.trim').del().where({trim_id: trimId})
      .then(() => {
        pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('2016 scion RAV4')")
        .then(result => {
          expect(result.rowCount).to.equal(0);
          done();
        });
      });
    });

    it('removes model records to allow for deletion', done => {
      pg('trigger.model').del().where({model_id: certifiedModelId})
      .then(() => {
        pg.raw("select * from trigger.vehicle_search where document @@ plainto_tsquery('2014 scion FRS')")
        .then(result => {
          expect(result.rowCount).to.equal(0);
          done();
        });
      });
    });

  });

});
