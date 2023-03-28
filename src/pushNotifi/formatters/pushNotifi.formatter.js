"use strict";

module.exports = class PushFormatter {
    createPushNotifi(req){
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        req.body.clientIp = clientIp;
        req.body.app_key = req.app_key;
        return req.body;
    }
}