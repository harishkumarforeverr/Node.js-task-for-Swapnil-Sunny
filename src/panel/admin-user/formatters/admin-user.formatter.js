"use strict";

module.exports = class UserFormatter {
  login(req) {
    // Format request data object and return
    return {
      clientIp : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
      email: req.body.email,
      password: req.body.password,
      ask_for_regen: req.body.ask_for_regen ? true: false,
      current_otp: req.body.current_otp,
    };
  }

  loginWithOTP(req) {
    return {
      clientIp : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
      email: req.body.email,
      password: req.body.password,
      ask_for_regen: req.body.ask_for_regen ? true: false,
      current_otp: req.body.current_otp,
    };
  }
  
  addUser(req) {
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    return {
      name: req.body.name,
      password: req.body.password,
      clientIp: clientIp,
      email: req.body.email,
      created_by: req.user_id,
      role_id:req.body.role_id,
      global_admin: req.body.global_admin,
      status:req.body.status,
      admin_of: req.body.admin_of,
      permitted_apps: req.body.permitted_apps,
      two_factor_enabled: req.body.two_factor_enabled,
      partner_name: req.body.partner_name,
      partner_code: req.body.partner_code,
      dashboard_id: req.body.dashboard_id,
      dashboard_name: req.body.dashboard_name,
      user_of: req.body.user_of,
      app_key:req.app_key,
      created : new Date(),
      icon:req.files? req.files.files : '' ,
      isMerchant: Boolean(req.body.isMerchant)
    };
  }



  generateOTP(req) {
    return {
      email: req.body.email
    };
  }
  verifyOTP(req) {
    return {
      email: req.body.email,
      otp: req.body.otp
    };
  }

  editPassword(req) {
    return {
      email: req.body.email,
      password: req.body.password
    };
  }


  editProfilePassword(req) {
    return {
      email: req.body.email,
      oldpass:req.body.oldpass,
      newpass:req.body.newpass,
      last_changed_pass:req.body.last_changed_pass,

    };
  }
  
  editUser(req) {
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    return {
      name: req.body.name,
      clientIp: clientIp,
      email: req.body.email,
      role_id:req.body.role_id,
      app_key: req.app_key,
      updated_by: req.user_id,
      global_admin: req.body.global_admin,
      status:req.body.status,
      admin_of: req.body.admin_of,
      user_of: req.body.user_of,
      permitted_apps: req.body.permitted_apps,
      two_factor_enabled: req.body.two_factor_enabled,
      partner_name: req.body.partner_name,
      partner_code: req.body.partner_code,
      dashboard_id: req.body.dashboard_id,
      dashboard_name: req.body.dashboard_name,
      id:req.body._id,
      updated_at:new Date(),
      icon:req.files? req.files.files : req.body.icon ,
      isMerchant: Boolean(req.body.isMerchant)

      // files:req.files.files,
      // filename:req.files.files.name,

    };
  }
  setstatuscreateApp(req){
    return {
        id: req.body.id,
        status:req .body.status,

    }
    
}

  getUser(req) {
    return {
      // app_key: req.app_key,
      name: req.query.name,
      email: req.query.email,
      status: req.query.status,
      skip: parseInt(req.query.skip) | 0,
      limit: parseInt(req.query.limit) | 10,
      multiSort:req.query.multiSort? JSON.parse(req.query.multiSort):{}

    };
  }
  getUserByID(req){
    return {
      _id: req.query._id,
    };
  }

  profile(req){
    return {
      _id: req.user_id,
    };
  }

  getActiveroles(req){
    return {
      app_key: req.app_key,
    };
  }

  checkDuplicate(req) {
    return {
      column_name: req.body.column_name,
      data: req.body.data,
    };
  }
};
