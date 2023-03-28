let adminUserRoleResponse = require("../responses/admin-user-role.response");
let adminUserRoleModel = new (require("../model/admin-user-role.model"))();
// const audit_logs = new (require('../../../../common/audit_logs'))();
const db = require("../../../../common/db");
module.exports = class UserRoleService {
    constructor() {
        //
    }
    async createRole(_data) {

        let returResult;
        // _data.created_at = new Date();
        // let clientIp = _data['clientIp'];
        delete _data['clientIp'];
        try {
           let userRoles = await adminUserRoleModel.createRole(_data);
            returResult = adminUserRoleResponse.success("role_created");
        } catch (error) {
            console.error(error);
            returResult = adminUserRoleResponse.failed("role_creation_failed");
        }
        return returResult;
    }

    async getAdminuser(_data) {
        let returResult;
        let useradmin = await adminUserRoleModel.getAdminuser(_data);
        let count = await adminUserRoleModel.roleListCount(_data);
        if (useradmin) {
            returResult = adminUserRoleResponse.success('user_found', {values: useradmin, count: count});
        } else {

            returResult = adminUserRoleResponse.success('user_not_found');
        }
        return returResult;
    }
    async getmastermodule(_data) {
        let returResult;
        let modules = await adminUserRoleModel.getmastermodule(_data);
        if (modules) {
            returResult = adminUserRoleResponse.success('module_found', modules);
        } else {

            returResult = adminUserRoleResponse.success('module_not_found');
        }
        return returResult;
    }

    async getBaseRoutes(_data) {
        let returResult;
        let modules = await adminUserRoleModel.getBaseRoutes(_data);
        if (modules) {
            returResult = adminUserRoleResponse.success('module_found', modules);
        } else {

            returResult = adminUserRoleResponse.success('module_not_found');
        }
        return returResult;
    }

    async getMasterRoutes(_data) {
        let returResult;
        let modules = await adminUserRoleModel.getMasterRoutes(_data);
        if (modules) {
            returResult = adminUserRoleResponse.success('module_found', modules);
        } else {

            returResult = adminUserRoleResponse.success('module_not_found');
        }
        return returResult;
    }

    async editBaseRoutes(_data) {
        let returResult;
        let modules = await adminUserRoleModel.editBaseRoutes(_data);
        if (modules) {
            returResult = adminUserRoleResponse.success('module_found', modules);
        } else {

            returResult = adminUserRoleResponse.success('module_not_found');
        }
        return returResult;
    }

    async getRoleById(_data) {
        let returResult;
        let role = await adminUserRoleModel.getRoleById(_data);
        if (role) {
            returResult = adminUserRoleResponse.success('role_found', role);
        } else {
            returResult = adminUserRoleResponse.success('role_not_found');
        }
        return returResult;
    }
    async editRole(_data) {
        // let clientIp = _data['clientIp'];
        delete _data['clientIp'];
        let returResult;
        await adminUserRoleModel.editRole(_data);
        returResult = adminUserRoleResponse.success('useradmin_updated');
        return returResult;

    }
    async setPrivilege(_data) {
        let returResult;
        try {
            await adminUserRoleModel.setPrivilege(_data);
            returResult = adminUserRoleResponse.success("permission_created");
            return returResult;
        } catch (error) {
            console.error(error);
            adminUserRoleResponse.failed("permission_created");
        }

    }
};
