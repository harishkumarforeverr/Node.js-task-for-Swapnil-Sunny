let fs = require('fs');
var mkdirp = require('mkdirp');
module.exports = class Upload_files{
    uploadFile (file, path, file_name, callback) {
        if (!fs.existsSync(path)){
            // mkdirp.sync(path, (err) => { if (err) callback(err,'') });
            try{
                mkdirp.sync(path);
            }catch(err){
             callback(err,'')
            }
        }
        file.mv(path+"/"+file_name, function(err){
            callback(err,path+"/"+file_name);
        });
    }

    upload_Multiple_Files(data,callback){
        let files_name =[];
        let error = null;

        for(let i=0;i<data.length;i++){
            // let file_name = [];
            if (!fs.existsSync(data[i].path)){
                // fs.mkdirSync(data[i].path);
                try{
                    mkdirp.sync(data[i].path);
                }catch(err){
                 callback(err,'')
                }
            }
            data[i].file.mv(data[i].path+"/"+data[i].file_name, function(err){
                if(err) {
                    error = err;
                    i = data.length;
                }
            });
            files_name[data[i].return_file_name] = data[i].path+"/"+data[i].file_name;
            // files_name = files_name.concat(file_name);
        }
        callback(error,files_name);

    }
};