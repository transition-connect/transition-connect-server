'use strict';

let dbDsl = require('server-test-util').dbDSL;
let db = require('server-test-util').db;
let admin = require('server-test-util').admin;
let requestHandler = require('server-test-util').requestHandler;
let should = require('chai').should();
let nock = require('nock');

describe('Integration Tests for setting the url to import events from a website', function () {

    beforeEach(function () {
        return dbDsl.init().then(function () {
            dbDsl.createAdmin('1', {email: 'user@irgendwo.ch'});
            dbDsl.createAdmin('2', {email: 'user2@irgendwo.ch'});

            dbDsl.createNetworkingPlatform('1', {adminIds: ['1'], name: 'Elyoos', description: 'description', link: 'www.link.org'});

            dbDsl.createOrganization('1', {networkingPlatformId: '1', adminIds: ['2'], created: 500});
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Setting an url and test if import is working', function () {

        nock(`http://www.test.ch`).get('/')
            .reply(200,
                `BEGIN:VCALENDAR
                PRODID:-//Google Inc//Google Calendar 70.9054//EN
                VERSION:2.0
                CALSCALE:GREGORIAN
                METHOD:PUBLISH
                X-WR-CALNAME:test@gmail.com
                X-WR-TIMEZONE:Europe/Zurich
                BEGIN:VEVENT
                DTSTART:20171027T073000Z
                DTEND:20171027T083000Z
                DTSTAMP:20171026T125619Z
                UID:0c6ckli6gauhsp76ju1vl065dd@google.com
                CREATED:20171025T150112Z
                DESCRIPTION: Hat was mit TC zu tun
                LAST-MODIFIED:20171025T150112Z
                LOCATION:Irgendwo in Zürich
                SEQUENCE:0
                STATUS:CONFIRMED
                SUMMARY:Event1 Test
                TRANSP:OPAQUE
                END:VEVENT
                END:VCALENDAR`
            );

        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'], created: 502});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/websiteEventImport',
                {
                    organizationId: '2',
                    url: 'http://www.test.ch'
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '2'})")
                .return(`org.eventsImportConfiguration AS eventsImportConfiguration`).end().send();
        }).then(function (org) {
            org.length.should.equals(1);
            org[0].eventsImportConfiguration.should.equals('http://www.test.ch');
        });
    });

    it('Deactivate import by sending an empty url', function () {

        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'], created: 502});
        dbDsl.createEventExportRule('2', {npId: '1'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/websiteEventImport',
                {
                    organizationId: '2',
                    url: '  '
                });
        }).then(function (res) {
            res.status.should.equal(200);
            return db.cypher().match("(org:Organization {organizationId: '2'})")
                .return(`org.eventsImportConfiguration AS eventsImportConfiguration`).end().send();
        }).then(function (org) {
            org.length.should.equals(1);
            should.not.exist(org[0].eventsImportConfiguration);
            return db.cypher().match(`(org:Organization {organizationId: '2'})-[:EVENT_RULE]->(rule:EventRule)
                                      -[:EVENT_RULE_FOR]->(exportedNP:NetworkingPlatform {platformId: '1'})`)
                .return(`org`).end().send();
        }).then(function (org) {
            org.length.should.equals(0);
        });
    });

    it('Setting an url fails because response has no ical data', function () {

        nock(`http://www.test.ch`).get('/')
            .reply(200,
                `Irgend ein Text`
            );

        dbDsl.createOrganization('2', {networkingPlatformId: '1', adminIds: ['1'], created: 502});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(admin.validAdmin);
        }).then(function () {
            return requestHandler.put('/admin/api/organization/config/websiteEventImport',
                {
                    organizationId: '2',
                    url: 'http://www.test.ch'
                });
        }).then(function (res) {
            res.status.should.equal(400);
            res.body.errorCode.should.equals(1);
            return db.cypher().match("(org:Organization {organizationId: '2'})")
                .return(`org.eventsImportConfiguration AS eventsImportConfiguration`).end().send();
        }).then(function (org) {
            org.length.should.equals(1);
            should.not.exist(org[0].eventsImportConfiguration);
        });
    });
});