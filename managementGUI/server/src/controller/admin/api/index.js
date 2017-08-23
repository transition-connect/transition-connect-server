'use strict';

let auth = requireLib('auth');
let admin = requireModel('admin/admin');
let logger = require('server-lib').logging.getLogger(__filename);

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return admin.getDashboard(req.user.id, req).then(function (overview) {
            logger.info("Get admin dashboard", req);
            res.status(200).json(overview);
        }).catch(function (err) {
            logger.error('Error when getting admin dashboard', req, {error: err});
            res.status(500).end();
        });
    });
};
