'use strict';
const db = require('../../../common/db');

module.exports = class PushModel {

    async createPushNotifi(data) {
        return db.getDB().collection('pushNotification').insertOne(data);
    }
   
}