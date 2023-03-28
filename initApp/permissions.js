const db = require('../common/db');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));

async function getCollections(db_name){
    return db.getDB().collection(db_name).find().toArray();
}

async function checkRoutePermissions(json, cur_data) {
    let mod_data, newRoute = [], isMatch = true;
    json.forEach(async(entry) => {
        newRoute = [];
        mod_data = cur_data.find(mod => {
            return mod['module'] == entry['module'];
        })
        if (!mod_data || (mod_data && !mod_data['routes'])) {
            await db.getDB().collection('routes_permissions').insertOne(entry);
        } else {
            newRoute = mod_data['routes'];
            entry['routes'].forEach(er => {
                let cur_route = newRoute.find(nr => {
                    return nr.route == er.route;
                })
                if(!cur_route) {
                    isMatch = false;
                    newRoute.push(er);
                }
            })
            if(!isMatch){
                await db.getDB().collection('routes_permissions').updateOne({
                    module: entry['module']
                }, {
                    $set: {"routes": newRoute}
                });
            }
        }
        isMatch = true;
    });
}

async function checkMasterPermissions(json, cur_data, searchKey, dbName) {
    let cur_mod = {};
    json.forEach(async(entry) => {
        cur_mod = cur_data.find(cm => {
            return cm[searchKey] == entry[searchKey]
        })
        if (!cur_mod) {
            await db.getDB().collection(dbName).insertOne(entry);
        }
    })
}

async function checkDashboardModules(json, dbName) {
    let module_arr = json['modules'];
    await db.getDB().collection(dbName).updateOne({}, {
        $addToSet: { modules: { $each: module_arr }}
    }, {upsert: true});
}

async function checkUserRoles(json, cur_data) {
    let perm_json = Object.keys(json['permissions']), perm_cur = Object.keys(cur_data['permissions']), cur_mod = {};
    if(!perm_json.length){
        return;
    }
    if(!perm_cur.length) {
        await db.getDB().collection('admin_user_roles').updateOne({
            "role_name" : "Super Admin"
        },{
            $set: {
                "permissions": perm_json
            }
        });
        return;
    }
    let newPerm = cur_data['permissions'];
    perm_json.forEach(async(entry) => {
        cur_mod = perm_cur.find(pc => {
            return pc == entry
        })
        if (!cur_mod) {
            newPerm[entry] = json['permissions'][entry];
        }
    })
    await db.getDB().collection('admin_user_roles').updateOne({
        "role_name" : "Super Admin"
    },{
        $set: {
            "permissions": newPerm
        }
    });
}

