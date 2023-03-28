"use strict";
const db = require('../../../../common/db');

module.exports = class AppsModel {
    // Define Methods for communicate with database
    getInitialUserInfo(data){
        return db.getDB().collection("admin_users").find().toArray();
    }
    
    getApps(data){
        let find = {};
        if(data['search']) {
            find['app_name'] = new RegExp('.*' + data.search + ".*",'i')
        }
        if(!data.skip) {
            data.skip = 0;
        }
        let query;
        if(data.limit) {
            query = db.getDB().collection("apps").find(find).skip(data.skip).limit(data.limit).collation({'locale':'en'}).sort(data.multiSort);
        }
        else {
            query = db.getDB().collection("apps").find(find).skip(data.skip).collation({'locale':'en'}).sort(data.multiSort);
        }
        return query.toArray();
    }

    checkAppDataExist(data){
        let orData = [];
        orData.push({app_name:data.app_name});
        if(data.android_app_package){
            orData.push({android_app_package: data.android_app_package});
        }
        if(data.ios_app_package){
            orData.push({ios_app_package:data.ios_app_package});
        }
        if(data.website_domain){
            orData.push({website_domain: data.website_domain});
        }
        return db.getDB().collection("apps").find({
            '$or':orData
        }).toArray();
    }

    checkAppUpdateDataExist(data) {
        let orData = [];
        orData.push({app_name:data.app_name});
        if(data.android_app_package){
            orData.push({android_app_package: data.android_app_package});
        }
        if(data.ios_app_package){
            orData.push({ios_app_package:data.ios_app_package});
        }
        if(data.website_domain){
            orData.push({website_domain: data.website_domain});
        }
        return db.getDB().collection("apps").find({
            '$and': [{app_key: { $ne: data.app_key}},{'$or':orData}]
        }).toArray();
    }

    updateApp(app_key,data) {
        return db.getDB().collection('apps').updateOne({app_key: app_key},{$set: data});
    }

    async createApp(data){
        try{
            let moduleConfig = {}, modules_list;
            modules_list = await db.getDB().collection('dashboard_modules').findOne();
            if (modules_list.modules) {
                for (let index = 0; index < modules_list.modules.length; index++) {
                    moduleConfig[modules_list.modules[index]] = {
                        "action" : "show",
                        "status" : 1
                    };
                }
            }
            await db.getDB().collection('dashboard_module_list').insertOne({
                app_key: data['app_key'],
                modules: moduleConfig
            });
        }
        catch(e) {
            console.error('Error in Dashboard Config Creation: ',e);
        }
        return db.getDB().collection('apps').insertOne(data);
    }
async setstatuscreateApp(data){
    return db.getDB().collection('apps').updateOne({_id: db.ObjectId(data.id)},{$set:{status: data.status}});

}
    getAppDetailsByAppKey(data){
        return db.getDB().collection("apps").findOne({app_key:data.app_key});
    }

    getAppsCount(data){
        let find = {};
        if(data['search']) {
            find['app_name'] = new RegExp('.*' + data.search + ".*",'i')
        }
        return db.getDB().collection("apps").countDocuments(find);
        
    }
}