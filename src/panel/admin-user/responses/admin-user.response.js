let response = {
    form_field_required: {
        status: false,
        message: "Form fields required",
        code: "EMP_0001",
    },
    file_format_not_valid: {
        status: false,
        message: "File Format is Not Valid",
        code: "FLE_0001",
    },
    login_success: {
        status: true,
        message: "Login success.",
        code: "USR_0001",
    },
    login_failed: {
        status: false,
        message: "Incorrect Username/Password",
        code: "USR_0001",
    },
    too_many_login_attempts: {
        status: false,
        message: "Too many failed login attempts. Please try again in 30 minutes",
        code: "USR_0011",
    },
    login_failed_due_to_Status: {
        status: false,
        message: "The Email address is incorrect or discontinued.",
        code: "USR_0001",
    },
    add_user_failed: {
        status: false,
        message: "Invalid User",
        code: "USR_0001",
    },
    add_user_success: {
        status: true,
        message: "User Created Successfully",
        code: "USR_0001",
    },
    edit_user_failed: {
        status: false,
        message: "Invalid User",
        code: "USR_0001",
    },
    edit_password_failed: {
        status: false,
        message: "Password update failed",
        code: "USR_0001",
    },
    edit_user_success: {
        status: true,
        message: "User updated Successfully",
        code: "USR_0001",
    },
    users_found: {
        status: true,
        message: "Apps Found",
        code: "APP_0002",
    },
    users_not_found: {
        status: true,
        message: "Users Not Found",
        code: "APP_0003",
    },
    otp_created: {
        status: true,
        otp_generated: true,
        message: "OTP sent to mail",
        code: "APP_0004",
    },
    otp_not_created: {
        status: false,
        message: "OTP not generated",
        code: "APP_0005",
    },
    otp_verified: {
        status: true,
        message: "OTP verified successfully",
        code: "APP_0006",
    },
    otp_not_verified: {
        status: false,
        message: "OTP not verified",
        code: "APP_0007",
    },
    email_not_found: {
        status: false,
        message: "Email not found",
        code: "APP_0008"
    },
    module_not_found: {
        status: true,
        message: "module Not Found",
        code: "APP_0004",
    },
    module_found: {
        status: true,
        message: "module Found",
        code: "APP_0005",
    },
    config_not_found: {
        status: false,
        message: "Sendgrid Configuration Not Found",
        code: "APP_0009",
    },
    otp_expired: {
        status: false,
        otp_generated: false,
        message: "OTP has expired",
        code: "OTP_0001",
    },
    incorrect_otp: {
        status: false,
        otp_generated: true,
        message: "Incorrect OTP entered",
        code: "OTP_0001",
    },
    wait_for_new_OTP: {
        status: false,
        otp_generated: false,
        message: "Please wait 1 minute before requesting a new OTP",
        code: "OTP_0002",
    },
}

module.exports = response;
module.exports.success = function (key, values) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = true;
    returnResponse.values = values ? values : "";
    return returnResponse;
}
module.exports.failed = function (key, errors) {
    let returnResponse = response[key] == undefined ? {} : response[key];
    returnResponse.status = false;
    returnResponse.error = (errors && errors != key) ? errors : "";
    return returnResponse;
}