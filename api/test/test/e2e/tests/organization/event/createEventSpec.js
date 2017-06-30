'use strict';

let db = require('server-test-util').db;
let dbDsl = require('server-test-util').dbDSL;
let requestHandler = require('server-test-util').requestHandler;
let should = require('chai').should();

describe('Integration Tests for creating events', function () {


    beforeEach(function () {
        return dbDsl.init();
    });

    it('Create an event', function () {

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});
        dbDsl.createOrganization('3', {});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.post('/api/organization/event',
                {organizationId: '2', title: 'title', description: 'description'});
        }).then(function (res) {
            res.status.should.equal(200);
            should.exist(res.body.eventId);
            return db.cypher().match(`(event:Event {eventId: {eventId}})<-[:HAS]-(:Organization {organizationId: '2'})`)
                .return('event').end({eventId: res.body.eventId}).send();
        }).then(function (event) {
            event.length.should.equal(1);
            event[0].event.title.should.equal('title');
            event[0].event.description.should.equal('description');
        });
    });
});
