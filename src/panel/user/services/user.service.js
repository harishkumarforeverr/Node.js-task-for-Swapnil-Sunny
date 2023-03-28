let userResponse = require("../responses/user.response");
let userModel = new (require("../models/user.model"))();
const db = require('../../../../common/db');
const reader = require('xlsx');
let path = require("path");
const mkdirp = require('mkdirp');
const csv = require('csvtojson');

module.exports = class UserService {

    constructor() {
        //
    }

    async createUser(data) {
        let returResult;
        let error = {};
        let users = await db.getDB().collection(global.apps[data.app_key].app_name + '_users').findOne({ membership_no: data.membership_no });
        if (users) {
            if (users.membership_no == data.membership_no) {
                error = { membership_no: "User already exists." };
                returResult = userResponse.failed('User already exists.', error);
            }
        } else {
            data.timestamp = new Date();
            let user = await userModel.createUser(data);
            returResult = userResponse.success('user_created', user);
        }
        return returResult;
    }

    async UploadFileDB(duplicates, filePath, length, appkey) {
        let totalcount = length + duplicates.length;
        let timestamp = new Date();
        let response = await userModel.UploadFileDB(filePath, appkey, totalcount, timestamp, duplicates.length, length);
        if (response) {
            let send_data = response["ops"][0];
            send_data["app_key"] = appkey;
            if (duplicates.length) {
                this.filewrite(duplicates, send_data);
            }
        } else {
            response = userResponse.failed('report_not_created')
        }
        return response;
    }

    async filewrite(data, send_data) {
        await mkdirp(path.join(global.appRoot, ('uploads/rejectfile')));
        let fileName = "./uploads/rejectfile/" + send_data._id + ".xlsx";
        const ws = reader.utils.json_to_sheet(data);
        const wb = reader.utils.book_new();
        reader.utils.book_append_sheet(wb, ws, 'Sheet1');
        reader.writeFile(wb, fileName);
        let path_file = fileName.substr(1);
        await userModel.updateUploadFileDB(path_file, send_data._id, send_data.app_key);
    }

    async createUsersFromCsv(data, file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject();
            }
            this.uploadFile(file, async (fp) => {
                let result;
                if (fp.filePath) {
                    let filePath = fp.filePath;
                    result = await this.bulkCreateUser(data, filePath, fp.filename);
                }
                resolve(result);
            });
        });
    }

    async uploadFile(file, callback) {
        if (!file) {
            callback({});
            return;
        }
        let sampleFile = file;
        let sampleFilename = sampleFile.name.replace(/[$&+,:;=?@#|'<>^*()%!\s-]/g, '_');
        await mkdirp(path.join(global.appRoot, ('uploads/users')));
        let filePath = 'users/file_' + Math.random().toString(36).slice(2) + '_' + sampleFilename;
        sampleFile.mv(path.join(global.appRoot, ('uploads/' + filePath)), function (err) {
            if (err) {
                return callback(userResponse.failed('file_error', err));
            }
            callback({ filePath: filePath, filename: sampleFilename });
        });
    }

    async bulkCreateUser(data, filePath, filename) {
        const csvFilePath = path.join(global.appRoot, ('uploads/' + filePath));
        const jsonArray = await csv().fromFile(csvFilePath);
        let cur, errors = [], errorindex = [];
        for (var index = 0; index < jsonArray.length; index++) {
            cur = jsonArray[index];
            if (!cur.membership_no || !cur.first_name || !cur.last_name || !cur.username || !cur.email || !cur.phone) {
                errors.push({ Error: `Fields missing at row no:  ${index + 1}` });
                errorindex.push(index);
                continue;
            }
            if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(cur.email))) {
                errors.push({ Error: `Invalid Email format. Error at row no:  ${index + 1}` });
                errorindex.push(index);
            }
        }
        let returnResult;
        if ((errorindex.length == jsonArray.length) || !jsonArray.length) {
            this.UploadFileDB(errors, filename, 0, data.app_key);
            if (!jsonArray.length) {
                errors.push({ Error: 'No Records to insert' });
            }
            returnResult = userResponse.failed('file_invalid', { errors: errors });
        } else {
            var users = [];
            var duplicate_users = [];
            if (errorindex.length) {
                duplicate_users = errors;
            }
            for (var i = 0; i < jsonArray.length; i++) {
                let response = await this.createUser({
                    ...jsonArray[i],
                    app_key: data.app_key,
                    filePath: filePath,
                    type: 'csv'
                });
                if (!response['status']) {
                    let temp = jsonArray[i]
                    temp["timestamp"] = new Date().toString()
                    if (errorindex.includes(i) && duplicate_users[i]) {
                        duplicate_users[i]['Error'] += `, User Already exists at row no.: ${i + 1}`;
                    } else {
                        duplicate_users.push({ Error: `User Already exists at row no.: ${i + 1}` });
                    }

                } else {
                    users.push(response);
                }
            }
            this.UploadFileDB(duplicate_users, filename, users.length, data.app_key);
            returnResult = userResponse.success('records_inserted', { users: users, errors: errors });
        }
        return returnResult;
    }

    async modifyUser(data) {
        let returResult;
        let updateValues = Object.assign({}, data);
        let condition = {
            _id: new db.ObjectId(data.user_id),
        }
        delete updateValues.user_id;
        await userModel.modifyUser({ update_values: updateValues, condition: condition, app_key: data.app_key });
        returResult = userResponse.success('user_updated');
        return returResult;
    }

    async usersList(data) {
        let returResult;
        let users = await userModel.getUsersList(data);
        let usersCount = await userModel.getUsersCount(data);
        if (users.length > 0) {
            returResult = userResponse.success('user_found', { values: users, total_records: usersCount });
        } else {
            returResult = userResponse.failed('user_not_found')
        }
        return returResult;
    }

    async analyseUsers(data) {
        let returResult;
        let userAnalysis = await userModel.analyseUsers(data);
        if (userAnalysis.length > 0) {
            if (data.analysisSplit) {
                let props = [];
                for (let i = 0; i < userAnalysis.length; i++) {
                    if (userAnalysis[i]['_id']) {
                        props.push(userAnalysis[i]['_id']['analysisOver']);
                    }
                }
                data.props = props;
                let splitAnalysis = await userModel.analyseUsersWithSplit(data);
                if (splitAnalysis.length) {
                    returResult = userResponse.success('user_found', splitAnalysis);
                } else {
                    returResult = userResponse.failed('user_not_found');
                }
            } else {
                returResult = userResponse.success('user_found', userAnalysis);
            }
        } else {
            returResult = userResponse.failed('user_not_found')
        }
        return returResult;
    }

    async getAttributeMaster(_data) {
        let returResult;
        let config = await userModel.getAttributeMaster(_data);
        if (config) {
            returResult = userResponse.success('user_config_found', config);
        } else {
            returResult = userResponse.failed('user_config_not_found')
        }
        return returResult;
    }

    async editAttributeMaster(_data) {
        let returResult;
        let config = await userModel.editAttributeMaster(_data);
        if (config) {
            returResult = userResponse.success('user_found', config);
        } else {
            returResult = userResponse.failed('user_not_found')
        }
        return returResult;
    }

}
