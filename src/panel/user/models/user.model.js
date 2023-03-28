'use strict';
const db = require('../../../../common/db');

module.exports = class UserModel {
    // Define Methods for communicate with database
    getUsersList(data) {
        let condition = {};
        if (data.search) {
            let search = new RegExp('.*' + data.search + '.*', 'i');
            condition = { '$or': [
                { email: search },
                { user_id: search },
                { first_name: search },
                { last_name: search },
                { phone: search },
            ] };
        }
        if (data.user_type == 'known') {
            condition = { $and: [{ user_id: { $exists: true }}, condition ]};
        }
        if (data.user_type == 'unknown') {
            condition = { $and: [{ user_id: { $exists: false }}, condition ]};
        }
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').find(condition, { "allowDiskUse" : true }).skip(data.skip).limit(data.limit).toArray();
    }

    getUsersCount(data) {
        let condition = {};
        if (data.search) {
            let search = new RegExp('.*' + data.search + '.*', 'i');
            condition = { '$or': [
                { email: search },
                { user_id: search },
                { first_name: search },
                { last_name: search },
                { phone: search },
            ] };
        }
        if (data.user_type == 'known') {
            condition = { $and: [{ user_id: { $exists: true }}, condition ]};
        }
        if (data.user_type == 'unknown') {
            condition = { $and: [{ user_id: { $exists: false }}, condition ]};
        }
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').countDocuments(condition);
    }

    analyseUsers(data) {
        let aggregateQuery = [];
        if (data.analysisPool === 'known') {
            aggregateQuery.push({ $match: { user_id: { $exists: true } } });
        } else if (data.analysisPool === 'unknown') {
            aggregateQuery.push({ $match: { user_id: { $exists: false } } });
        }
        aggregateQuery.push({ $match: { [data.analysisOver]: { $exists: true } }});
        aggregateQuery.push({ $group : {
            _id: { analysisOver: `$${data.analysisOver}` }, count: { $sum: 1 },
        } });
        aggregateQuery.push({ $sort : { count: -1 } });
        aggregateQuery.push({ $limit : 20 });
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').aggregate(aggregateQuery, { allowDiskUse: true }).toArray();
    }

    analyseUsersWithSplit(data) {
        let aggregateQuery = [];
        if (data.analysisPool === 'known') {
            aggregateQuery.push({ $match: { user_id: { $exists: true } } });
        } else if (data.analysisPool === 'unknown') {
            aggregateQuery.push({ $match: { user_id: { $exists: false } } });
        }
        aggregateQuery.push({ $match: { [data.analysisOver]: { $in: data.props } }});
        aggregateQuery.push({ $group : {
            _id: { analysisOver: `$${data.analysisOver}`, analysisSplit: `$${data.analysisSplit}` }, count: { $sum: 1 },
        } });
        aggregateQuery.push({ $sort : { count: -1 } });
        aggregateQuery.push({ $limit : 400 });
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').aggregate(aggregateQuery, { allowDiskUse: true }).toArray();
    }

    checkUserExist(data) {
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').findOne({ membership_no: data.membership_no });
    }

    async createUser(data) {
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').insertOne(data);
    }

    UploadFileDB(filePath,appkey,totalcount,timestamp, duplicates, length) {
        return db.getDB().collection(global.apps[appkey].app_name + '_upload_rejected_files').insertOne({
            filename: filePath,
            totalCount: totalCount,
            timestamp: timestamp,
            failedCount: duplicates,
            successCount: length,
        });
    }

    async updateUploadFileDB(path_file,id,app_key) {
        await db.getDB().collection(global.apps[app_key].app_name + '_upload_rejected_files').updateOne({ _id: new db.ObjectId(id) }, { $set: { status: 'success', path: path_file }});
    }

    getAttributeMaster(data) {
        let findOne = {
            config_key: data.config_key || 'master',
        };
        return db.getDB().collection('attribute_master').findOne(findOne);
    }

    editAttributeMaster(data) {
        let cond = { config_key: data.config_key };
        let updateData = { configuration: data.configuration };
        return db.getDB().collection('attribute_master').updateOne(cond, {
            $set: updateData
        });
    }
    
    async modifyUser(data) {
        return db.getDB().collection(global.apps[data.app_key].app_name + '_users').updateOne(data.condition, { $set: data.update_values });
    }
}