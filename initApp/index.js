const db = require('../common/db');
const panel_cron = require('../panel_cron');

exports.appInitialization = async function () {
    console.log("App Initialization Start", new Date());
    console.log("Connecting DB", new Date());
    require("../common/custom_validator");
    await db.connectDB();
    console.log("Getting user auth token");
    let apiKeys = await db.getDB().collection('base_api_keys').find().toArray();
    let newKeys = checkandGetNewAPIKeys(apiKeys);
    if (newKeys.length > 0) {
        await db.getDB().collection('base_api_keys').insertMany(newKeys);
        apiKeys = await db.getDB().collection('base_api_keys').find().toArray();
    }
    global.token_obj = {};
    try {
        const apiKeys_arr = apiKeys;
        global.API_KEYS = [];
        for (let apiKey of apiKeys_arr) {
            global.API_KEYS[apiKey.user_type] = apiKey.api_key;
        }

    } catch (err) {
        process.exit(1);
    }

    console.log("Getting  Apps");
    let apps = await db.getDB().collection('apps').find().toArray();
    try {
        const apps_arr = apps;
        global.apps = [];
        for (let app of apps_arr) {
            global.apps[app.app_key] = app;
            await fetchingEvents(app.app_key);
            await updateTransactionReportProcessStatus(app.app_key);
            await indexCollections(app.app_key);
        }
    } catch (err) {
        process.exit(1);
    }
    await panel_cron.globalInsert();
    console.log("App Initialization End", new Date());
};

exports.shardDefaultCollections = shardDefaultCollections;

function checkandGetNewAPIKeys(apiKeys) {
    const keyFor = ["sdk", "panel", "client", "thirdparty"];
    apiKeys.forEach(element => {
        const index = keyFor.indexOf(element.user_type);
        if (index > -1) {
            keyFor.splice(index, 1);
        }
    });
    const newKeys = [];
    keyFor.forEach(kf => {
        switch (kf) {
            case "sdk":
                newKeys.push({
                    "api_key": process.env.SDK_API_KEY,
                    "user_type": "sdk"
                });
                break;
            case "panel":
                newKeys.push({
                    "api_key": process.env.PANEL_API_KEY,
                    "user_type": "panel"
                });
                break;
            case "client":
                newKeys.push({
                    "api_key": process.env.CLIENT_API_KEY,
                    "user_type": "client"
                });
                break;
            case "thirdparty":
                newKeys.push({
                    "api_key": process.env.THIRD_PARTY_API_KEY,
                    "user_type": "thirdparty"
                });
                break;
        }
    });
    return newKeys;

}

async function fetchingEvents(app_key) {
    try {
        let events = await db.getDB().collection(global.apps[app_key].app_name + '_events').find().toArray();
        for(let i=0;i< events.length; i++){
            if(global.events ==undefined){
                global.events =[];
            }
            global.events[events[i].key] = events[i];
        }
    }catch(err){
        console.log(err);
    }
}

async function indexCollections(app_key) {
    try {
        let transacKey = await db.getDB().collection(global.apps[app_key].app_name + "_events").findOne({ key: "transaction" });
        if (transacKey && transacKey._id) {
            let dbName = `${global.apps[app_key].app_name}_${transacKey._id}_drill_events`;
            const indexes = [
                "segmentation.bill_number",
                "segmentation.loyalty_id",
                "segmentation.store_code",
                "segmentation.partner_code",
                "segmentation.bill_date"
            ];
            createIndexToCollection(dbName, indexes);
        }
    } catch(err) {
        console.log('Error in Transaction index: ' + err);
    }
}

async function createIndexToCollection(dbName, indexes) {
    try{
        for (let i = 0; i < indexes.length; i++) {
            const element = indexes[i];
            await db.getDB().collection(dbName).createIndex({[element]: 1});
        }
    } catch(err) {
        console.log('Error in Indexing: ' + err);
    } 
}

async function updateTransactionReportProcessStatus(app_key){
    try{
        await db.getDB().collection(global.apps[app_key].app_name + "_transaction_report").updateMany({process_status:"processing"},{$set:{'process_status':'error'}});
    }catch(err){
        //
        console.log(err);
    }
}

async function shardDefaultCollections(app_key){
    console.log("Start sharding collection", new Date());
    try {
        let collections = [
            {
                name:"visitor_profiles",
                key:"membership_no"
            },
            {
                name:"devices",
                key:"device_id"
            },
            {
                name:"audit_logs",
                key:"module_name"
            },
            {
                name:"events",
                key:"key"
            },
            {
                name:"cohort_history",
                key:"user_id"
            }
        ];
        for (let collection of collections) {
            try{
                await db.getDB().createCollection(global.apps[app_key].app_name+"_"+collection.name);
            }catch(err){
            //
            }
            // let collection = collections[i]; 
            await db.shardCollections({
                collection:global.apps[app_key].app_name+"_"+collection.name,
                index:{[collection.key]:"hashed"},
                indexExtra:{unique:true},
                indexKey:collection.key
            });
        }

    }catch(err){
        console.log(err);
    }
    console.log("End sharding collection");
}