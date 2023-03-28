const { getIpAddress, decrypt, ignoreIdentifer, decodeParams, isEqualsJson, hasNullToStringNUll } = require('../common/common_methods');
exports.identifierDecrypt = function (req, res, next) {
    let ipAddress = getIpAddress(req)
    req.headers['ipNew'] = ipAddress;
    if (req.headers['user_token'] && req.headers['user_token'] != 'null') {
        req.headers['user_token'] = decrypt(req.headers['user_token']);
    }
    let url = String(req.url)
    let checkurl = url
    if (checkurl.length > 1) {
        if (ignoreIdentifer(checkurl)) {
            next()
        } else {

            if (req.headers && req.headers.identifier) {
                if (req.method == 'GET') {

                    //check if department name then decode it becasue of F&B
                    if (req.query['department_name']) {
                        req.query = decodeParams(req.query)
                    }


                    let params = Object.fromEntries(new URLSearchParams(decrypt(req.headers.identifier)));
                    if (isEqualsJson(req.query, params)) {
                        // replace single quotes
                        Object.keys(req.query).map(obj => {
                            if (req.query[obj].indexOf("'") > -1) {
                                req.query[obj] = req.query[obj].replace(/'/g, "\\'");
                            }
                        });
                        next()
                    } else {
                        res.status(405);
                        res.json({
                            status: false,
                            statusCode: 405,
                            message: "Not Allowed"
                        })
                    }

                }
                if (req.method == 'POST' || req.method == 'PUT') {
                    if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
                        let post_body = JSON.stringify(req.body);
                        let identifier_body = decrypt(req.headers.identifier);
                        //req.body = req.body
                        if (isEqualsJson(post_body, identifier_body)) {
                            next()
                        } else {
                            console.log("AAAAAAAAAAAAAAAAAAAAA");
                            res.status(405);
                            res.json({
                                status: false,
                                statusCode: 405,
                                message: "Not Allowed"
                            })
                        }
                    } if (req.is('multipart/form-data')) {
                        var post_body = {}
                        Object.assign(post_body, req.body)
                        if (post_body['attachment']) {
                            delete post_body['attachment']
                        }
                        //if master activity
                        if (checkurl.includes("addRuleActivity")) {
                            post_body['lob'] = JSON.parse(post_body['lob'])
                            post_body['data_array'] = JSON.parse(post_body['data_array'])
                            for (let i = 0; i < post_body['data_array'].length; i++) {
                                delete post_body['data_array'][i]['image']
                            }
                            post_body['lob'] = JSON.stringify(post_body['lob'])
                            post_body['data_array'] = JSON.stringify(post_body['data_array'])

                        } if (checkurl.includes("editRuleActivity")) {
                            post_body['lob'] = JSON.parse(post_body['lob'])
                            post_body['data_array'] = JSON.parse(post_body['data_array'])
                            for (let i = 0; i < post_body['data_array'].length; i++) {
                                delete post_body['data_array'][i]['image']
                            }

                            post_body['lob'] = JSON.stringify(post_body['lob'])
                            post_body['data_array'] = JSON.stringify(post_body['data_array'])
                        }

                        let identifier_body = decrypt(req.headers.identifier);
                        identifier_body = JSON.parse(identifier_body)
                        identifier_body = hasNullToStringNUll(identifier_body)
                        if (isEqualsJson(post_body, identifier_body)) {
                            next()
                        } else {
                            console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBB");
                            res.status(405);
                            res.json({
                                status: false,
                                statusCode: 405,
                                message: "Not Allowed"
                            })
                        }
                    }

                }
            } else {
                res.status(405);
                res.json({
                    status: false,
                    statusCode: 405,
                    message: "Not Allowed Try Again Later"
                })
            }
        }
    }
}