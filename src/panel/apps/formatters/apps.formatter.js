"use strict";

module.exports = class AppsFormatter {
    getApps(req) {
        // Format request data object and return
        return {
            skip:parseInt(req.query.offset) || 0,
            limit:parseInt(req.query.limit) || 10,
            search: req.query.search,
            multiSort:req.query.multiSort ? JSON.parse(req.query.multiSort): {}

        }
    }

    checkInstallation(req){
        return {
            skip:parseInt(req.query.skip) || 0,
            limit:parseInt(req.query.limit) || 10
        };
    }

    init(req) {
        return {
            skip:parseInt(req.query.skip) || 0,
            limit:parseInt(req.query.limit) || 10
        };
    }

    createApp(req) {
        // Format request data object and return
        let body = JSON.parse(req.body.body);
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        return {
            app_name: body.app_name,
            clientIp: clientIp,
            app_types: body.app_types,
            time_zone: body.time_zone,
            icon: req.files ? req.files.icon: null,
            website_domain: body.website_domain,
            android_app_package: body.android_app_package,
            ios_app_package: body.ios_app_package,
            demo_data: body.demo_data,
            created_by:req.user_id,
            created_at:new Date(),
        }
    }

    setstatuscreateApp(req){
        return {
            id: req.body.id,
            status:req .body.status,

        }
        
    }
    
    updateApp(req) {
        let body = JSON.parse(req.body.body);
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        return {
            app_key: req.body.app_key,
            app_name: body.app_name,
            clientIp: clientIp,
            app_types: body.app_types,
            icon: req.files ? req.files.icon: null,
            website_domain: body.website_domain,
            android_app_package: body.android_app_package,
            ios_app_package: body.ios_app_package,
            demo_data: body.demo_data,
            updated_by:req.user_id,
            updated_at:new Date(),
        }
    }

    getAppDatails(req){
        return {
            created_by:req.user_id,
            app_key:req.query.app_key
        }
    }

}