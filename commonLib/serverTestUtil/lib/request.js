'use strict';

let request = require('supertest');
let bluebird = require('bluebird');
bluebird.promisifyAll(request);

let lastUser = [], cookies, app;

module.exports = {
    setApplication: function (newApp) {
        app = newApp;
    },
    login: function (user) {
        return request(app).post('/public/api/login')
            .send(user).then(function (res) {
                cookies = res.headers['set-cookie'].pop().split(';')[0];
                lastUser.push({user: user, cookies: cookies});
            });
    },
    logout: function () {
        let user = lastUser.pop();
        if (user) {
            if (lastUser.length > 0) {
                cookies = lastUser[lastUser.length - 1].cookies;
            } else {
                cookies = null;
            }
            return request(app).post('/api/logout').send(user.user);
        }
    },
    post: function (api, data) {
        let req = request(app).post(api);
        if (cookies) {
            req.cookies = cookies;
        }
        return req.send(data);
    },
    put: function (api, data) {
        let req = request(app).put(api);
        if (cookies) {
            req.cookies = cookies;
        }
        return req.send(data);
    },
    delete: function (api, data) {
        let req = request(app).del(api);
        if (cookies) {
            req.cookies = cookies;
        }
        return req.send(data);
    },
    get: function (api, data) {
        let req = request(app).get(api);
        if (cookies) {
            req.cookies = cookies;
        }
        if (data) {
            req.query(data);
        }
        return req.send();

    }
};