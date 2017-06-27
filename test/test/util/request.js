'use strict';

let request = require('supertest');
let bluebird = require('bluebird');
bluebird.promisifyAll(request);

let app;

module.exports = {
    setApplication: function (newApp) {
        app = newApp;
    },
    post: function (api, data) {
        return request(app).post(api).send(data);
    },
    put: function (api, data) {
        return request(app).put(api).send(data);
    },
    delete: function (api, data) {
        return request(app).del(api).send(data);
    },
    get: function (api, data) {
        let req = request(app).get(api);
        if (data) {
            req.query(data);
        }
        return req.send();

    }
};