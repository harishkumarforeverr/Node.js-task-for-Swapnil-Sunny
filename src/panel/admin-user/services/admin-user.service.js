let adminUserResponse = require("../responses/admin-user.response");
let adminUserModel = new (require("../models/admin-user.model"))();
let jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require("bcryptjs");
// const audit_logs = new (require('../../../../common/audit_logs'))();
const db = require("../../../../common/db");
module.exports = class UserService {
  constructor() {
    //
  }

  async login(data) {
    let returnResponse = {};
    let userResult = await adminUserModel.login(data);
    if (!userResult) {
      return adminUserResponse.failed('users_not_found');
    }
    let role =  await adminUserModel.getUserByID({ '_id': userResult._id });
    if(userResult && userResult.status === 'Inactive') {
      returnResponse = adminUserResponse.failed("login_failed_due_to_Status");
      return returnResponse;
    }
    let attempts_last30min = await adminUserModel.getUserAttemptCount(data);
    if (userResult && userResult.block_time) {
      let now = new Date();
      let block_time = new Date(userResult.block_time);
      let diffSec = Math.floor((now.getTime() - block_time.getTime()) / 1000);
      if (diffSec < 1800) {
        diffSec = 1800 - diffSec;
        let time_to_retry = "";
        if (diffSec < 60) {
          time_to_retry = diffSec + " seconds";
        } else {
          time_to_retry = Math.ceil(diffSec / 60) + " minutes";
        }
        returnResponse = {
          code: "USR_0011",
          message: "Too many failed login attempts. Please try again in " + time_to_retry,
          status: false,
        };
        return returnResponse;
      }
    }
    if (attempts_last30min >=3 ) {
      await adminUserModel.editUser(String(userResult._id), { block_time : new Date() });
      returnResponse = adminUserResponse.failed("too_many_login_attempts");
      return returnResponse;
    }
    if (userResult) {
      if (bcrypt.compareSync(data.password, userResult.password)) {
        let token = jwt.sign(
          {
            _id: userResult._id,
          },
          process.env.JWT_KEY,
          { expiresIn: 60 * 60 * 60 }
        );
        if (process.env.ENC_KEY) {
          const cipher = crypto.createCipher('aes192', process.env.ENC_KEY);
          token = cipher.update(token, 'utf8', 'hex');
          token += cipher.final('hex');
        }
        userResult.token = token;
        await adminUserModel.storeToken({
          token: token,
          user_id: userResult._id,
        });
        if (global.token_obj) {
          if (!global.token_obj[data.email]) {
            global.token_obj[data.email] = {};
          }
          global.token_obj[data.email][token] = 1;
        }
        let returnObj = {
          ...userResult,
          roleObj: {
            role_name : role[0].roles[0].role_name,
            permitted_apps : role[0].permitted_apps,
            isglobal_admin : role[0].global_admin,
            isMerchant : (role[0].partner_code && role[0].partner_name),
          }
        };
        delete returnObj._id;
        delete returnObj.otp;
        delete returnObj.otp_gen_at;
        delete returnObj.password;
        returnResponse = adminUserResponse.success("login_success", returnObj);
        /*
        let audit_data = {
          audit_key: userResult._id,
          module_name: 'users',
          new_data: {
            ...data,
            type: 'SUCCESS',
          },
          ip_address: data.clientIp,
          replacement_keys: ['_id'],
        };
        audit_logs.audit_logs(audit_data);
        */
      } else {
        await adminUserModel.setUserAttempt(data);
        returnResponse = adminUserResponse.failed("login_failed");
        /*
        let audit_data = {
          audit_key: userResult._id,
          module_name: 'users',
          new_data: {
            ...data,
            type: 'FAILED',
            reason: 'password_incorrect',
          },
          ip_address: data.clientIp,
          replacement_keys: ['_id'],
        };
        audit_logs.audit_logs(audit_data);
        */
      }
    } else {
      returnResponse = adminUserResponse.failed("login_failed");
    }
    return returnResponse;
  }

  async loginWithOTP(data) {
    let returnResponse = {};
    let userResult = await adminUserModel.login(data); // get user data
    let role =  await adminUserModel.getUserByID({ '_id': userResult._id });
    if (!userResult) {
      return adminUserResponse.failed('add_user_failed');
    }
    let attempts_last30min = await adminUserModel.getUserAttemptCount(data);
    if (userResult && userResult.block_time) {
      let now = new Date();
      let block_time = new Date(userResult.block_time);
      let diffSec = Math.floor((now.getTime() - block_time.getTime()) / 1000);
      if (diffSec < 1800) {
        diffSec = 1800 - diffSec;
        let time_to_retry = "";
        if (diffSec < 60) {
          time_to_retry = diffSec + " seconds";
        } else {
          time_to_retry = Math.ceil(diffSec / 60) + " minutes";
        }
        returnResponse = {
          code: "USR_0011",
          message: "Too many failed login attempts. Please try again in " + time_to_retry,
          status: false,
        };
        return returnResponse;
      }
    }
    if (attempts_last30min >=3 ) {
      await adminUserModel.editUser(String(userResult._id), { block_time : new Date() });
      /*
      let audit_data = {
        audit_key: userResult._id,
        module_name: 'users',
        new_data: {
          ...data,
          type: 'FAILED',
          reason: 'too_many_login_attempts',
        },
        ip_address: data.clientIp,
        replacement_keys: ['_id'],
      };
      audit_logs.audit_logs(audit_data);
      */
      returnResponse = adminUserResponse.failed("too_many_login_attempts");
      return returnResponse;
    }
    if (userResult) {
      if (bcrypt.compareSync(data.password, userResult.password)) {
        let token = jwt.sign(
          {
            _id: userResult._id,
          },
          process.env.JWT_KEY,
          { expiresIn: 60 * 60 * 60 }
        );
        if (process.env.ENC_KEY) {
          const cipher = crypto.createCipher('aes192', process.env.ENC_KEY);
          token = cipher.update(token, 'utf8', 'hex');
          token += cipher.final('hex');
        }
        userResult.token = token;
        await adminUserModel.storeToken({
          token: token,
          user_id: userResult._id,
        });
        let returnObj = {
          ...userResult,
          roleObj: {
            role_name : role[0].roles[0].role_name,
            permitted_apps : role[0].permitted_apps,
            isglobal_admin : role[0].global_admin,
            isMerchant : (role[0].partner_code && role[0].partner_name),
          }
        };
        delete returnObj._id;
        delete returnObj.otp;
        delete returnObj.otp_gen_at;
        delete returnObj.password;
        const otpObject = await adminUserModel.getOTP({ visitor_id: userResult._id });
        userResult.current_otp = (otpObject && otpObject.current_otp) ? otpObject.current_otp : '';
        userResult.last_otp_generated_at = (otpObject && otpObject.last_otp_generated_at) ? otpObject.last_otp_generated_at : '';
        returnResponse = adminUserResponse.success("login_success", returnObj);
        /*
        let audit_data = {
          audit_key: userResult._id,
          module_name: 'users',
          new_data: {
            ...data,
            type: 'SUCCESS',
          },
          ip_address: data.clientIp,
          replacement_keys: ['_id'],
        };
        audit_logs.audit_logs(audit_data);
        */
      } else {
        await adminUserModel.setUserAttempt(data);
        /*
        let audit_data = {
          audit_key: userResult._id,
          module_name: 'users',
          new_data: {
            ...data,
            type: 'FAILED',
            reason: 'password_incorrect',
          },
          ip_address: data.clientIp,
          replacement_keys: ['_id'],
        };
        audit_logs.audit_logs(audit_data);
        */
        returnResponse = adminUserResponse.failed("login_failed");
      }
    } else {
      returnResponse = adminUserResponse.failed("login_failed");
      /*
      let audit_data = {
        module_name: 'users',
        new_data: {
          ...data,
          type: 'FAILED',
          reason: 'user_not_found',
        },
        ip_address: data.clientIp,
        replacement_keys: ['_id'],
      };
      audit_logs.audit_logs(audit_data);
      */
    }
    return returnResponse;
  }

  async addUser(data) {
    let returnResponse = {};
    if (data.two_factor_enabled && data.two_factor_enabled === 'false') {
      data.two_factor_enabled = false;
    }
    data.created = new Date();  
    data.password = await this.hashPassword(data.password);
    let clientIp = data['clientIp'];
    delete data['clientIp'];

    let checkUserEmailExist = await adminUserModel.checkDuplicate({
      findData: {
        email: data.email
      }
    })
    if (checkUserEmailExist && checkUserEmailExist.length) {
      returnResponse = adminUserResponse.failed("add_user_failed", { message: 'Email already exists' });
      return returnResponse;
    }
    let userResult = await adminUserModel.addUser(data);
    /*
    let insertedId = userResult.insertedId;
    let audit_data = {
      audit_key: insertedId,
      module_name: 'users',
      new_data: data,
      type: 'INSERT',
      ip_address: clientIp,
      created_by: data.created_by,
      replacement_keys: ['created_by', '_id'],
    };
    audit_logs.audit_logs(audit_data);
    */
    if (userResult) {
      returnResponse = adminUserResponse.success("add_user_success", userResult);
    } else {
      returnResponse = adminUserResponse.failed("add_user_failed", userResult);
    }
    return returnResponse;
  }

  async setstatuscreateApp(data){

    let returnResult;       
    await adminUserModel.setstatuscreateApp(data);
    returnResult = adminUserResponse.success('add_user_success');
    return returnResult;

}
  async editUser(data) {
    let users = await adminUserModel.getUserByID(data);
    let old_data = users;
    if (data.two_factor_enabled && data.two_factor_enabled === 'false') {
      data.two_factor_enabled = false;
    }

    let clientIp = data['clientIp'];
    delete data['clientIp'];
    let returnResponse = {};
    data.modify = new Date();
    let id = data.id;
    delete data["id"];
  
    let userResult = await adminUserModel.editUser(id, data);

    try {
      /*
      let audit_data = {
        audit_key: db.ObjectId(data._id),
        module_name: 'users',
        new_data: data,
        old_data: old_data,
        type: 'UPDATE',
        ip_address: clientIp,
        updated_by: data.updated_by,
        replacement_keys: ['updated_by', '_id']
      };
      audit_logs.audit_logs(audit_data);
      */
    } catch (e) {
      console.error('error', e);
    }
    if (userResult) {
      returnResponse = adminUserResponse.success("edit_user_success", userResult);
    } else {
      returnResponse = adminUserResponse.failed("edit_user_failed", userResult);
    }
    return returnResponse;
  }


  async generateOTP(data) {
    data['engine_for'] = 'email';
    let returnResponse = {};
    let mailConfig = await adminUserModel.getMailConfig(data);
    if(mailConfig) {
      this.client.setApiKey(mailConfig.web_details.apiKey);
      let userResult = await adminUserModel.generateOTP(data);
      if (userResult) {
        if (userResult.err && userResult.err == "email_not_found") {
          return adminUserResponse.failed("email_not_found");
        }
        returnResponse = adminUserResponse.success("otp_created", {});
      } else {
        returnResponse = adminUserResponse.failed("otp_not_created", {});
      }
    }
    else {
      returnResponse = adminUserResponse.failed("config_not_found");
    }
    
    return returnResponse;
  }

  async verifyOTP(data) {
    let returnResponse = {};
    let userResult = await adminUserModel.verifyOTP(data);
    if (userResult) {
      if (userResult.err && userResult.err == "email_not_found") {
        return adminUserResponse.failed("email_not_found");
      }
      returnResponse = adminUserResponse.success("otp_verified");
    } else {
      returnResponse = adminUserResponse.failed("otp_not_verified");
    }
    return returnResponse;
  }

  async editPassword(data) {
    let returnResponse = {};
    data.password = await this.hashPassword(data.password);
    let userResult = await adminUserModel.editPassword(data);
    if (userResult) {
      returnResponse = adminUserResponse.success("otp_verified");
    } else {
      returnResponse = adminUserResponse.failed("otp_not_verified");
    }
    return returnResponse;
  }

  async editProfilePassword(data) {
    let returnResponse = {};
    if (bcrypt.compareSync(data.oldpass, data.password)) {
      data.password = await this.hashPassword(data.newpass);
      delete data["oldpass"];
      delete data["newpass"];

      let userResult = await adminUserModel.editPassword(data);
      if (userResult) {
        returnResponse = adminUserResponse.success("Password updated sucessfully");
      } else {
        returnResponse = adminUserResponse.failed("Password update failed");
      }
    } else {
      returnResponse = adminUserResponse.failed("Password update failed");
    }
    return returnResponse;
  }

  async checkpasswordvalidity(data) {
    data.password = await this.hashPassword(data.password);
    return data.password
  }

  async getUser(data) {
    let returnResponse = {};
    let users = await adminUserModel.getUser(data);
    let userCount = await adminUserModel.getUserCount(data);
    // if (users.length > 0) {
    returnResponse = adminUserResponse.success("users_found", {
      values: users,
      total_records: userCount,
    });
    // } else {
    //   returnResponse = adminUserResponse.failed("users_not_found");
    // }
    return returnResponse;
  }

  async getUserByID(data) {
    let returResult = {};
    let users = await adminUserModel.getUserByID(data);

    if (users) {
      returResult = adminUserResponse.success("users_found", users);
    } else {
      returResult = adminUserResponse.success("users_not_found");
    }
    return returResult;
  }

  async checkDuplicate(data) {
    let returnResponse = {};
    let findData = {};
    findData[data.column_name] = data.data;
    data.findData = findData;
    let userResult = await adminUserModel.checkDuplicate(data);
    if (userResult) {
      returnResponse = adminUserResponse.success("add_user_success", userResult);
    } else {
      returnResponse = adminUserResponse.failed("add_user_failed", userResult);
    }
    return returnResponse;
  }

  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT);
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
    return hashedPassword;
  }

  async getActiveroles(_data) {
    let returResult;
    let active_module = await adminUserModel.getActiveroles(_data);
    if (active_module) {
      returResult = adminUserResponse.success('module_found', active_module);
    } else {

      returResult = adminUserResponse.success('module_not_found');
    }
    return returResult;
  }

  async twoFactorGenerate(data){
    const OTP = Math.floor(Math.random() * 899999 + 100000)
    let userResult = await adminUserModel.twoFactorGenerate(data,OTP);
    data['engine_for'] = 'email';
    let mailConfig = await adminUserModel.getMailConfig(data);
    if(mailConfig) {
      this.client.setApiKey(mailConfig.web_details.apiKey);
    }
    return userResult
  }

  async twoFactorReset(data){
    let userResult = await adminUserModel.twoFactorReset(data);
    return userResult
  } 

};

