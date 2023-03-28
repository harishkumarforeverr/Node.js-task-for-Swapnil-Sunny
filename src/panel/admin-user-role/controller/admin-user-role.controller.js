/* eslint-disable no-unused-vars */
"use strict";
let Validator = require('validatorjs');
let userroleService = new (require('../services/admin-user-role.service'))();
let userroleValidator = new (require('../validators/admin-user-role.validator'))();
let userroleFormatter = new (require('../formatter/admin-user-role.formatter'))();
let userroleResponse = require("../responses/admin-user-role.response");


module.exports = class userRoleController {
    constuctor() {
        //
    }

    async createRole(req, res, next) {
        let returnResponse = {};
        let _data = userroleFormatter.createRole(req);
        if(_data.role_name && _data.role_name == 'Super Admin') {
            returnResponse = {
                status: false,
                nameError: "Role Name cannot be Super Admin"
            }
            res.status(400);
            return res.json(returnResponse);
        }
        let rules = userroleValidator.createRole(_data);
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let usersresult;
            let result = await userroleService.createRole(_data);
            returnResponse = result;
            if (usersresult) {
                returnResponse = {
                    ...returnResponse,
                    users: usersresult
                }
            }
        } else {
            returnResponse = userroleResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }



    async getAdminuser(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.getAdminuser(req);
        // let rules = userroleValidator.getAdminuser();
        // let validation = new Validator(_data, rules);
        let result = await userroleService.getAdminuser(_data);
        returnResponse = result;
        return res.json(returnResponse);
    }


    async getRoleById(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.getRoleById(req);
        let rules = userroleValidator.getRoleById();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userroleService.getRoleById(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }

        } else {
            returnResponse = userroleResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async editRole(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.editRole(req);
        if(_data.role_name && _data.role_name == 'Super Admin') {
            returnResponse = {
                status: false,
                nameError: "Role Name cannot be Super Admin"
            }
            res.status(400);
            return res.json(returnResponse);
        }
        let rules = userroleValidator.editRole();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userroleService.editRole(_data);
            returnResponse = result;
            if (returnResponse.status) {
                returnResponse.message = 'Role Edited Successfully';
                res.status(200);
            } else {
                res.status(400);
            }

        } else {
            returnResponse = userroleResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getmastermodule(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.getmastermodule(req);
        // let rules = userroleValidator.getmastermodule();
        // let validation = new Validator(_data, rules);
        let result = await userroleService.getmastermodule(_data);
        returnResponse = result;
        return res.json(returnResponse);

    }

    async getBaseRoutes(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.getBaseRoutes(req);
        // let rules = userroleValidator.getBaseRoutes();
        // let validation = new Validator(_data, rules);
        let result = await userroleService.getBaseRoutes(_data);
        returnResponse = result;
        return res.json(returnResponse);
    }

    async getMasterRoutes(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.getMasterRoutes(req);
        // let rules = userroleValidator.getMasterRoutes();
        // let validation = new Validator(_data, rules);
        let result = await userroleService.getMasterRoutes(_data);
        returnResponse = result;
        return res.json(returnResponse);
    }
    
    async editBaseRoutes(req, res) {
        let returnResponse = {};
        let _data = userroleFormatter.editBaseRoutes(req);
        let rules = userroleValidator.editBaseRoutes();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userroleService.editBaseRoutes(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        }
        else {
            returnResponse = userroleResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async setPrivilege(req, res, next) {
        let returnResponse = {};
        let _data = userroleFormatter.setPrivilege(req,req.body);
        let rules = userroleValidator.setPrivilege(_data);
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userroleService.setPrivilege(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                res.status(400);
            }
        } else {
            returnResponse = userroleResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);

    }

}