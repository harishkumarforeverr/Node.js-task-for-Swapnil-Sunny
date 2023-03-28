"use strict";
const db = require("../../../../common/db");
module.exports = class UserRoleModel {
    async createRole(_data) {
        return db
            .getDB()
            .collection("admin_user_roles")
            .insertOne(_data);
    }

    async getAdminuser(data) {
        let find = {};
        if(data['search']) {
            find['role_name'] = new RegExp('.*' + data.search + ".*",'i')
        }
        if((data.skip==0) && (data.limit==="none")){
            return db.getDB().collection("admin_user_roles").find(find).collation({'locale':'en'}).sort(data.multiSort).toArray();
        }
        return db.getDB().collection("admin_user_roles").find(find).collation({'locale':'en'}).sort(data.multiSort).skip(data.skip).limit(data.limit).toArray();
    }
    async getmastermodule(_data) {
        return db.getDB().collection("module_master").find({}).toArray();
    }
    async roleListCount(_data) {
        let find = {};
        if(_data['search']) {
            find['role_name'] = new RegExp('.*' + _data.search + ".*",'i')
        }
        return db.getDB().collection("admin_user_roles").countDocuments(find);
    }
    async getBaseRoutes(_data) {
        let find = {};
        if (_data.module_id) {
            find["_id"] = new db.ObjectId(_data.module_id);
        }
        return db.getDB().collection("routes_permissions").find(find).toArray();
    }

    async editBaseRoutes(_data) {
        let find = {};
        if (_data.module_id) {
            find["_id"] = new db.ObjectId(_data.module_id);
        }
        return db.getDB().collection("routes_permissions").updateOne(
            find,
            { $set: { routes: _data.routes } }
        );
    }

    async getMasterRoutes(_data) {
        return db.getDB().collection("master_routes").find({}).toArray();
    }

    async editRole(_data) {
        let _id = _data._id;
        delete _data._id;
        return db
            .getDB()
            .collection("admin_user_roles")
            .updateOne({ _id: new db.ObjectId(_id) }, { $set: _data });
    }
    async getRoleById(_data) {
        return db
            .getDB()
            .collection("admin_user_roles")
            .findOne({ _id: new db.ObjectId(_data._id) });
    }
    async setPrivilege(_data) {
        return db
            .getDB()
            .collection("admin_user_roles")
            .updateOne(
                { _id: new db.ObjectId(_data.role_id) },
                { $set: {"permissions": _data.value} }
            );
    }
};
