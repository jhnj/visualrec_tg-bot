const visualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
const util = require('util');





function recognize(photo, bot_url) {
    return new Promise((resolve, reject) => {
        axios.post(bot_url + '/getFile', {
            file_id: photo.file_id
        })
            .then((response) => {
                if (!response.data && !response.data.result && !response.data.result.file_path) {
                    reject('file_path not found\n' + util.inspect(response));
                }
                resolve(bot_url + '/' + response.data.result.file_path);

            })
            .catch((err) => {
                console.log(err);
                reject('catcherror: ' + err + '\nbot_url: ' + bot_url + '/getFile\nfile_id: ' + photo.file_id);
            })
    });
}

module.exports = recognize;