async function checkPermissions() {
    let admin_user_roles = await db.getDB().collection('admin_user_roles').findOne({"role_name" : "Super Admin"});
    let routes_permissions = await getCollections('routes_permissions');
    let module_master = await getCollections('module_master');
    let master_routes = await getCollections('master_routes');

    let admin_user_roles_json = require("./initial_data/user_role.json");
    let routes_permissions_json = require("./initial_data/routes_permissions.json");
    let module_master_json = require("./initial_data/module_master.json");
    let master_routes_json = require("./initial_data/master_routes.json");
    let dashboard_modules_json = require("./initial_data/dashboard_modules.json");
    await checkDashboardModules(dashboard_modules_json, 'dashboard_modules');
    if (!module_master || (module_master && !module_master.length)) {
        console.log('module_master inserted');
        await db.getDB().collection('module_master').insertMany(module_master_json);
    }
    else {
        await checkMasterPermissions(module_master_json, module_master, 'module_name', 'module_master');
    }
    if (!master_routes || (master_routes && !master_routes.length)) {
        console.log('master_routes inserted');
        await db.getDB().collection('master_routes').insertMany(master_routes_json);
    }
    else {
        await checkMasterPermissions(master_routes_json, master_routes, 'route_name', 'master_routes');
    }
    if (!admin_user_roles) {
        console.log('admin_user_roles inserted');
        let result = await db.getDB().collection('admin_user_roles').insertOne(admin_user_roles_json);

        await db.getDB().collection('admin_users').insertMany([
            {
                name:"Administrator",
                email:"admin@makesense.com",
                password:  bcrypt.hashSync("makesense", salt),
                username:"Administrator",
                global_admin:true,
                role_id: result.insertedId.toString(),
            }
        ]);
    }
    else {
        await checkUserRoles(admin_user_roles_json, admin_user_roles);
    }
    if (!routes_permissions || (routes_permissions && !routes_permissions.length)) {
        console.log('routes_permissions inserted');
        await db.getDB().collection('routes_permissions').insertMany(routes_permissions_json);
    }
    else {
        await checkRoutePermissions(routes_permissions_json, routes_permissions);
    }
    let collectionCreate = await db.getDB().listCollections({name: 'admin_users'}).hasNext();
    if (!collectionCreate) {
        await db.getDB().createCollection('admin_users', {
            "validator": { "$jsonSchema" : {
                required: ["nrid"],
                properties: {
                    birth_date: { bsonType: 'date' },
                },
            }}
        });
        console.info('Created collection admin_users');
    }
    const system_events = await db.getDB().collection('system_events').find().toArray();
    const system_events_json = require('./initial_data/system_events.json');
    if (!(system_events && system_events.length)) {
        await db.getDB().collection('system_events').insertMany(system_events_json);
    } else {
        await checkMasterPermissions(system_events_json, system_events, 'key', 'system_events');
    }

    const master_attribute = await db.getDB().collection('master_attribute').find().toArray();
    const master_attribute_json = require('./initial_data/master_attribute.json');
    if (!(master_attribute && master_attribute.length)) {
        await db.getDB().collection('master_attribute').insertMany(master_attribute_json);
    } else {
        await checkMasterPermissions(master_attribute_json, master_attribute, 'key', 'master_attribute');
    }

    const apps = await db.getDB().collection('apps').find().project({ app_name : 1 }).toArray();
    apps.forEach(async (app) => {
        const all_events = await db.getDB().collection(app.app_name + '_events').find().toArray();
        if (!(all_events && all_events.length)) {
            await db.getDB().collection(app.app_name + '_events').insertMany(system_events_json);
        } else {
            await checkMasterPermissions(system_events_json, all_events, 'key', app.app_name + '_events');
        }
    });
    const system_segments = await db.getDB().collection('system_segments').find().toArray();
    const system_segments_json = require('./initial_data/system_segments.json');
    if (!(system_segments && system_segments.length)) {
        await db.getDB().collection('system_segments').insertMany(system_segments_json);
    } else {
        await checkMasterPermissions(system_segments_json, system_segments, 'key', 'system_segments');
    }
    await initCrons();
}

async function initCrons(){
    console.log("Crons Initialization start...");
    let crons_json = require('./initial_data/crons.json');
    let app_keys = Object.keys(global.apps);
    for (let aki = 0; aki < app_keys.length; aki++){
        if(app_keys[aki] == undefined || app_keys[aki] == null || app_keys[aki] == 0 || app_keys[aki] == ''){
            continue;
        }
        let cronRecords = await db.getDB().collection('cron_scheduled').find({app_key: app_keys[aki]}).toArray();
        if(cronRecords.length > 0){
            let cronsData = crons_json.filter((cj) => {
                let i=0;
                for(;i<cronRecords.length;i++){
                    if(cronRecords[i].cronFor == cj.cronFor){
                        break;
                    }
                }
                if(i == cronRecords.length){
                    cj.app_key = app_keys[aki];
                    return cj;
                }
            });
            if(cronsData.length>0){
                try{
                    await db.getDB().collection("cron_scheduled").insertMany(cronsData);
                }catch(err){
                    //
                }
            }
        }else{
            let cronsData = crons_json.map((cj) => {
                cj.app_key = app_keys[aki];
                return cj;
            });
            if(cronsData.length>0){
                try{
                    await db.getDB().collection("cron_scheduled").insertMany(cronsData);
                }catch(err){
//
                }
            }
        }
    }
    console.log("Crons Initialized...");
}

module.exports.checkPermissions = checkPermissions;
module.exports.initCrons = initCrons;