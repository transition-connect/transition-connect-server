'use strict';

let getDomain = function () {
    let domain = 'http://localhost:8086/';

    if (process.env.NODE_ENV === 'production') {
        domain = 'https://www.transition-connect.org/';
    }
    return domain;
};

let getEMailSenderAddress = function () {
    let address = 'info@localhost.localdomain';

    if (process.env.NODE_ENV === 'production') {
        address = 'info@transition-connect.org/';
    }
    return address;
};

module.exports = {
    getDomain: getDomain,
    getEMailSenderAddress: getEMailSenderAddress
};
