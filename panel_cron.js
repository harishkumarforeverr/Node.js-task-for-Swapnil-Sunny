// token cron
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require("./common/db");
const Cron = require("node-cron");

async function globalInsert() {
    try {
        let found_users = {}, user;
        console.info('Inserting tokens into global');
        let expired_ids = [], user_not_found = [];
        const userTokensCursor = await db.getDB().collection('admin_user_tokens').find();
        for await (const doc of userTokensCursor) {
            const token = doc.token;
            if (found_users[String(doc.user_id)]) {
                user = found_users[String(doc.user_id)];
            } else {
                user = await db.getDB().collection('admin_users').findOne({ _id: doc.user_id });
            }
            try {
                if (user && user.email) {
                    found_users[String(doc.user_id)] = user;
                    const decipher = crypto.createDecipher('aes192', process.env.ENC_KEY);
                    let decrypted = decipher.update(token, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    const USER_TOKEN = decrypted;
                    jwt.verify(USER_TOKEN, process.env.JWT_KEY);
                    if (!global.token_obj[user.email]) {
                        global.token_obj[user.email] = {};
                    }
                    global.token_obj[user.email][token] = 1;
                } else {
                    user_not_found.push(doc.user_id);
                }
            } catch (e) {
                console.error('Error in decoding token: ', e);
                if (e.name == 'TokenExpiredError' || e.code == 'ERR_OSSL_EVP_WRONG_FINAL_BLOCK_LENGTH') {
                    expired_ids.push(doc._id);
                    if (user && user.email) {
                        if (global.token_obj[user.email]) {
                            delete global.token_obj[user.email][token];
                        }
                    } else {
                        user_not_found.push(doc.user_id);
                    }
                }
            }
        }
        console.info('Userless Tokens:', user_not_found.length, '& expired:', expired_ids.length);
        if (user_not_found.length) {
            await db.getDB().collection('admin_user_tokens').deleteMany({ user_id: {$in: user_not_found} });
        }
        if (expired_ids.length) {
            await db.getDB().collection('admin_user_tokens').deleteMany({ _id: {$in: expired_ids} });
        }
        console.info('Tokens inserted into global');
    } catch (e) {
        console.error('Error in expired token removal cron: ', e);
    }
}

async function removeExpiredTokens() {
    const cron =  {
        "minutes": "0",
        "hour": "*/6",
        "day": "*",
        "month": "*",
        "week_day": "*"
    };
    let cronString = cron.minutes + " " + cron.hour + " " + cron.day + " " + cron.month + " " + cron.week_day;
    if (!global.token_obj) {
        global.token_obj = {};
    }
    Cron.schedule(cronString, async function() {
        console.info('Running token removal cron');
        try {
            let tokens_to_remove = [];
            if (global.token_obj) {
                for (const email in global.token_obj) {
                    for (const token in global.token_obj[email]) {
                        if (global.token_obj[email][token]) {
                            try {
                                let USER_TOKEN = token;
                                const decipher = crypto.createDecipher('aes192', process.env.ENC_KEY);
                                let decrypted = decipher.update(USER_TOKEN, 'hex', 'utf8');
                                decrypted += decipher.final('utf8');
                                USER_TOKEN = decrypted;
                                const decoded = jwt.verify(USER_TOKEN, process.env.JWT_KEY);
                                if (decoded && decoded.exp && !isNaN(Number(decoded.exp))) {
                                    const now = new Date().getTime();
                                    if (now > (1000 * Number(decoded.exp)) ) {
                                        tokens_to_remove.push(global.token_obj[email][token]);
                                        delete global.token_obj[email][token];
                                    }
                                }
                            } catch (e) {
                                console.error('Error in decrypting token',e);
                                if (e.name == 'TokenExpiredError') {
                                    tokens_to_remove.push(global.token_obj[email][token]);
                                    delete global.token_obj[email][token];
                                }
                            }
                        }
                    }
                }
            }
            console.info('Total unused tokens found =', tokens_to_remove.length);
            if (tokens_to_remove.length) {
                await db.getDB().collection('admin_user_tokens').remove({ token: {$in: tokens_to_remove} });
            }
        } catch (e) {
            console.error('Error in token removal cron: ', e);
        }
        globalInsert();
    });
}

module.exports.removeExpiredTokens = removeExpiredTokens;
module.exports.globalInsert = globalInsert;