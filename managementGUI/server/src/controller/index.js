"use strict";

module.exports = function (router) {

    router.get('/', function (req, res) {

        res.render('index', {name: 'Roger Waldvogel'});
    });
};
