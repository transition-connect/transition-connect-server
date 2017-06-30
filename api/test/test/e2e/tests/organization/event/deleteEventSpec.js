'use strict';

let db = require('server-test-util').db;
let dbDsl = require('server-test-util').dbDSL;
let requestHandler = require('server-test-util').requestHandler;

describe('Integration Tests for delete events', function () {


    beforeEach(function () {
        return dbDsl.init();
    });

    it('Delete an event', function () {

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});
        dbDsl.createOrganization('3', {});

        dbDsl.createEvent('1', {organizationId: '2'});
        dbDsl.createEvent('2', {organizationId: '2'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.delete('/api/organization/event', {eventId: '1'});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match(`(event:Event)`)
                .return('event').end().send();
        }).then(function (event) {
            event.length.should.equal(1);
            event[0].event.eventId.should.equal('2');
        });
    });
});
