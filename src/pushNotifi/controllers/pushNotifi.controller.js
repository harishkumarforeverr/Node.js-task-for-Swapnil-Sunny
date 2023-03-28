"use strict";
let Validator = require('validatorjs');
let PushService = new (require('../services/pushNotifi.service'))();
let PushValidator = new (require('../validators/pushNotifi.validator'))();
let PushFormatter = new (require('../formatters/pushNotifi.formatter'))();
let PushResponse = require("../responses/push.response");
let path = require("path");

module.exports = class PushController {
    constuctor() {
        //
    }

    async createPushNotifi(req, res) {
        let returnResponse = {};
        let _data = PushFormatter.createPushNotifi(req);
        let rules = PushValidator.createPushNotifi();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await PushService.createPushNotifi(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = PushResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

}