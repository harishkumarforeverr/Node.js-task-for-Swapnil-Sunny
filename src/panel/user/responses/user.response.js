let response = {
    no_file_found: {
        status: false,
        message: "no file found.",
        code: "USR_0007",
    },
    form_field_required: {
        status: false,
        message: "Form fields required.",
        code: "USR_0001",
    },
    csv_only: {
        status: false,
        message: "File must be a CSV File.",
        code: "EMP_0003",
    },
    user_found: {
        status: true,
        message: "User found.",
        code: "USR_0002",
    },
    user_not_found: {
        status: false,
        message: "User not found.",
        code: "USR_0003",
    },
    user_already_exist: {
        status: false,
        message: "User already exist.",
        code: "USR_0004",
    },
    user_created: {
        status: true,
        message: "User created.",
        code: "USR_0005",
    },
    user_updated: {
        status: true,
        message: "User details updated.",
        code: "USR_0006",
    },
    user_config_found: {
        status: true,
        message: "User config found.",
        code: "USR_0007",
    },
    user_config_not_found: {
        status: false,
        message: "User config not found.",
        code: "USR_0008",
    },
}

module.exports = response;
module.exports.success = function (key, values) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = true;
    returnResponse.values = values ? values : '';
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = false;
    returnResponse.error = (errors && errors != key) ? errors : "";
    return returnResponse;
}