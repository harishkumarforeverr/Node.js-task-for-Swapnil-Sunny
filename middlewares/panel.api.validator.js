var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../common/db');
exports.checkAPITokens = function (req, res, next) {
    let url = req._parsedUrl.pathname.split('/');
    if (url[2] === 'panel') {
        const params = {
            ...req.body,
            ...req.query,
        };
        for (const key in params) {
            let param = params[key] || '';
            try {
                param = decodeURIComponent(param);
            } catch (e) {
                //
            }
            let parsed = {};
            try {
                parsed = JSON.parse(param);
            } catch (e) {
                //
            }
			if(parsed == null){
				parsed = '';
			}
            if (
                (url.includes('createCampaign') && key == 'body') ||
                (url.includes('createTemplate') && key == 'body') ||
                (url.includes('updateTemplate') && key == 'body') ||
                (url.includes('getVisitorsForEvent') && key == 'spec_date') ||
                (url.includes('graphql')) ||
                (url.includes('editProfilePassword')) ||
                (key == 'password') ||
                (url.includes('getEventCountByName') && key == 'event_name')
            ) {
                // allow
            } else if (typeof(parsed) == 'object' && Object.keys(parsed).length) {
                for (const key2 in parsed) {
                    if (typeof(parsed[key2]) == 'string' && /[!#$^*&;<>?]/.test(parsed[key2])) {
                        res.status(400);
                        return res.json({ 'message': 'Special characters not allowed.' });
                    }
                }
            } else if (param) {
                if (typeof(param) == 'string' && /[!#$^*&;()<>?]/.test(param)) {
                    res.status(400);
                    return res.json({ 'message': 'Special characters not allowed.' });
                }
            }
        }
        let API_KEY = req.headers.api_key;
        if (API_KEY === global.API_KEYS['panel']) {
            if (noAuthRequired.indexOf(req._parsedUrl.pathname) == -1) {
                try {
                    let USER_TOKEN = req.headers.authorization.split(' ')[1];
                    if (global.token_obj) {
                        let token_check = false;
                        for (const email in global.token_obj) {
                            if (global.token_obj[email] && global.token_obj[email][USER_TOKEN]) {
                                token_check = true;
                                break;
                            }
                        }
                        if (!token_check) {
                            res.status(401);
                            res.json({ 'message': 'Unautherized user3.' });
                            return;
                        }
                    }
                    const decipher = crypto.createDecipher('aes192', process.env.ENC_KEY);
                    let decrypted = decipher.update(USER_TOKEN, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    USER_TOKEN = decrypted;
                    var decoded = jwt.verify(USER_TOKEN, process.env.JWT_KEY);
                    req.user_id = decoded._id;
                    if (noAppKeyRequired.indexOf(req._parsedUrl.pathname) == -1) {
                        let APP_KEY = req.headers.app_key;
                        if (global.apps[APP_KEY] != undefined) {
                            req.app_key = APP_KEY;
                            next();
                        } else {
                            res.status(400);
                            res.json({ 'message': 'Invalid App Key.' });
                        }
                    } else {
                        next();
                    }
                } catch (err) {
                    res.status(401);
                    if (err.name == 'TokenExpiredError') {
                        clearTokenForUser(req.headers.authorization);
                        res.json({ 'message': 'Token Expired. Please login again.' });
                    } else {
                        res.json({ 'message': 'Unautherized user1.' });
                    }
                }
            } else {
                next();
            }
        } else {
            res.status(401);
            res.json({ 'message': 'Unautherized user2.' })
        }
    } else {
        next();
    }

}

function clearTokenForUser(authorization) {
    try {
        let USER_TOKEN = authorization.split(' ')[1];
        new Promise(() => {
            db.getDB().collection('admin_user_tokens').remove({ token: USER_TOKEN });
            if (global.token_obj) {
                for (const email in global.token_obj) {
                    if (global.token_obj[email] && global.token_obj[email][USER_TOKEN]) {
                        delete global.token_obj[email][USER_TOKEN];
                        break;
                    }
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
}

var noAuthRequired = [
    '/api/panel/admin-user/login',
    '/api/panel/admin-user/loginWithOTP',
    '/api/panel/admin-user/generate_otp',
    '/api/panel/admin-user/editPassword',
    '/api/panel/visitor/countupdate',
    '/api/panel/campaign/modifyConsent',
    '/api/panel/admin-user/verify_otp',
    '/api/panel/apps/checkInstallation',
];

var noAppKeyRequired = [
    '/api/panel/apps/list',
    '/api/panel/apps/createApp',
    '/api/panel/visitor/countupdate',
    '/api/panel/campaign/modifyConsent',
    '/api/panel/apps/initial_info',
    '/api/panel/admin-user/login',
    '/api/panel/admin-user/loginWithOTP',
    '/api/panel/apps'
];