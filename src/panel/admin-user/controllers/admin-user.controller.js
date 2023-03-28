"use strict";
let Validator = require('validatorjs');
let userService = new (require('../services/admin-user.service'))();
let userValidator = new (require('../validators/admin-user.validator'))();
let userFormatter = new (require('../formatters/admin-user.formatter'))();
let userResponse = require("../responses/admin-user.response");
let uploadFile = new (require("../../../../common/upload_files"))();

module.exports = class UserController {
    constuctor() {
        //
    }

    async login(req, res) {
        let returnResponse = {};
        let _data = userFormatter.login(req);
        let rules = userValidator.login();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.login(_data);
            /*
            if (result.values && (result.values.two_factor_enabled === true || result.values.two_factor_enabled == 'true')) {
                let dateOne = new Date(result.values.last_otp_generated_at);
                let dateTwo = new Date();
                let msDifference =  dateTwo - dateOne;
                let minutes = Math.floor(msDifference/1000/60);
                if (dateOne && minutes < 1) {
                    returnResponse = userResponse.wait_for_new_OTP;
                } else {
                    await userService.twoFactorGenerate(result.values);
                    returnResponse = userResponse.otp_created;
                    returnResponse.status = false;
                }
                res.status(400);
                return res.json(returnResponse);
            }
            */
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

    async loginWithOTP(req,res) {
        let returnResponse = {};
        let _data = userFormatter.loginWithOTP(req);
        let rules = userValidator.loginWithOTP();
        let validation = new Validator(_data, rules);
        if (_data.ask_for_regen && _data.email && _data.password) {
            // code for otp regeneration
            let result = await userService.login(_data);
            if (result.values && (result.values.two_factor_enabled || result.values.two_factor_enabled == 'true')) {
                let dateOne = new Date(result.values.last_otp_generated_at);
                let dateTwo = new Date();
                let msDifference =  dateTwo - dateOne;
                let minutes = Math.floor(msDifference/1000/60);
                if (dateOne && minutes < 1) {
                    returnResponse = userResponse.wait_for_new_OTP;
                } else {
                    await userService.twoFactorGenerate(result.values);
                    returnResponse = userResponse.otp_created;
                    returnResponse.status = false;
                }
                res.status(400);
                return res.json(returnResponse);
            }
        }
        if (validation.passes()) {
            let result = await userService.loginWithOTP(_data);
            let dateOne = new Date(result.values.last_otp_generated_at);
            let dateTwo = new Date();
            let msDifference =  dateTwo - dateOne;
            let minutes = Math.floor(msDifference/1000/60);
            if (req.body.current_otp && (result.values.current_otp == req.body.current_otp) && (minutes < 5)) {
               returnResponse = result;
               await userService.twoFactorReset(result.values);
            } else if (req.body.current_otp && (minutes >= 5)) {
                returnResponse = userResponse.otp_expired;
                res.status(400);
                await userService.twoFactorReset(result.values);
                return res.json(returnResponse);
            } else if (req.body.current_otp && (result.values.current_otp != req.body.current_otp)) {
               returnResponse = userResponse.incorrect_otp;
               res.status(400);
               return res.json(returnResponse);
            } else {
                returnResponse = {
                    message: 'Something went wrong. Please try again later',
                    otp_generated: false,
                    status: false,
                };
                res.status(400);
                return res.json(returnResponse);
            }
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

    async editUser(req, res) {
        let returnResponse = {};
        // Format request query / body / param data
        let _data = userFormatter.editUser(req);
        if (_data.partner_name && ['null', 'undefined'].includes(_data.partner_name)) {
            _data.partner_name = null;
        }
        if (_data.partner_code && ['null', 'undefined'].includes(_data.partner_code)) {
            _data.partner_code = null;
        }
        let rules = userValidator.editUser();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            if (req.files) {
                const extension = req.files.files.name.split('.')[1].toLowerCase();
                if (['png', 'jpg', 'jpeg', 'svg', 'ico'].includes(extension)) { 
                    let fileName =  'file_' + Math.random().toString(36).slice(2) + '_' + (_data.icon.name).replace(/[$&+,:;=?@#|'<>^*()%!\s-]/g, '_');
                    let upl = new Promise((resolve,reject) => {
                        uploadFile.uploadFile(_data.icon, 'uploads/fileupload/merchant', fileName, async (err, path) => {
                            _data.icon = path;
                            if (err) {
                                reject(err);
                                console.error(err);
                            }
                            resolve({filePath: path});
                        })
                    });
                    await upl.then()
                } else {
                    // file_format_not_valid
                    res.status(400);
                    returnResponse = userResponse.file_format_not_valid;
                    return res.json(returnResponse);
                }
            }
            let result = await userService.editUser(_data);
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

    async verifyOTP(req,res) {
        let returnResponse = {};
        let _data = userFormatter.verifyOTP(req);
        let rules = userValidator.verifyOTP();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.verifyOTP(_data);
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

    async logout(req,res) {
        let returnResponse = {};
        if (!req.headers.authorization) {
            res.status(401);
            return {
                status: false,
                error: 'No authorisation token found. You maybe already logged out!',
            };
        }
        let USER_TOKEN = req.headers.authorization.split(' ')[1];
        if (req.body && req.body.email) {
            if (global.token_obj && global.token_obj[req.body.email]) {
                delete global.token_obj[req.body.email][USER_TOKEN];
            }
            res.status(200);
            returnResponse = { status: true };
        } else {
            res.status(400);
            returnResponse = { status: false, error: 'Email is required!'};
        }
        return res.json(returnResponse);
    }

    async generateOTP(req,res) {
        let returnResponse = {};
        let _data = userFormatter.generateOTP(req);
        let rules = userValidator.generateOTP();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.generateOTP(_data);
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

    async editPassword(req,res) {
        let returnResponse = {};
        let _data = userFormatter.editPassword(req);
        let rules = userValidator.editPassword();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.editPassword(_data);
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

    async editProfilePassword(req,res) {
        let returnResponse = {};
        let _data = userFormatter.editProfilePassword(req);
        let rules = userValidator.editProfilePassword();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.editProfilePassword(_data);
            returnResponse = result;
            if (returnResponse.status) {
                res.status(200);
            } else {
                returnResponse = userResponse.edit_password_failed;
                res.status(200);
            }
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);
    }
    async setstatuscreateApp(req, res){
        let returnResponse = {};
        let _data = userFormatter.setstatuscreateApp(req);
        let rules = userValidator.setstatuscreateApp();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            if (validation.passes()) {
                let result = await userService.setstatuscreateApp(_data);
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
        } else {
            returnResponse = userResponse.form_field_required;
            returnResponse.errors = validation.errors.errors;
            res.status(400);
        }
        return res.json(returnResponse);    
    }

    async addUser(req, res) {
        let returnResponse = {};
        let _data = userFormatter.addUser(req);
        let rules = userValidator.addUser();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            if (req.files) {
                const extension = req.files.files.name.split('.')[1].toLowerCase();
                if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' 
                || extension === 'svg' || extension === 'ico') { 
                let fileName = 'file_' + Math.random().toString(36).slice(2) + '_' + _data.icon.name.replace(/[$&+,:;=?@#|'<>^*()%!\s-]/g, '_');
                let upl =   new Promise((resolve,reject) => {
                   uploadFile.uploadFile(_data.icon, 'uploads/fileupload/merchant', fileName, async (err, path) => {
                       _data.icon = path;
                        if (err) {
                            reject(err);
                            console.error(err);
                        }
                        resolve({filePath: path});
                    })
                   });
                  await upl.then()
                } else {
                    // file_format_not_valid
                    res.status(400);
                    returnResponse = userResponse.file_format_not_valid;
                    return res.json(returnResponse);
                }
            }
            let result = await userService.addUser(_data);
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

    async checkDuplicate(req, res) {
        let returnResponse = {};
        let _data = userFormatter.checkDuplicate(req);
        let rules = userValidator.checkDuplicate();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.checkDuplicate(_data);
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

    async getUserByID(req, res) {
        let returnResponse = {};
        let _data = userFormatter.getUserByID(req);
        let rules = userValidator.getUserByID();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getUserByID(_data);
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

	async profile(req, res) {
        let returnResponse = {};
        let _data = userFormatter.profile(req);
        let rules = userValidator.profile();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getUserByID(_data);
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

    async getUser(req, res) {
        let returnResponse = {};
        let _data = userFormatter.getUser(req);
        let rules = userValidator.getUser();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getUser(_data);
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

    async getActiveroles(req, res) {
        let returnResponse = {};
        let _data = userFormatter.getActiveroles(req);
        let rules = userValidator.getActiveroles();
        let validation = new Validator(_data, rules);
        if (validation.passes()) {
            let result = await userService.getActiveroles(_data);
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
}