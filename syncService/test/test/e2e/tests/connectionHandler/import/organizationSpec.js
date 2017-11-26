'use strict';

let connectionHandler = requireConnectionHandler('connectionHandler');
let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let moment = require('moment');
let nock = require('nock');

describe('Testing the import of organizations from external networking platform', function () {

    let startTime;

    //Error testing
    //Imported category existing in tc

    beforeEach(async function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        await dbDsl.init();
        dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
        dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

        dbDsl.createNetworkingPlatform('1', {adminIds: ['1']});
        dbDsl.createNetworkingPlatform('2', {adminIds: ['2']});
        dbDsl.createNetworkingPlatformAdapterConfig('1', {adapterType: 'standardNp', npApiUrl: 'https://localhost.org'});
        dbDsl.createNetworkingPlatformAdapterConfig('2', {
            adapterType: 'standardNp', npApiUrl: 'https://localhost2.org', lastSync: 700
        });

        dbDsl.createCategory(6);

        dbDsl.mapNetworkingPlatformToCategory('1', {npId: '1', usedCategoryId: '0'});
        dbDsl.mapNetworkingPlatformToCategory('2', {npId: '1', usedCategoryId: '1'});
        dbDsl.mapNetworkingPlatformToCategory('3', {npId: '1', usedCategoryId: '2'});
        dbDsl.mapNetworkingPlatformToCategory('4', {npId: '1', usedCategoryId: '3'});
        dbDsl.mapNetworkingPlatformToCategory('5', {npId: '2', usedCategoryId: '4'});
        dbDsl.mapNetworkingPlatformToCategory('6', {npId: '2', usedCategoryId: '5'});
    });

    afterEach(function () {
        nock.cleanAll();
    });

    it('Import new organizations with only mandatory fields', async function () {

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {
                organizations: [{id: '1', timestamp: 500}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 1})
            .reply(200, {
                organizations: []
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation/1')
            .reply(200, {
                name: 'organization1', description: 'description',
                categories: ['idOnPlatform1', 'idOnPlatform2'], admins: ['usER2@irgendwo.ch', 'user3@irgendwo.ch']
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {
                organizations: []
            });

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]-(admin:Admin)")
            .with(`np, org, admin`).orderBy(`admin.email`)
            .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
            .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
            .with(`np, org, collect(admin.email) AS admins, category`).orderBy(`category.categoryId`)
            .return(`np, org, admins, collect(category.categoryId) AS categories`)
            .orderBy(`np.platformId, org.organizationIdOnExternalNP`).end().send();

        resp.length.should.equals(1);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].org.organizationId.should.exist;
        resp[0].org.name.should.equals('organization1');
        resp[0].org.description.should.equals('description');
        resp[0].org.slogan.should.equals('');
        resp[0].org.website.should.equals('');
        resp[0].org.modifiedOnNp.should.equals(500);
        resp[0].org.created.should.at.least(startTime);
        resp[0].org.modified.should.at.least(startTime);
        resp[0].admins.length.should.equals(2);
        resp[0].admins[0].should.equals('user2@irgendwo.ch');
        resp[0].admins[1].should.equals('user3@irgendwo.ch');
        resp[0].categories.length.should.equals(2);
        resp[0].categories[0].should.equals('1');
        resp[0].categories[1].should.equals('2');
    });

    it('Import new organizations', async function () {

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {
                organizations: [{id: '1', timestamp: 500}, {id: '2', timestamp: 501}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 2})
            .reply(200, {
                organizations: []
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation/1')
            .reply(200, {
                name: 'organization1', description: 'description', slogan: 'slogan', website: 'www.link.org',
                categories: ['idOnPlatform1', 'idOnPlatform2'], admins: ['usER2@irgendwo.ch', 'user3@irgendwo.ch'],
                locations: [{
                    address: 'address', description: 'descriptionLocation',
                    geo: {latitude: 32.422422, longitude: -122.08585}
                }, {
                    address: 'address2', description: 'descriptionLocation2',
                    geo: {latitude: 32.422423, longitude: -122.08586}
                }]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation/2')
            .reply(200, {
                name: 'organization2', description: 'description2', slogan: 'slogan2', website: 'www.link2.org',
                categories: ['idOnPlatform3'], admins: ['user@irgendwo.ch']
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {
                organizations: [{id: '1', timestamp: 600}]
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organizations: []});

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation/1')
            .reply(200, {
                name: 'organization3', description: 'description3', slogan: 'slogan3', website: 'www.link3.org',
                categories: ['idOnPlatform4'], admins: ['user2@irgendwo.ch']
            });

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]-(admin:Admin)")
            .with(`np, org, admin`).orderBy(`admin.email`)
            .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
            .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
            .with(`np, org, collect(admin.email) AS admins, category`).orderBy(`category.categoryId`)
            .optionalMatch(`(org)-[:HAS]->(location:Location)`)
            .with(`np, org, admins, category, location`).orderBy(`location.address`)
            .return(`np, org, admins, collect(DISTINCT category.categoryId) AS categories, collect(DISTINCT location) AS locations`)
            .orderBy(`np.platformId, org.organizationIdOnExternalNP`).end().send();

        resp.length.should.equals(3);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].org.organizationId.should.exist;
        resp[0].org.name.should.equals('organization1');
        resp[0].org.description.should.equals('description');
        resp[0].org.slogan.should.equals('slogan');
        resp[0].org.website.should.equals('www.link.org');
        resp[0].org.modifiedOnNp.should.equals(500);
        resp[0].org.created.should.at.least(startTime);
        resp[0].org.modified.should.at.least(startTime);
        resp[0].admins.length.should.equals(2);
        resp[0].admins[0].should.equals('user2@irgendwo.ch');
        resp[0].admins[1].should.equals('user3@irgendwo.ch');
        resp[0].categories.length.should.equals(2);
        resp[0].categories[0].should.equals('1');
        resp[0].categories[1].should.equals('2');
        resp[0].locations.length.should.equals(2);
        resp[0].locations[0].address.should.equals('address');
        resp[0].locations[0].description.should.equals('descriptionLocation');
        resp[0].locations[0].latitude.should.equals(32.422422);
        resp[0].locations[0].longitude.should.equals(-122.08585);
        resp[0].locations[1].address.should.equals('address2');
        resp[0].locations[1].description.should.equals('descriptionLocation2');
        resp[0].locations[1].latitude.should.equals(32.422423);
        resp[0].locations[1].longitude.should.equals(-122.08586);

        resp[1].np.platformId.should.equals('1');
        resp[1].org.organizationIdOnExternalNP.should.equals('2');
        resp[1].org.organizationId.should.exist;
        resp[1].org.name.should.equals('organization2');
        resp[1].org.description.should.equals('description2');
        resp[1].org.slogan.should.equals('slogan2');
        resp[1].org.website.should.equals('www.link2.org');
        resp[1].org.modifiedOnNp.should.equals(501);
        resp[1].org.created.should.at.least(startTime);
        resp[1].org.modified.should.at.least(startTime);
        resp[1].admins.length.should.equals(1);
        resp[1].admins[0].should.equals('user@irgendwo.ch');
        resp[1].categories.length.should.equals(1);
        resp[1].categories[0].should.equals('3');
        resp[1].locations.length.should.equals(0);

        resp[2].np.platformId.should.equals('2');
        resp[2].org.organizationIdOnExternalNP.should.equals('1');
        resp[2].org.organizationId.should.exist;
        resp[2].org.name.should.equals('organization3');
        resp[2].org.description.should.equals('description3');
        resp[2].org.slogan.should.equals('slogan3');
        resp[2].org.website.should.equals('www.link3.org');
        resp[2].org.modifiedOnNp.should.equals(600);
        resp[2].org.created.should.at.least(startTime);
        resp[2].org.modified.should.at.least(startTime);
        resp[2].admins.length.should.equals(1);
        resp[2].admins[0].should.equals('user2@irgendwo.ch');
        resp[2].categories.length.should.equals(1);
        resp[2].categories[0].should.equals('4');
        resp[2].locations.length.should.equals(0);
    });

    it('Handling load of next organizations', async function () {

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {
                organizations: [{id: '1', timestamp: 500}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 1})
            .reply(200, {
                organizations: [{id: '2', timestamp: 501}]
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 2})
            .reply(200, {organizations: []});

        nock(`https://localhost.org`)
            .get('/api/v1/organisation/1')
            .reply(200, {
                name: 'organization1', description: 'description', slogan: 'slogan', website: 'www.link.org',
                categories: ['idOnPlatform1', 'idOnPlatform2'], admins: ['usER2@irgendwo.ch', 'user3@irgendwo.ch']
            });

        nock(`https://localhost.org`)
            .get('/api/v1/organisation/2')
            .reply(200, {
                name: 'organization2', description: 'description2', slogan: 'slogan2', website: 'www.link2.org',
                categories: ['idOnPlatform3'], admins: ['user@irgendwo.ch']
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]-(admin:Admin)")
            .with(`np, org, admin`).orderBy(`admin.email`)
            .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
            .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
            .with(`np, org, collect(admin.email) AS admins, category`).orderBy(`category.categoryId`)
            .return(`np, org, admins, collect(category.categoryId) AS categories`)
            .orderBy(`np.platformId, org.organizationIdOnExternalNP`).end().send();

        resp.length.should.equals(2);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].org.organizationId.should.exist;
        resp[0].org.name.should.equals('organization1');
        resp[0].org.description.should.equals('description');
        resp[0].org.slogan.should.equals('slogan');
        resp[0].org.website.should.equals('www.link.org');
        resp[0].org.modifiedOnNp.should.equals(500);
        resp[0].org.created.should.at.least(startTime);
        resp[0].org.modified.should.at.least(startTime);
        resp[0].admins.length.should.equals(2);
        resp[0].admins[0].should.equals('user2@irgendwo.ch');
        resp[0].admins[1].should.equals('user3@irgendwo.ch');
        resp[0].categories.length.should.equals(2);
        resp[0].categories[0].should.equals('1');
        resp[0].categories[1].should.equals('2');

        resp[1].np.platformId.should.equals('1');
        resp[1].org.organizationIdOnExternalNP.should.equals('2');
        resp[1].org.organizationId.should.exist;
        resp[1].org.name.should.equals('organization2');
        resp[1].org.description.should.equals('description2');
        resp[1].org.slogan.should.equals('slogan2');
        resp[1].org.website.should.equals('www.link2.org');
        resp[1].org.modifiedOnNp.should.equals(501);
        resp[1].org.created.should.at.least(startTime);
        resp[1].org.modified.should.at.least(startTime);
        resp[1].admins.length.should.equals(1);
        resp[1].admins[0].should.equals('user@irgendwo.ch');
        resp[1].categories.length.should.equals(1);
        resp[1].categories[0].should.equals('3');
    });

    it('Import modified organization', async function () {

        dbDsl.createOrganization('10', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500, modifiedOnNp: 700,
            organizationIdOnExternalNP: '1', name: 'organization1', description: 'description1', slogan: 'slogan1',
            website: 'www.link.org1'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '10', npId: '1', categories: ['1', '2']});

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: [{id: '1', timestamp: 701}]});

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organizations: []});

        nock(`https://localhost.org`)
            .get('/api/v1/organisation/1')
            .reply(200, {
                name: 'organization', description: 'description', slogan: 'slogan', website: 'www.link.org',
                categories: ['idOnPlatform3', 'idOnPlatform4'], admins: ['usER2@irgendwo.ch', 'user3@irgendwo.ch']
            });

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]-(admin:Admin)")
            .with(`np, org, admin`).orderBy(`admin.email`)
            .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
            .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
            .with(`np, org, collect(admin.email) AS admins, category`).orderBy(`category.categoryId`)
            .return(`np, org, admins, collect(category.categoryId) AS categories`)
            .orderBy(`np.platformId, org.organizationIdOnExternalNP`).end().send();

        resp.length.should.equals(1);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].org.organizationId.should.equals('10');
        resp[0].org.name.should.equals('organization');
        resp[0].org.description.should.equals('description');
        resp[0].org.slogan.should.equals('slogan');
        resp[0].org.website.should.equals('www.link.org');
        resp[0].org.modifiedOnNp.should.equals(701);
        resp[0].org.created.should.equals(500);
        resp[0].org.modified.should.at.least(startTime);
        resp[0].admins.length.should.equals(1);
        resp[0].admins[0].should.equals('user2@irgendwo.ch');
        resp[0].categories.length.should.equals(2);
        resp[0].categories[0].should.equals('3');
        resp[0].categories[1].should.equals('4');
    });

    it('Do not import not modified organization', async function () {

        dbDsl.createOrganization('10', {
            networkingPlatformId: '1', adminIds: ['2'], created: 500, modifiedOnNp: 701,
            organizationIdOnExternalNP: '1', name: 'organization1', description: 'description1', slogan: 'slogan1',
            website: 'www.link.org1'
        });
        dbDsl.assignOrganizationToCategory({organizationId: '10', npId: '1', categories: ['1', '2']});

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: [{id: '1', timestamp: 701}]});

        nock(`https://localhost.org`)
            .get('/api/v1/organisation').query({skip: 1})
            .reply(200, {organizations: []});

        nock(`https://localhost2.org`)
            .get('/api/v1/organisation').query({skip: 0})
            .reply(200, {organizations: []});

        await dbDsl.sendToDb();
        await connectionHandler.startSync();
        let resp = await db.cypher().match(" (np:NetworkingPlatform)-[:CREATED]->(org:Organization)<-[:IS_ADMIN]-(admin:Admin)")
            .with(`np, org, admin`).orderBy(`admin.email`)
            .match(`(org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)`)
            .optionalMatch(`(assigner)-[:ASSIGNED]->(category:Category)`)
            .with(`np, org, collect(admin.email) AS admins, category`).orderBy(`category.categoryId`)
            .return(`np, org, admins, collect(category.categoryId) AS categories`)
            .orderBy(`np.platformId, org.organizationIdOnExternalNP`).end().send();

        resp.length.should.equals(1);
        resp[0].np.platformId.should.equals('1');
        resp[0].org.organizationIdOnExternalNP.should.equals('1');
        resp[0].org.organizationId.should.equals('10');
        resp[0].org.name.should.equals('organization1');
        resp[0].org.description.should.equals('description1');
        resp[0].org.slogan.should.equals('slogan1');
        resp[0].org.website.should.equals('www.link.org1');
        resp[0].org.modifiedOnNp.should.equals(701);
        resp[0].org.created.should.equals(500);
        resp[0].org.modified.should.at.least(500);
        resp[0].admins.length.should.equals(1);
        resp[0].admins[0].should.equals('user2@irgendwo.ch');
        resp[0].categories.length.should.equals(2);
        resp[0].categories[0].should.equals('1');
        resp[0].categories[1].should.equals('2');
    });
});
