const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../common/db');
exports.checkAPITokens = async function (req, res, next) {
    let url = req._parsedUrl.pathname.split("/");
    if (url[2] == "download") {
        if (!req.headers.authorization || !req.headers.app_key) {
            res.status(401);
            res.json({ 'message': 'Headers missing.' });
            return;
        }
        let token = req.headers.authorization.split(' ')[1];
        let key = req.query.key;
        if (token && key) {
            try {
                let USER_TOKEN = token;
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
                next();
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
            res.status(400);
            return res.json({ 'message': 'Unauthorised.' });
        }
    } else {
        next();
    }
};

function clearTokenForUser(token) {
    try {
        new Promise(() => {
            db.getDB().collection('admin_user_tokens').remove({ token: token });
            if (global.token_obj) {
                for (const email in global.token_obj) {
                    if (global.token_obj[email] && global.token_obj[email][token]) {
                        delete global.token_obj[email][token];
                        break;
                    }
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
}
