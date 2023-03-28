// using validator library is  Validatorjs
module.exports = class PushValidator {
    createPushNotifi() {
        return {
            campaignName: "required",
            campaignTags: "required",
            campaignType: "required",
        }
    }
    
}