'use strict';

let dbDsl = require('server-test-util').dbDSL;
let requestHandler = require('server-test-util').requestHandler;

describe('Integration Tests to get an overview of the organizations', function () {


    beforeEach(function () {
        return dbDsl.init();
    });

    it('Get an overview of the organizations', function () {

        dbDsl.createOrganization('1', {});
        dbDsl.createOrganization('2', {});
        dbDsl.createOrganization('3', {});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.get('/api/organization/overview', {skip: 0, maxItems: 10});
        }).then(function (res) {
            res.status.should.equal(200);

            res.body.organization.length.should.equals(3);
            res.body.organization[0].name.should.equals('organization1Name');
            res.body.organization[0].organizationId.should.equals('1');
            res.body.organization[1].name.should.equals('organization2Name');
            res.body.organization[1].organizationId.should.equals('2');
            res.body.organization[2].name.should.equals('organization3Name');
            res.body.organization[2].organizationId.should.equals('3');
        });
    });
});
