'use strict';

let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let moment = require('moment');
let should = require('chai').should();

describe('Saving export config for organization profile of an organization', function () {

    let startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});
            dbDsl.createAdmin('3', {email: 'user3@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});
            dbDsl.createNetworkingPlatform('2', {adminIds: ['2'], name: 'Elyoos2', description: 'description2', link: 'www.link2.org'});
            dbDsl.createNetworkingPlatform('3', {adminIds: ['3'], name: 'Elyoos3', description: 'description3', link: 'www.link3.org'});

            dbDsl.createCategory(16);

            dbDsl.mapNetworkingPlatformToCategory('1', {categoryIds: ['1', '6', '7']});
            dbDsl.mapNetworkingPlatformToCategory('2', {categoryIds: ['10', '11']});
            dbDsl.mapNetworkingPlatformToCategory('3', {categoryIds: ['13', '14', '15']});

            dbDsl.createOrganization('1', {networkingPlatformId: '2', adminIds: ['2'], created: 500});
            dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1', '3'], created: 502});

            dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '1', lastConfigUpdate: 600, categories: ['1', '6']});
            dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '2', lastConfigUpdate: 601, categories: ['11']});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Activate export (No Export exists and NP automatically accepts Org)', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '2', org: {categories: ['10']}, events: {exportActive: false}},
                        {platformId: '3', org: {categories: ['14', '15']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '2'})-[export:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`org, exportedNP.platformId AS platformId, export.created AS created`)
                .orderBy(`exportedNP.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(2);
            nps[0].platformId.should.equals('2');
            nps[0].created.should.at.least(startTime);
            nps[0].org.lastConfigUpdate.should.at.least(startTime);
            nps[1].platformId.should.equals('3');
            nps[1].created.should.at.least(startTime);
            nps[1].org.lastConfigUpdate.should.at.least(startTime);

            return db.cypher().match(`(:Organization {organizationId: '2'})-[:ASSIGNED]->(assigner:CategoryAssigner)
                                      -[:ASSIGNED]->(np:NetworkingPlatform)`)
                .with(`assigner, np`)
                .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
                .with(`np, assigner, category`)
                .orderBy(`category.categoryId`)
                .return(`np.platformId AS platformId, assigner.lastConfigUpdate AS lastConfigUpdate,
                 collect(category.categoryId) AS categories`)
                .orderBy(`np.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(3);
            nps[0].platformId.should.equals('1');
            nps[0].lastConfigUpdate.should.equals(600);
            nps[0].categories.length.should.equals(2);
            nps[0].categories[0].should.equals('1');
            nps[0].categories[1].should.equals('6');
            nps[1].platformId.should.equals('2');
            nps[1].lastConfigUpdate.should.at.least(startTime);
            nps[1].categories.length.should.equals(1);
            nps[1].categories[0].should.equals('10');
            nps[2].platformId.should.equals('3');
            nps[2].lastConfigUpdate.should.at.least(startTime);
            nps[2].categories.length.should.equals(2);
            nps[2].categories[0].should.equals('14');
            nps[2].categories[1].should.equals('15');
        });
    });

    it('Activate export (Export exists and NP automatically accepts Org)', function () {

        dbDsl.exportOrgToNp({organizationId: '2', npId: '3', created: 600});
        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '2', org: { categories: ['10']}, events: {exportActive: false}},
                        {platformId: '3', org: { categories: ['14', '15']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(:Organization {organizationId: '2'})-[export:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`exportedNP.platformId AS platformId, export.created AS created`)
                .orderBy(`exportedNP.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(2);
            nps[0].platformId.should.equals('2');
            nps[0].created.should.at.least(startTime);
            nps[1].platformId.should.equals('3');
            nps[1].created.should.equals(600);

            return db.cypher().match(`(:Organization {organizationId: '2'})-[:ASSIGNED]->(assigner:CategoryAssigner)
                                      -[:ASSIGNED]->(np:NetworkingPlatform)`)
                .with(`assigner, np`)
                .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
                .with(`np, category`)
                .orderBy(`category.categoryId`)
                .return(`np.platformId AS platformId, collect(category.categoryId) AS categories`)
                .orderBy(`np.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(3);
            nps[0].platformId.should.equals('1');
            nps[0].categories.length.should.equals(2);
            nps[0].categories[0].should.equals('1');
            nps[0].categories[1].should.equals('6');
            nps[1].platformId.should.equals('2');
            nps[1].categories.length.should.equals(1);
            nps[1].categories[0].should.equals('10');
            nps[2].platformId.should.equals('3');
            nps[2].categories.length.should.equals(2);
            nps[2].categories[0].should.equals('14');
            nps[2].categories[1].should.equals('15');
        });
    });

    it('Activate export. Only accept categories of corresponding networking platform', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '2', org: {categories: ['15']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(400);
            return db.cypher().match("(:Organization {organizationId: '2'})-[:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`exportedNP.platformId AS platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(0);

            return db.cypher().match(`(:Organization {organizationId: '2'})-[:ASSIGNED]->(assigner:CategoryAssigner)
                                      -[:ASSIGNED]->(np:NetworkingPlatform)`)
                .with(`assigner, np`)
                .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
                .with(`np, category`)
                .orderBy(`category.categoryId`)
                .return(`np.platformId AS platformId, collect(category.categoryId) AS categories`)
                .orderBy(`np.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(2);
            nps[0].platformId.should.equals('1');
            nps[0].categories.length.should.equals(2);
            nps[0].categories[0].should.equals('1');
            nps[0].categories[1].should.equals('6');
            nps[1].platformId.should.equals('2');
            nps[1].categories.length.should.equals(1);
            nps[1].categories[0].should.equals('11');
        });
    });

    it('Activate export with no change of previous categories', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '3', lastConfigUpdate: 601, categories: ['14', '15']});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '3', org: {categories: ['15', '14']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '2'})-[export:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`org, exportedNP.platformId AS platformId, export.created AS created`)
                .orderBy(`exportedNP.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
            nps[0].platformId.should.equals('3');
            nps[0].created.should.at.least(startTime);
            nps[0].org.lastConfigUpdate.should.at.least(startTime);

            return db.cypher().match(`(:Organization {organizationId: '2'})-[:ASSIGNED]->(assigner:CategoryAssigner)
                                      -[:ASSIGNED]->(np:NetworkingPlatform)`)
                .with(`assigner, np`)
                .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
                .with(`np, assigner, category`)
                .orderBy(`category.categoryId`)
                .return(`np.platformId AS platformId, assigner.lastConfigUpdate AS lastConfigUpdate,
                 collect(category.categoryId) AS categories`)
                .orderBy(`np.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(2);
            nps[0].platformId.should.equals('1');
            nps[0].lastConfigUpdate.should.equals(600);
            nps[0].categories.length.should.equals(2);
            nps[0].categories[0].should.equals('1');
            nps[0].categories[1].should.equals('6');
            nps[1].platformId.should.equals('3');
            nps[1].lastConfigUpdate.should.equals(601);
            nps[1].categories.length.should.equals(2);
            nps[1].categories[0].should.equals('14');
            nps[1].categories[1].should.equals('15');
        });
    });

    it('Activate export organization with DELETE_REQUEST relationship', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '3', lastConfigUpdate: 601, categories: ['14', '15']});
        dbDsl.exportDeleteRequestToNp({organizationId: '2', npId: '3', lastExportTimestamp: 5000, idOnExportedNp: '555', created: 621});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '3', org: {categories: ['15', '14']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '2'})-[export:EXPORT]->(exportedNP:NetworkingPlatform)")
                .optionalMatch(`(org)-[deleteExport:DELETE_REQUEST]->(exportedNP)`)
                .return(`org, exportedNP.platformId AS platformId, export, deleteExport`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
            nps[0].platformId.should.equals('3');
            nps[0].export.created.should.at.least(startTime);
            nps[0].export.lastExportTimestamp.should.equals(5000);
            nps[0].export.id.should.equals('555');
            should.not.exist(nps[0].deleteExport);
        });
    });

    it('Activate export organization with DELETE_REQUEST_SUCCESS relationship', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});
        dbDsl.assignOrganizationToCategory({organizationId: '2', npId: '3', lastConfigUpdate: 601, categories: ['14', '15']});
        dbDsl.exportDeleteSuccessToNp({organizationId: '2', npId: '3', created: 621});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '3', org: {categories: ['15', '14']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '2'})-[export:EXPORT]->(exportedNP:NetworkingPlatform)")
                .optionalMatch(`(org)-[deleteExport:DELETE_REQUEST_SUCCESS]->(exportedNP)`)
                .return(`exportedNP.platformId AS platformId, export, deleteExport`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
            nps[0].platformId.should.equals('3');
            nps[0].export.created.should.at.least(startTime);
            should.not.exist(nps[0].export.lastExportTimestamp);
            should.not.exist(nps[0].export.id);
            should.not.exist(nps[0].deleteExport);
        });
    });

    it('Activate/Deactivate export (Export exists for other NP, requested NP only manually accepts Org)', function () {

        dbDsl.exportOrgToNp({organizationId: '2', npId: '3'});
        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: true});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '2', org: {categories: ['10']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(:Organization {organizationId: '2'})-[:EXPORT]->(exportedNP:NetworkingPlatform)")
                .return(`exportedNP.platformId AS platformId`).end().send();
        }).then(function (nps) {
            nps.length.should.equals(0);
            return db.cypher().match("(org:Organization {organizationId: '2'})-[export:EXPORT_REQUEST]->(exportedNP:NetworkingPlatform)")
                .return(`org, exportedNP.platformId AS platformId, export.created AS created`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
            nps[0].platformId.should.equals('2');
            nps[0].created.should.at.least(startTime);
            nps[0].org.lastConfigUpdate.should.at.least(startTime);

            return db.cypher().match(`(:Organization {organizationId: '2'})-[:ASSIGNED]->(assigner:CategoryAssigner)
                                      -[:ASSIGNED]->(np:NetworkingPlatform)`)
                .with(`assigner, np`)
                .match(`(assigner)-[:ASSIGNED]->(category:Category)`)
                .with(`np, category`)
                .orderBy(`category.categoryId`)
                .return(`np.platformId AS platformId, collect(category.categoryId) AS categories`)
                .orderBy(`np.platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(2);
            nps[0].platformId.should.equals('1');
            nps[0].categories.length.should.equals(2);
            nps[0].categories[0].should.equals('1');
            nps[0].categories[1].should.equals('6');
            nps[1].platformId.should.equals('2');
            nps[1].categories.length.should.equals(1);
            nps[1].categories[0].should.equals('10');
        });
    });

    it('Deactivate export (EXPORT relationship)', function () {

        dbDsl.exportOrgToNp({organizationId: '2', npId: '2'});
        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: []
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(:Organization {organizationId: '2'})-[]->(exportedNP:NetworkingPlatform)")
                .return(`exportedNP.platformId AS platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(0);
        });
    });

    it('Deactivate already exported organization (EXPORT relationship)', function () {

        dbDsl.exportOrgToNp({organizationId: '2', npId: '2', idOnExportedNp: '555', lastExportTimestamp: 5000});
        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: []
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(:Organization {organizationId: '2'})-[request:DELETE_REQUEST]->(exportedNP:NetworkingPlatform)")
                .return(`request`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(1);
            nps[0].request.lastExportTimestamp.should.equals(5000);
            nps[0].request.id.should.equals('555');
            nps[0].request.created.should.equals(500);
        });
    });

    it('Deactivate export (EXPORT_REQUEST relationship)', function () {

        dbDsl.exportRequestOrgToNp({organizationId: '2', npId: '2'});
        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: []
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(:Organization {organizationId: '2'})-[]->(exportedNP:NetworkingPlatform)")
                .return(`exportedNP.platformId AS platformId`)
                .end().send();
        }).then(function (nps) {
            nps.length.should.equals(0);
        });
    });

    it('Not allowed to set EXPORT relationship to networking platform which created organization', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '1', org: {categories: ['7']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });

    it('At least one category is required', function () {

        dbDsl.createNetworkingPlatformExportRules('2', {manuallyAcceptOrganization: false});
        dbDsl.createNetworkingPlatformExportRules('3', {manuallyAcceptOrganization: false});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '2', nps: [
                        {platformId: '2', org: {categories: []}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });

    it('Only allow to save export config of administrated organizations', function () {
        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/export',
                {
                    organizationId: '1', nps: [
                        {platformId: '1', org: {categories: ['1']}, events: {exportActive: false}}]
                });
        }).then(function (res) {
            res.status.should.equal(400);
        });
    });
});