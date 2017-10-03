'use strict';

let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;

describe('Integration Tests for accepting/deny an organization as admin of an networking platform', function () {

    beforeEach(function () {
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminId: '1', name: 'Elyoos', description: 'description', link: 'www.link.org'});
            dbDsl.createNetworkingPlatform('2', {adminId: '2', name: 'Elyoos2', description: 'description2', link: 'www.link2.org'});

            dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Accept a request of an organization', function () {

        dbDsl.exportRequestOrgToNp({organizationId: '1', npId: '1'});
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/organization/exportRequest',
                {platformId: '1', organizationId: '1', accept: true});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '1'})-[:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`org.organizationId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
        });
    });

    it('Accept sync of of an organization which has been previously denied', function () {

        dbDsl.exportDenyOrgToNp({organizationId: '1', npId: '1'});
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/organization/exportRequest',
                {platformId: '1', organizationId: '1', accept: true});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '1'})-[:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`org.organizationId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
        });
    });

    it('Deny a request of an organization', function () {

        dbDsl.exportRequestOrgToNp({organizationId: '1', npId: '1'});
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/organization/exportRequest',
                {platformId: '1', organizationId: '1', accept: false});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '1'})-[:EXPORT_DENIED]->(exportedNP:NetworkingPlatform)")
                .return(`org.organizationId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
        });
    });

    it('Deny sync of of an organization which has been previously accepted', function () {

        dbDsl.exportOrgToNp({organizationId: '1', npId: '1'});
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/organization/exportRequest',
                {platformId: '1', organizationId: '1', accept: false});
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '1'})-[:EXPORT_DENIED]->(exportedNP:NetworkingPlatform)")
                .return(`org.organizationId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
        });
    });

    it('Only administrator of networking platform is allowed to accept/decline organization', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin2);
        }).then(function () {
            return requestHandler.put('/admin/api/networkingPlatform/organization/exportRequest',
                {platformId: '1', organizationId: '1', accept: true});
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});