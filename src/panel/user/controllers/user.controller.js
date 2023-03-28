"use strict";
let Validator = require('validatorjs');
let userService = new (require('../services/user.service'))();
let userValidator = new (require('../validators/user.validator'))();
let userFormatter = new (require('../formatters/user.formatter'))();
let userResponse = require("../responses/user.response");
let path = require("path");

module.exports = class UserController {
    constuctor() {
        //
    }

    async createUser(req, res) {
        let returnResponse = {};
        let _data = userFormatter.createUser(req);
        let rules = userValidator.createUser();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.createUser(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async modifyUser(req, res) {
        let returnResponse = {};
        let _data = userFormatter.modifyUser(req);
        let rules = userValidator.modifyUser();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.modifyUser(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getUserEvents(req, res) {
        let returnResponse = {};
        let _data = userFormatter.getUserEvents(req);
        let rules = userValidator.getUserEvents();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getUserEvents(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async usersList(req, res) {
        let returnResponse = {};
        let _data = userFormatter.usersList(req);
        let rules = userValidator.usersList();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.usersList(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getAttributeMaster(req, res) {
        let returnResponse = {};
        let _data = userFormatter.getAttributeMaster(req);
        let rules = userValidator.getAttributeMaster();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getAttributeMaster(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            }
            else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async editAttributeMaster(req, res) {
        let returnResponse = {};
        let _data = userFormatter.editAttributeMaster(req);
        let rules = userValidator.editAttributeMaster();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.editAttributeMaster(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getProfile(req, res) {
        let returnResponse = {};
        let _data = userFormatter.getProfile(req);
        let rules = userValidator.getProfile();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getProfile(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async analyseUsers(req, res) {
        let returnResponse = {};
        let _data = userFormatter.analyseUsers(req);
        let rules = userValidator.analyseUsers();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.analyseUsers(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async createUsersFromCsv(req, res) {
        let returnResponse = {};
        let _data = userFormatter.createUsersFromCsv(req);
        let rules = userValidator.createUsersFromCsv();
        let validation = new Validator(_data, rules);
        const mimetype = _data.files ? _data.files.mimetype: '';
        if (mimetype != 'text/csv') {
            returnResponse = userResponse.csv_only;
            res.status(400);
            return res.json(returnResponse);
        }
        if (validation.passes()) {
            let result = await userService.createUsersFromCsv(_data, _data.files);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async downloadrejectfile(req, res) {
        res.download(path.join(global.appRoot, "uploads/rejectfile/fail.xlsx"));
    }

}