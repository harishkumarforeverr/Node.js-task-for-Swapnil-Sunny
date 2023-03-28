let appsResponse = require("../responses/apps.response");
let appsModel = new (require("../models/apps.model"))();
const { v4: uuidv4 } = require('uuid');
const permissions = require('../../../../initApp/permissions');
const initApp = require('../../../../initApp');
const db = require("../../../../common/db");
const axios = require('axios');
module.exports = class AppsService {

    constructor() {
        //
    }

    async init(data) {
        let returResult;
        let users = await appsModel.getInitialUserInfo(data);
        if (users.length > 0) {
            let apps = await appsModel.getApps(data);
            if(apps.length>0){
                returResult = appsResponse.success('init_found',apps);
            }else{
                returResult = appsResponse.failed('apps_not_found',apps);
            }
        } else {
            returResult = appsResponse.failed('init_not_found')
        }
        return returResult;
    }

    async checkInstallation(data){
        let returResult;
        let users = await appsModel.getInitialUserInfo(data);
        if (users.length > 0) {
            let apps = await appsModel.getApps(data);
            if(apps.length>0) {
                returResult = appsResponse.success('init_found',apps);
            } else {
                returResult = appsResponse.failed('apps_not_found',apps);
            }
        } else {
            returResult = appsResponse.failed('init_not_found')
        }
        return returResult;
    }
    async getApps(data) {
        let returResult;
        let apps = await appsModel.getApps(data);
        let appsCount = await appsModel.getAppsCount(data);
        if (apps.length > 0) {
            returResult = appsResponse.success('apps_found', {values:apps,total_records:appsCount});
        } else {
            returResult = appsResponse.failed('apps_not_found')
        }
        return returResult;
    }

    async createApp(data){
        let returResult;
        let error = {};
        let apps = await appsModel.checkAppDataExist(data);
      
		// let clientIp = data['clientIp'];
		delete data['clientIp'];
        if (apps.length > 0) {
            if(apps[0].app_name == data.app_name){
                error = {app_name:"App name already exist."};
            }else if(apps[0].android_app_package == data.android_app_package){
                error = {android_app_package:"App package already exist."};
            } else if(apps[0].ios_app_package == data.ios_app_package){
                    error = {ios_app_package:"App package already exist."};
            } else if(apps[0].website_domain == data.website_domain){
                error = {website_domain:"Website domain already exist."};
            }
            returResult = appsResponse.failed('app_exist', error);
        } else {
            data.app_key = uuidv4();
            data.created_at = new Date();
            let application = await appsModel.createApp(data);
            // let insertedId = application.insertedId;
            returResult = appsResponse.success('app_created');
            // this supposed to refresh global sdk variable, uncomment if needed
            /*
            try {
                await axios({
                    method: 'GET',
                    url: process.env.SDK_API+'/api/sdk/apps/refreshApps',
                    headers: {
                        'API_KEY': process.env.SDK_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
            } catch(err) {
                console.error('err',err);
            }
            */
            let apps = await appsModel.getApps({});
            try {
                const apps_arr = apps;
                global.apps = [];
                for (let app of apps_arr) {
                    global.apps[app.app_key] = app;
                }
                await permissions.initCrons();
            } catch (err) {
                process.exit(1);
            }
            /*
            let audit_data = {
                audit_key: insertedId,
                module_name: 'application',
                new_data: data,
                type: 'INSERT',
                ip_address: clientIp,
                created_by: data.created_by,
                replacement_keys: ['created_by', '_id'],
            };
            audit_logs.audit_logs(audit_data);
            */
        }
        return returResult;
    }
    async setstatuscreateApp(data){
        let returnResult;       
        await appsModel.setstatuscreateApp(data);
        returnResult = appsResponse.success('app_created');
        return returnResult;
    }
    async updateApp(data) {

        // let apps1 = await appsModel.getAppDetailsByAppKey(data);
        // let clientIp = data['clientIp'];
		delete data['clientIp'];
        let returResult;
        let error = {};
        let apps = await appsModel.checkAppUpdateDataExist(data);
        if (apps && apps.length > 0) {
            if(apps[0].app_name == data.app_name){
                error = {app_name:"App name already exist."};
            }else if(apps[0].website_domain == data.website_domain){
                error = {website_domain:"Website domain already exist."};
            }
            else if(apps[0].android_app_package == data.android_app_package){
                error = {android_app_package:"App package already exist."};
            }
             else if(apps[0].ios_app_package == data.ios_app_package){
                    error = {ios_app_package:"App package already exist."};
             }
            returResult = appsResponse.failed('app_exist', error);
        } else {
      
            let app_key = data.app_key;
            if(data.demo_data == null) {
                delete data.demo_data;
            }
            if(!data.icon || data.icon.length == 0) {
                delete data.icon;
            }
          //  delete data.app_key;
            data.updated_at = new Date();

            // let old_data = apps1;
            await appsModel.updateApp(app_key,data);
            returResult = appsResponse.success('app_updated');
            
            let apps = await appsModel.getApps({});
            
            try {
                const apps_arr = apps;
                global.apps = [];
                for (let app of apps_arr) {
                    global.apps[app.app_key] = app;
                }
              //  await permissions.initCrons();
            } catch (err) {
              //  process.exit(1);
            }
            /*
            try {
                let audit_data = {
                    audit_key: db.ObjectId(data._id),
                    module_name: 'application',
                    new_data: data,
                    old_data: old_data,
                    type: 'UPDATE',
                    ip_address: clientIp,
                    updated_by: data.updated_by,
                    replacement_keys: ['updated_by', '_id']
                };
                audit_logs.audit_logs(audit_data);
            } catch (e) {
                console.error('error', e);
            }
            */
        }
        return returResult;
    }

    async getAppDatails(data){
        let returResult;
        let app = await appsModel.getAppDetailsByAppKey(data);
        if (app) {
            returResult = appsResponse.success('app_found',app);
        }else{
            returResult = appsResponse.success('app_not_found');
        }
        return returResult;
    }

}
