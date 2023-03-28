"use strict";

module.exports = class UserFormatter {
    createUser(req){
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        req.body.clientIp = clientIp;
        req.body.app_key = req.app_key;
        return req.body;
    }

    modifyUser(req){
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        req.body.clientIp = clientIp;
        req.body.app_key = req.app_key;
        return req.body;
    }

    usersList(req){
        return {
            app_key : req.app_key,
            skip: parseInt(req.query.offset) || 0,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search,
            user_type: req.query.user_type,
            multiSort: req.query.multiSort? JSON.parse(req.query.multiSort): {},
        }
    }
    
    getAttributeMaster(req) {
        return {
            config_key: req.query.config_key,
            app_key : req.app_key
        }
    }

    editAttributeMaster(req) {
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        return {
            app_key : req.app_key,
            clientIp: clientIp,
            config_key: req.body.config_key,
            configuration: req.body.configuration
        }
    }

    analyseUsers(req) {
        return {
            app_key : req.app_key,
            analysisPool: req.query.analysisPool,
            analysisOver: req.query.analysisOver,
            analysisSplit: req.query.analysisSplit,
        }
    }

    getUserEvents(req) {
        return {
            app_key : req.app_key,
            user_id: req.query.user_id,
            key: req.query.event_key,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            skip: parseInt(req.query.offset) || 0,
            limit: parseInt(req.query.limit) || 10,
        }
    }
    
    getProfile(req){
        return {
            app_key : req.app_key,
            user_id: req.query.user_id,
        }
    }

    createUsersFromCsv(req) {
        return {
            app_key: req.app_key,
            files: req.files ? req.files.file: null,
        }
    }
}