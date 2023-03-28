module.exports = class UserRoleValidator {
    createRole() {
        return {
            app_key: "required",
            role_name: "required",
            // role_description: "required",
            status: "required",
            ismerchant: "required",
            // created_at : 'required|dateValidation'
        }
    }

    getAdminuser() {
        // Define rules for varify data
        return {

        };
    }
    getmastermodule() {
        // Define rules for varify data
        return {

        };
    }
    getBaseRoutes() {
        return {}
    }
    
    getMasterRoutes() {
        return {}
    }

    editBaseRoutes() {
        return {
            module_id: "required",
            routes: "required",
            ismerchant: "required",
        }
    }
    
    getRoleById() {
        return {
            _id: "required",
        }
    }
    editRole() {
        return {
            _id:"required",
            role_name: "required",
            // role_description: "required",
            status: "required",
           // created_by: 'required'
        //    updated_at : 'required|dateValidation'
        }
    }
    setPrivilege() {
        // Define rules for varify data
        return {
            role_id:"required",
            value:"required",
        };
    }
};
