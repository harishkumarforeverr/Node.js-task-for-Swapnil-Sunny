const db = require("../common/db");
// const geoip = require('geoip-lite');
// const nedb = require("../common/nedb");

exports.checkAPITokens = async function (req, res, next) {
    let url = req._parsedUrl.pathname.split("/");
    /*
    try {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        if (ip) {
            req.ip = ip;
            const geo = await geoip.lookup(ip);
            req.geo = geo;
        }
    } catch (e) {
        console.error('Error in Geo Location Fetch: ', e);
    }
    */
    if (url[2] == "sdk" && url[3] != "webhook") {
        let API_KEY = req.headers.api_key;
        if (API_KEY == global.API_KEYS['sdk']) {
            let APP_KEY = req.headers.app_key
            
            let MEMBERSHIP_NO = req.body.membership_no;
            req.app_version = req.headers.app_version;
            req.sdk_version = req.headers.sdk_version;
            req.sdk_type = req.headers.sdk_type;
            if(noAppKeyRequired.indexOf(req._parsedUrl.pathname) > -1){
                next();
            }
            else if (global.apps[APP_KEY] != undefined) {
                req.app_key = APP_KEY;
                if (noDeviceIdRequired.indexOf(req._parsedUrl.pathname) > -1) {
//
                } else {
                    // Channel Code Check [ app | pos | panel ]
                    // req.headers.channel_code = "app"
                    if (req.headers.channel_code == "app" || req.headers.channel_code == "web" || req.headers.channel_code == "pos" || req.headers.channel_code == "panel" || req.headers.channel_code == "") {
                        if (req.headers.channel_code == "app" || req.headers.channel_code == "web") {
                            let DEVICE_ID = req.headers.device_id;
                            if (DEVICE_ID == undefined) {
                                res.status(400);
                                return res.json({ 'message': 'Device ID required.' });
                            } else {
                                
                                // try{
                                //     let deviceDetails = await nedb.findDeviceData({condition: {_id:DEVICE_ID}});
                                //     if (!deviceDetails) {
                                //         throw new Error("Device not found in local db");
                                //     }
                                //     req.device_id = deviceDetails._id;
                                //     req.visitor_id = deviceDetails.visitors ? deviceDetails.visitors.active : '';
                                // }catch(err){
                                    
                                try{
                                    let deviceDetails = await checkDeviceDetails(APP_KEY, DEVICE_ID);
                                    if (!deviceDetails) {
                                        res.status(400);
                                        return res.json({ 'message': 'Invalid device id.' });
                                    }
                                    if (req.sdk_version || req.app_version) {
                                        updateDeviceDetails(APP_KEY, DEVICE_ID, {
                                            deviceDetails: deviceDetails,
                                            sdk_version: req.sdk_version,
                                            app_version: req.app_version
                                        });
                                    }
                                    req.device_id = deviceDetails.device_id;
                                    // req.visitor_id = deviceDetails.visitors ? deviceDetails.visitors.active : '';
                                // }
                                }catch(err){
                                    console.log(new Date(), "Device id check middleware error:  ",err);
                                    return res.json({ 'message': 'Invalid device id.' });
                                }
                            }
                        }

                        if(req.body.channel_code == "pos"||req.body.channel_code == "panel")
                        {
                    
                            let membershipexists = await checkVisitorDataExist(APP_KEY,MEMBERSHIP_NO)
                            if(membershipexists){
                                res.status(400);
                                res.json({ 'message': 'Membership No already exists' });
    
                            }
                           
                        
                        }
                
                    }
                    else {
                        res.status(400);
                        return res.json({ 'message': 'Invalid channel id' });
                    }

                }

                next();
            } else {
                res.status(400).send({ 'message': 'Invalid App Key.' });
            }
        } else {
            res.status(401);
            res.json({ 'message': 'Invalid request to Server' })
        }
    } else {
        next();
    }
};

let noDeviceIdRequired = [
    '/api/sdk/device/register',
    '/api/sdk/campaign_popup/getCampaignPopup',
    '/api/sdk/notification/list',
]

let noAppKeyRequired = [
    '/api/sdk/apps/refreshApps'
]

async function checkVisitorDataExist(key,data) {
   
    return db.getDB().collection(global.apps[key].app_name + '_visitor_profiles').findOne({membership_no:data});
  
}
async function checkDeviceDetails(APP_KEY, deviceId) {
    let deviceDetails = await db.getDB().collection(global.apps[APP_KEY].app_name + '_devices').find({
        device_id: deviceId
    }).toArray();
    if(deviceDetails && deviceDetails.length>0){
        return deviceDetails[0];
    }else{
        return null;
    }
}

async function updateDeviceDetails(APP_KEY, deviceId, data) {
    let pushData = {}, setData = {}, updateData = {};
    let sdkData = data.deviceDetails.sdk_version, appData = data.deviceDetails.app_version, isExist = false;
    try {
        if (data.sdk_version && sdkData) {
            if (!sdkData.length) {
                //
            } else {
                isExist = sdkData.find(v => {
                    return v.sdk_version == data.sdk_version;
                })
            }
            if (isExist) {
                pushData['sdk_version'] = { sdk_version: data.sdk_version, timestamp: new Date() };
            } else {
                setData['sdk_version'] = [{ sdk_version: data.sdk_version, timestamp: new Date() }];
            }
        }
        isExist = false;
        if (data.app_version && appData) {
            if (!appData.length) {
                //
            } else {
                isExist = appData.find(v => {
                    return v.app_version == data.app_version;
                })
            }
            if (isExist) {
                pushData['app_version'] = { app_version: data.app_version, timestamp: new Date() };
            } else {
                setData['app_version'] = [{ app_version: data.app_version, timestamp: new Date() }];
            }
        }
        if (Object.keys(pushData).length) {
            updateData['$push'] = pushData;
        }
        if (Object.keys(setData).length) {
            updateData['$set'] = setData
        }
    } catch (e) {
        console.error("Error in updateDeviceDetails: ", e);
    }
    if (!updateData['$set'] && !updateData['$push']) {
        return null;
    }
    return db.getDB().collection(global.apps[APP_KEY].app_name + '_devices').updateOne({
        device_id: deviceId,
    }, updateData);
}
