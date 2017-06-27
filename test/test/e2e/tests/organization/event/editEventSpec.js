'use strict';

let db = requireTestUtil().db;
let dbDsl = requireTestUtil().dbDSL;
let requestHandler = requireTestUtil().requestHandler;

describe('Integration Tests for edit events', function () {


    beforeEach(function () {
        return dbDsl.init();
    });

    it('Edit an event', function () {

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});
        dbDsl.createOrganization('3', {});

        dbDsl.createEvent('1', {organizationId: '2'});
        dbDsl.createEvent('2', {organizationId: '2'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.put('/api/organization/event',
                {eventId: '2', title: 'title', description: 'description'});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match(`(event:Event {eventId: '2'})`)
                .return('event').end().send();
        }).then(function (event) {
            event.length.should.equal(1);
            event[0].event.title.should.equal('title');
            event[0].event.description.should.equal('description');
        });
    });
});
