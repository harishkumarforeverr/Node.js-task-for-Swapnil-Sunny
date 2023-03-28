// using validator library is  Validatorjs
module.exports = class AppsValidator {
    getApps() {
        return {};
    }
    init() {
        return {};
    }

    checkInstallation() {
        return {};
    }
    setstatuscreateApp() {
        return {};
    }
    createApp(type = '') {
        return {
            app_name: 'required|min:3',
        }
    }
    updateApp() {
        return {
            app_key: "required",
            app_name: 'required|min:3',
        }
    }
    getAppDatails() {
        return {
            created_by: "required",
            app_key: "required"
        }
    }
}