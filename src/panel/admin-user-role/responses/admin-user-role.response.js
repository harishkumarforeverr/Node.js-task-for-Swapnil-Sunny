let response = {
    form_field_required: {
        status: false,
        message: "Form fields required",
        code: "ROLE_0001",
    },
    role_created : {
        status : true,
        message : "Role created successfully",
        code : "ROLE_0002"
    },
    role_creation_failed:{
        status : false,
        message : "Role creation failed,",
        code : "ROLE_0003"
    },
    role_found: {
        status: true,
        message: "Role Found",
        code: "ROLE_0004",
    },
    role_not_found: {
        status: true,
        message: "Role Not Found",
        code: "ROLE_0005",
    },
    permission_created: {
        status: true,
        message: "created ",
        code: "ROLE_0006",
    },

}

module.exports = response;
module.exports.success = function (key, values) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = true;
    values ? returnResponse.values = values : "";
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = false;
    errors && errors != key ? returnResponse.error = errors : "";
    return returnResponse;
}