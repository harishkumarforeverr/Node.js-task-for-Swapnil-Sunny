// using validator library is  Validatorjs
module.exports = class UserValidator {
    createUser() {
        return {
            first_name: "required",
            last_name: "required",
            membership_no: "required",
            email: "required|email",
            country_code: "required",
            phone: "required",
            country: "required",
            status: "required",
        }
    }
    createUsersFromCsv() {
        return {
            files: "required",
        }
    }

    analyseUsers() {
        return {
            analysisPool: "required",
            analysisOver: "required",
        };
    }

    modifyUser() {
        return {
            first_name: "required",
            status: "required",
            user_id: "required",
        }
    }

    getUserEvents() {
        return {
            user_id: "required",
        }
    }

    getAttributeMaster() {
        return {}
    }

    editAttributeMaster() {
        return {
            config_key: "required",
            configuration: "required",
        }
    }

    usersList() {
        return {};
    }

    getProfile() {
        return {
            user_id: "required",
        }
    }
}