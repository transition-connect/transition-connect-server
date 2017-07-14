'use strict';

let auth = requireLib('auth');
let admin = requireModel('admin/admin');
let logger = require('server-lib').logging.getLogger(__filename);

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {
        return admin.getOverview(req.user.id, req).then(function (overview) {
            logger.info("Get admin project overview", req);
            res.status(200).json(overview);
        }).catch(function (err) {
            logger.error('Error when getting admin project overview', req, {error: err});
            res.status(500).end();
        });
    });
};
