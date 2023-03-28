let response = {
    form_field_required: {
        status: false,
        message: "Form fields required",
        code: "EMP_0001",
    },
    event_created : {
        status : true,
        message : "Event created",
        code : "EMP_0002"
    },
    event_not_found : {
        status : false,
        message : "Event Not Found",
        code : "EMP_0003"
    },
    event_found : {
        status : true,
        message : "Event Found",
        code : "EMP_0004"
    },
    event_status_update_failed : {
        status : false,
        message : "Event Status Update Failed",
        code : "EMP_0005"
    },
    event_status_update_success : {
        status : true,
        message : "Event Status Update Success",
        code : "EMP_0006"
    },
    event_pattern_added_success:{
        status : true,
        message : "Event Pattern Added Success",
        code : "EMP_0007"
    },
    event_pattern_added_failed : {
        status : false,
        message : "Event Pattern Adding Fail",
        code : "EMP_0007"
    },
    event_pattern_found : {
        status : true,
        message : "Event Pattern Found",
        code : "EMP_0008"
    },
    event_pattern_not_found : {
        status : false,
        message : "Event Pattern Not Found",
        code : "EMP_0009"
    },
    event_pattern_already_exists : {
        status : false,
        message : "Event Pattern Already Exists",
        code : "EMP_0010"
    },
    event_pattern_data_found : {
        status : true,
        message : "Event Pattern Data Found",
        code : "EMP_0011"
    },
    visitor_found : {
        status : true,
        message : "Visitor Found",
        code : "EMP_0013"
    },
    visitor_not_found : {
        status : false,
        message : "Visitor Not Found",
        code : "EMP_0014"
    },
    event_pattern_data_not_found : {
        status : false,
        message : "Event Pattern Data Not Found",
        code : "EMP_0012"
    },
    event_status_deleted_successfully : {
        status : true,
        message : "Event Pattern Deleted Successfully",
        code : "EMP_0011"
    },
    event_status_deleted_failed : {
        status : false,
        message : "Event Pattern Deleted Failed",
        code : "EMP_0012"
    }
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