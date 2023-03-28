"use strict";
let Validator = require('validatorjs');
let appsService = new (require('../services/apps.service'))();
let appsValidator = new (require('../validators/apps.validator'))();
let appsFormatter = new (require('../formatters/apps.formatter'))();
let appsResponse = require("../responses/apps.response");
let uploadFile = new (require("../../../../common/upload_files.js"))();

module.exports = class AppsController {

    constuctor() {
        //
    }

    async init(req, res) {
        let returnResponse = {};
        let _data = appsFormatter.init(req);
        let rules = appsValidator.init();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await appsService.init(_data);
            returnResponse = result;
        } else {
            returnResponse = appsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async checkInstallation(req,res){
        let returnResponse = {};
        let _data = appsFormatter.checkInstallation(req);
        let rules = appsValidator.checkInstallation();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await appsService.checkInstallation(_data);
            returnResponse = result;
        } else {
            returnResponse = appsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async getApps(req, res) {
        let returnResponse = {};
        let _data = appsFormatter.getApps(req);
        let rules = appsValidator.getApps();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await appsService.getApps(_data);
            returnResponse = result;
        } else {
            returnResponse = appsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }

    async createApp(req, res) {
        let returnResponse = {};
        let _data = appsFormatter.createApp(req);
        let rules = appsValidator.createApp();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let validation = new Validator(_data, rules);
            if (validation.passes()) {
                let result = await appsService.createApp(_data);
                returnResponse = result;
                if (returnResponse.status) {
                    res.status(200);
                } else {
                    res.status(400);
                }
            } else {
                returnResponse = appsResponse.form_field_required;
                returnResponse.errors = validation.errors.errors;
                res.status(400);
            }
        } else {
            returnResponse = appsResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }
    async setstatuscreateApp(req, res){
        let returnResponse = {};
        // Format request query / body / param data
        let _data = appsFormatter.setstatuscreateApp(req);

        // Setup validation
        let rules = appsValidator.setstatuscreateApp();

        // Apply validation rules
        let validation = new Validator(_data, rules);
        
       

        // check validation passes or not
            if (validation.passes()) {
                // Apply validation rules

                // check validation passes or not
                if (validation.passes()) {
                    let result = await appsService.setstatuscreateApp(_data);
                    returnResponse = result;
                    if (returnResponse.status == true) {
                        res.status(200);
                    } else {
                        res.status(400);
                    }
                } else {
                    // Getting error response message
                    returnResponse = appsResponse.form_field_required;

                    // Getting validation errors
                    returnResponse.errors = validation.errors.errors;
                    // Set status 400 Bad Request;
                    res.status(400);
                }
            } else {
                // Validation failed

                // Getting error response message
                returnResponse = appsResponse.form_field_required;

                // Getting validation errors
                returnResponse.errors = validation.errors.errors;
                // Set status 400 Bad Request;
                res.status(400);
            }

            // Send response to client
            return res.json(returnResponse);
    
    }

    async updateApp(req,res) {
        let returnResponse = {};
        // Format request query / body / param data
        let _data = appsFormatter.updateApp(req);
        // Setup validation
        let rules = appsValidator.updateApp();
        let validation = new Validator(_data, rules);
        // if (!_data.icon) {
        //     res.status(400);
        //     returnResponse = appsResponse.form_field_required;
        //     returnResponse.errors = {icon: 'The icon field is required'};
        //     return res.json(returnResponse);
        // }
        if (_data.icon) {
            const extension = _data.icon.name.split('.')[1].toLowerCase();
            if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' 
            || extension === 'svg' || extension === 'ico') {
                let fileName = 'file_' + Math.random().toString(36).slice(2) + '_' + _data.icon.name.replace(/[$&+,:;=?@#|'<>^*()%!\s-]/g, '_');
                uploadFile.uploadFile(_data.icon, 'uploads/appicon', fileName, async (err, path) => {
                _data.icon = path;

            if(validation.passes()) {
                let secondValidatorRules = appsValidator.createApp('subValidation');
                if (_data.app_types.indexOf('android') == -1) {
                    delete secondValidatorRules.app_package;
                }
                if (_data.app_types.indexOf('website') == -1) {
                    delete secondValidatorRules.website_domain;
                }
                // Apply validation rules
                let validation = new Validator(_data, secondValidatorRules);

                if(validation.passes()) {
                    let result = await appsService.updateApp(_data);

                    // set your return result to  response
                    returnResponse = result;
                    if (returnResponse.status == true) {
                        res.status(200);
                    } else {
                        res.status(400);
                    }
                }
                else {
                    // Getting error response message
                    returnResponse = appsResponse.form_field_required;

                    // Getting validation errors
                    returnResponse.errors = validation.errors.errors;
                    // Set status 400 Bad Request;
                    res.status(400);
                }
                return res.json(returnResponse);

            }
        });
    } else {
        res.status(400);
        returnResponse = appsResponse.file_format_not_valid;
        return res.json(returnResponse);
    }
    }
            else{ 
                if(validation.passes()) {
                let secondValidatorRules = appsValidator.createApp('subValidation');
                if (_data.app_types.indexOf('android') == -1) {
                    delete secondValidatorRules.app_package;
                }
                if (_data.app_types.indexOf('website') == -1) {
                    delete secondValidatorRules.website_domain;
                }
                // Apply validation rules
                let validation = new Validator(_data, secondValidatorRules);

                if(validation.passes()) {
                    let result = await appsService.updateApp(_data);

                    // set your return result to  response
                    returnResponse = result;
                    if (returnResponse.status == true) {
                        res.status(200);
                    } else {
                        res.status(400);
                    }
                }
                else {
                    // Getting error response message
                    returnResponse = appsResponse.form_field_required;

                    // Getting validation errors
                    returnResponse.errors = validation.errors.errors;
                    // Set status 400 Bad Request;
                    res.status(400);
                }
             return res.json(returnResponse);

            }

            
           
        
        // let fileName = 'file_' + Math.random().toString(36).slice(2) + '_' + _data.icon.name;
        // uploadFile.uploadFile(_data.icon, 'uploads/appicon', fileName, async (err, path) => {
        //     _data.icon = path;

            // if(validation.passes()) {
            //     let secondValidatorRules = appsValidator.createApp('subValidation');
            //     if (_data.app_types.indexOf('android') == -1) {
            //         delete secondValidatorRules.app_package;
            //     }
            //     if (_data.app_types.indexOf('website') == -1) {
            //         delete secondValidatorRules.website_domain;
            //     }
            //     // Apply validation rules
            //     let validation = new Validator(_data, secondValidatorRules);

            //     if(validation.passes()) {
            //         let result = await appsService.updateApp(_data);

            //         // set your return result to  response
            //         returnResponse = result;
            //         if (returnResponse.status == true) {
            //             res.status(200);
            //         } else {
            //             res.status(400);
            //         }
            //     }
            //     else {
            //         // Getting error response message
            //         returnResponse = appsResponse.form_field_required;

            //         // Getting validation errors
            //         returnResponse.errors = validation.errors.errors;
            //         // Set status 400 Bad Request;
            //         res.status(400);
            //     }
            // }
            // else {
            //     // Getting error response message
            //     returnResponse = appsResponse.form_field_required;

            //     // Getting validation errors
            //     returnResponse.errors = validation.errors.errors;
            //     // Set status 400 Bad Request;
            //     res.status(400);
            // }
            // return res.json(returnResponse);
        
    }
}

    async getAppDatails(req,res){
        let returnResponse = {};
        // Format request query / body / param data
        let _data = appsFormatter.getAppDatails(req);


        // Setup validation
        let rules = appsValidator.getAppDatails();

        // Apply validation rules
        let validation = new Validator(_data, rules);

        // check validation passes or not
        if (validation.passes()) {

            // Call a service and store return result
            let result = await appsService.getAppDatails(_data);

            // set your return result to  response
            returnResponse = result;
            
            if (returnResponse.status == true) {
                res.status(200);
            } else {
                res.status(400);
            }

        } else {
            // Validation failed

            // Getting error response message
            returnResponse = appsResponse.form_field_required;

            // Getting validation errors
            returnResponse.errors = validation.errors.errors;

            // Set status 400 Bad Request;
            res.status(400);
        }

        // Send response to client
        return res.json(returnResponse);
    }

}