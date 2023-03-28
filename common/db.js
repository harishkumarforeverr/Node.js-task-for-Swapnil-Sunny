
const dbObject = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
};

const {MongoClient} = require('mongodb');
const mongodbConnection = MongoDBConnectionString();
const dbName = dbObject.name;
const ObjectId = require('mongodb').ObjectId;

const RECONNECT_INTERVAL = 1000;
const RECONNECT_TRIES = 100;
const CONNECT_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
var mongoConnectionTryinng = 0;

function MongoDBConnectionString(){
    let connectionURI = "mongodb://";
    if (dbObject.user || dbObject.password) {
        connectionURI += (dbObject.user + ':' + encodeURIComponent(dbObject.password) + '@');
    }
    connectionURI += dbObject.host+":"+dbObject.port+"/"+dbObject.name;
    return connectionURI;
}

const onClose = () => {
    console.info('onClose');
    console.log('MongoDB connection was closed');
};

const onReconnect = () => {
    console.info('onReconnect');
    for (let i = 0; i < reconnectTriesTimeoutArry.length; i++) {
        clearTimeout(reconnectTriesTimeoutArry[i]);
    }
    reconnectTriesTimeoutArry = [];
    global.eventEmitter.emit("dbConnected");
    console.log('MongoDB reconnected');
};
var _db;
var _client;
var reconnectTriesTimeoutArry = [];
const connectWithRetry = async (callback) => {
    const client = new MongoClient(mongodbConnection);
    /*
    MongoClient.connect(
        mongodbConnection,
        CONNECT_OPTIONS,
        (err, client) => {
            if (err) {
                reconnectTriesTimeoutArry.push(setTimeout(() => connectWithRetry(callback), RECONNECT_INTERVAL * RECONNECT_TRIES));
            } else {
                _client = client;
                _db = client.db(dbName);
                _db.on('close', onClose);
                _db.on('reconnect', onReconnect);
                console.log('MongoDB connected successfully', new Date());
                callback();
            }
        }
    );
    */
    try {
        await client.connect();
        _client = client;
        _db = client.db(dbName);
        client.on('reconnect', onReconnect);
        client.on('close', onClose);
        // need to verify these 2 events
        console.log('MongoDB connected successfully', new Date());
        callback();
    } catch (e) {
        console.log(e);
        reconnectTriesTimeoutArry.push(setTimeout(() => connectWithRetry(callback), RECONNECT_INTERVAL * RECONNECT_TRIES));
    }
};

module.exports = {
    connectWithRetry,
    getDB: function () {
        return _db;
    },
    getClient: function () {
        return _client;
    },
    connectDB: async function() {
        console.log("Mongodb trying to connect:", mongoConnectionTryinng, 'time: ', new Date());
        if (mongoConnectionTryinng == 0) {
            mongoConnectionTryinng++;
            // eslint-disable-next-line no-unused-vars
            var result = await new Promise((resolve, _reject) => {
                // eslint-disable-next-line no-unused-vars
                connectWithRetry(async function (_err) {
                    mongoConnectionTryinng = 0;
                    resolve(true);
                });
            });
            return result;
        }
    },
    ObjectId: ObjectId,
    shardCollections: async function(data) {
        try{
            let foundIndex = 0;
            let getIndex = await _db.collection(data.collection).indexes({});
            getIndex.forEach(element => {
                if (element.name == data.indexKey + "_hashed") {
                    foundIndex = 1;
                }
            });
            if (foundIndex == 0) {
                await _db.collection(data.collection).createIndex({ [data.indexKey]: 'hashed' });
            }
            await _db.admin().command({
                shardCollection: process.env.DB_NAME + "." + data.collection,
                key: {[data.indexKey]: "hashed"}
            });
        } catch(err) {
            // console.log(err);   
        }
    }
}