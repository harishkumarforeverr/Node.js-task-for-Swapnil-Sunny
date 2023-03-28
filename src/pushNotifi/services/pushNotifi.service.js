let pushResponse = require("../responses/push.response");
let PushModel = new (require("../models/pushNotifi.model"))();
const db = require('../../../common/db');
const reader = require('xlsx');
let path = require("path");
const mkdirp = require('mkdirp');
const csv = require('csvtojson');

module.exports = class PushService {

    constructor() {
        //
    }

    async createPushNotifi(data) {
        let returResult;
        let error = {};
        let users = await db.getDB().collection('pushNotification');
            data.timestamp = new Date();
            let push = await PushModel.createPushNotifi(data);
            returResult = pushResponse.success('push_created', push);
        // }
        return returResult;
    }

}
