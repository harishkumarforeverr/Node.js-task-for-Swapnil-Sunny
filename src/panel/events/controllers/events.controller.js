"use strict";
let Validator = require('validatorjs');
let eventsService = new (require('../services/events.service'))();
let eventsValidator = new (require('../validators/events.validator'))();
let eventsFormatter = new (require('../formatters/events.formatter'))();
let eventsResponse = require("../responses/events.response");
let path = require("path");

module.exports = class EventsController {
    constuctor() {
        //
    }

    async getEvents(req, res) {
        let returnResponse = {};
        let _data = eventsFormatter.getEvents(req);
        let rules = eventsValidator.getEvents();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await eventsService.getEvents(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = eventsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getAllEventsCount(req, res) {
        let returnResponse = {};
        let _data = eventsFormatter.getAllEventsCount(req);
        let rules = eventsValidator.getAllEventsCount();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await eventsService.getAllEventsCount(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = eventsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getEventAnalysis(req, res) {
        let returnResponse = {};
        let _data = eventsFormatter.getEventAnalysis(req);
        let rules = eventsValidator.getEventAnalysis();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await eventsService.getEventAnalysis(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = eventsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

}