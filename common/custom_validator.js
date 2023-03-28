var Validator = require('validatorjs');
let moment = require('moment');

const appNameRegex = '^[a-zA-Z0-9._-]+$';
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/
Validator.register('timezone', function (timezone, requirement, attribute) { // requirement parameter defaults to null
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
        throw 'Time zones are not available in this environment';
    }

    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    }
    catch (ex) {
        return false;
    }
}, 'The :attribute is not a valid timezone.');

Validator.register('multipleValueExist', function (appTypes, requirement, attribute) {
    let app_types = requirement.split(",");
    if (Array.isArray(appTypes)) {
        let returnValue = true;
        appTypes.forEach(function (appType, index, appTypes) {
            if (app_types.indexOf(appType) == -1) {
                returnValue = false;
            }
        });
        return returnValue;
    } else {
        if (app_types.indexOf(appTypes) == -1) {
            return false;
        }
        return true;
    }
}, 'The :attribute is must be in :multipleValueExist');

Validator.register('required_if_exist_in_array', function (appTypes, requirement, attribute) {
    return false;
}, "The :attribute is required");

Validator.register('appnameValidation', function (value, requirement, attribute) { // requirement parameter defaults to null
    return value.match(appNameRegex);
}, 'Special characters not allowed except underscore');

// Validator.register('dateValidation', function (value, requirement, attribute) { // requirement parameter defaults to null
//     return moment(value, 'YYYY-MM-dd HH:mm:ss', true).isValid()
// }, 'Date format not proper');
Validator.register('passwordValidation', function (value, requirement, attribute) { // requirement parameter defaults to null
    return value.match(passwordRegex);

}, 'Password validation not matched');

