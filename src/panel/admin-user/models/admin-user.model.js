"use strict";
const db = require('../../../../common/db');
module.exports = class UserModel {
    // Define Methods for communicate with database
    login(data){
        return db.getDB().collection('admin_users').findOne({ email: data.email });
    }

    getMailConfig(data) {
        let find = {};
        if (data.engine_name) {
            find.engine_name = data.engine_name;
        }
        if (data.engine_for) {
            find = {
                $and: [{engine_for: data.engine_for},{'web_details.default' : true}]
            };
        }
        return db.getDB().collection('configurations').findOne(find);
    }

    storeToken(data){
        return db.getDB().collection('admin_user_tokens').insertOne(data);
    }
    addUser(data){
        return db.getDB().collection('admin_users').insertOne(data);
    }

    async setstatuscreateApp(data){
        return db.getDB().collection('admin_users').updateOne({ _id: new db.ObjectId(data.id) },{ $set:{ status: data.status }});
    }

    setUserAttempt(data) {
        return db.getDB().collection('user_attempts').insertOne({ email: data.email, attempt_timestamp: new Date() });
    }

    getUserAttemptCount(data) {
        let compareTime = new Date();
        compareTime.setMinutes(compareTime.getMinutes() - 10);
        return db.getDB().collection('user_attempts').countDocuments({ email: data.email, attempt_timestamp: { $gt: compareTime } });
    }

    editUser(id,data){
        return db.getDB().collection('admin_users').findOneAndUpdate({_id: db.ObjectId(id)}, { $set: data } );
    }

    async twoFactorGenerate(data,otp){
        const otp_object = {
            "current_otp": otp.toString(),
            "last_otp_generated_at": (new Date()).toISOString()
        };
        return db.getDB().collection('admin_users_otp').updateOne(
            { visitor_id: data._id },
            { $set: otp_object },
            { upsert: true }
        )
    }

    async twoFactorReset(data){
        const otp_object = {
            "current_otp": "",
            "last_otp_generated_at": ""
        };
        return db.getDB().collection('admin_users_otp').updateOne(
            { visitor_id: data._id },
            { $unset: otp_object },
            { upsert: true }
        )
    }

    getOTP(data){
        return db.getDB().collection('admin_users_otp').findOne({ $or: [
            { visitor_id: data.visitor_id },
            { visitor_id: db.ObjectId(data.visitor_id) }
        ] });
    }

    /* twoFactorReset */
    async generateOTP(data) {
        let isUserEmailExist = await db.getDB().collection('admin_users').findOne({email: data.email});
        if (!isUserEmailExist) {
            return {err: "email_not_found"};
        }
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += ( Math.floor( Math.random() * 10));
        }
        data.otp = otp;
        data.otp_gen_at = new Date();
        await db.getDB().collection('admin_users').findOneAndUpdate(
            { email: data.email },
            { $set: data}
        )
        return otp;
    }

    async verifyOTP(data) {
        let isUserEmailExist = await db.getDB().collection('admin_users').findOne({email: data.email});
        if (!isUserEmailExist) {
            return {err: "email_not_found"};
        }
        return db.getDB().collection('admin_users').findOne({
            otp: data.otp,
            email: data.email
        })
    }

    editPassword(data) {
        return db.getDB().collection('admin_users').findOneAndUpdate(
            { email: data.email },
            { $set: data}
        )
    }

    getUser(data){
        let findParams = {}, searchItems = ['name', 'email'];
        searchItems.map((item) => {
            if (data && data[item]) {
                findParams[item] = new RegExp(data[item], 'i');
            }
            if(data && data.status){
                if(data.status === "Active") {
                    findParams['status'] =  {$in : [data.status , null, "null"]}
            } else {
                    findParams['status'] = data.status
                }
            }
        })
        return db.getDB().collection("admin_users").aggregate([
            {
                $match: findParams
            },
            { $sort : Object.keys(data.multiSort).length ? data.multiSort: {created: 1} },
            { $skip : data.skip },
            { $limit : data.limit || 10 },
            {
                "$addFields": {
                    "o_role_id": { $toObjectId : "$role_id"}
                } 
            },
            { $lookup:
                {
                    from:'admin_user_roles',
                    localField: 'o_role_id',
                    foreignField:'_id',
                    as: 'roles'
                }
            }
        ]).toArray();
    }

    getUserByID(data){
        if(data.id){
            data._id = new db.ObjectId(data.id)
        }
        return db.getDB().collection("admin_users").aggregate([
            { $match: { _id: new db.ObjectId(data._id) }} ,
            {
                "$addFields": {
                    "o_role_id": { $toObjectId : "$role_id"}
                } 
            },
            { $project: {
                password:0,
                roles:0
            } },
            { $lookup: {
                from:'admin_user_roles',
                localField: "o_role_id",
                foreignField: '_id',
                as: 'roles'
            }}
        ]).toArray();
        // return db.getDB().collection("admin_users").findOne({_id:db.ObjectId(data._id)});
    }

    getUserCount(data){
        let findParams = {}, searchItems = ['name', 'email'];
        searchItems.map((item) => {
            if (data && data[item]) {
                findParams[item] = new RegExp(data[item], 'i');
            }
            if (data && data.status) {
                if(data.status === "Active") {
                    findParams['status'] =  {$in : [data.status , null, "null"]}
            } else {
                    findParams['status'] = data.status
                }
            }
        })
        return db.getDB().collection("admin_users").countDocuments(findParams);

    }

    checkDuplicate(data){
        return db.getDB().collection('admin_users').findOne(data.findData).toArray();        
    }

    async getActiveroles(_data){
        let findParams ={}; 
        findParams['status'] = "active";
        return db.getDB().collection(global.apps[_data.app_key].app_name + "_admin_user").find(findParams).toArray()
    }

}