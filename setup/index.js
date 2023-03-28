require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const db = require('../common/db');
(async ()=>{
    await db.connectDB();
    console.log("connected");
    let result = await db.getDB().collection('base_api_keys').find().toArray();
    if (result.length > 0){
        console.log("Already Setup");
    } else {
        await db.getDB().collection('base_api_keys').insertMany([
            {
                api_key: uuidv4(),
                'user_type':'sdk'
            },
            {
                api_key: uuidv4(),
                'user_type':'panel'
            },
            {
                api_key: uuidv4(),
                'user_type':'client'
            }
        ]);
        console.log("Auth tokens stored.");
    }
    process.exit();
})();