let response = {
    form_field_required: {
        status: false,
        message: "Form fields required",
        code: "APP_0001",
    },
    file_format_not_valid: {
        status: false,
        message: "File Format is Not Valid",
        code: "FLE_0001",
    },
    apps_found: {
        status: true,
        message: "Apps Found",
        code: "APP_0002",
    },
    apps_not_found: {
        status: true,
        message: "Apps Not Found",
        code: "APP_0003",
    },
    init_found: {
        status: true,
        message: "Initial info found",
        code: "APP_0004",
    },
    init_not_found: {
        status: true,
        message: "Initials info not found",
        code: "APP_0005",
    },
    app_exist: {
        status: false,
        message: "App information already exist.",
        code: "APP_0006",
    },
    app_created: {
        status: false,
        message: "App created.",
        code: "APP_0007",
    },
    app_found: {
        status: true,
        message: "App found.",
        code: "APP_0008",
    },
    app_not_found: {
        status: false,
        message: "App not found.",
        code: "APP_0009",
    },
    app_updated: {
        status: false,
        message: "App Updated.",
        code: "APP_0010"
    },
    upload_media_success: {
        status : true,
        message : "media uploaded successfully",
        code : "UPD_0001"
    },

    upload_media_error: {
        status: true,
        message: "media upload error",
        code: "UPD_0002",
    },
    upload_media_error_filesize: {
        status: true,
        message: "media size error",
        code: "UPD_0003",
    }

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