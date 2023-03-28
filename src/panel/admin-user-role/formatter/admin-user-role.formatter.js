"use strict";
let moment = require('moment');

module.exports = class UserRoleFormatter {
  createRole(req) {
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    return {
      app_key: req.app_key,
      clientIp: clientIp,
      created_by: req.user_id,
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      status: req.body.status,
      ismerchant: req.body.ismerchant,
      created_at : new Date()
    };

  }
  getAdminuser(req) {
    return {
      app_key: req.app_key,
      skip: parseInt(req.query.skip) || 0,
      limit:(req.query.limit==="none")?"none":(parseInt(req.query.limit) || 10),
      search: req.query.search,
      multiSort:req.query.multiSort? JSON.parse(req.query.multiSort): {}

    };
  }

  getAdminuserRoletype(req) {
    return {
      app_key: req.app_key,
      skip: parseInt(req.query.skip) ,
      limit: parseInt(req.query.limit),
      search: req.query.search,
      multiSort:req.query.multiSort? JSON.parse(req.query.multiSort): {}

    };
  }

  getRoleById(req) {
    return {
      app_key: req.app_key,
      created_by: req.user_id,
      _id: req.query._id,
    }
  }

  editRole(req) {
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    let data = {
      app_key: req.app_key,
      _id: req.body._id,
      updated_by: req.user_id,
      role_name: req.body.role_name,
      clientIp: clientIp,
      created_by: req.user_id,
      role_description: req.body.role_description,
      status: req.body.status,
      ismerchant: req.body.ismerchant,
      updated_at :  new Date()

    };


    // let query_json = (req.body.itemRows);
    // for (let i = 0; i < query_json.length; i++) {
    //     data.steps.push(query_json[i]);
    //     data.steps[i].times = JSON.stringify(query_json[i].times);
    //     data.steps[i].query = JSON.stringify(query_json[i].query);
    // }

    return data;
  }

  getmastermodule(req) {
    return {
      app_key: req.app_key,
      //skip: parseInt(req.query.skip) | 0,
      // limit: parseInt(req.query.limit) | 10,
    };
  }
  
  getBaseRoutes(req) {
    return {
      app_key: req.app_key,
      module_id: req.query.module_id
    };
  }

  getMasterRoutes(req) {
    return {
      app_key: req.app_key,
      module_id: req.body.module_id
    };
  }

  editBaseRoutes(req) {
    return {
      app_key: req.app_key,
      routes: req.body.routes,
      module_id: req.body.module_id
    };
  }

  setPrivilege(req) {

    return {
      app_key: req.app_key,
      created_by: req.user_id,
      role_id: req.body.role_id,
      value: req.body.value,
    };
  }



};
