const visualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const util = require('util');


// download file from url to dest
// returns a promise
function download(url, dest) {

    return new Promise(function (resolve, reject) {

        var writeStream = fs.createWriteStream(dest);

        writeStream.on('finish', function () {
            resolve('filename')
        });

        // Delete file on failure in writeStream
        writeStream.on('error', function (err) {
            fs.unlink(dest, reject());
        });


        axios.get(url, {
            responseType: 'stream'
        })
            .then((response) => {
                var readStream = response.data;

                // Delete file on error in readStream
                readStream.on('error', function (err) {
                    fs.unlink(dest, reject());
                });

                readStream.pipe(writeStream);
            })
            .catch((err) => {
                console.log(err);
                reject();
            })
    });
};

function watson(file) {

    fs.unlink(file, function (err) {
        if (err) console.log('fs.unlink failed: ', err);
        console.log('file deleted');
    });
    return 'watson-response';
}


function recognize(photo, apiKey) {
    var bot_url = 'https://api.telegram.org/bot' + apiKey;
    var file_url = 'https://api.telegram.org/file/bot' + apiKey;

    return new Promise((resolve, reject) => {
        axios.post(bot_url + '/getFile', {
            file_id: photo.file_id
        })
            .then((response) => {
                if (!response.data && !response.data.result && !response.data.result.file_path) {
                    reject('file_path not found\n' + util.inspect(response));
                }
                download(file_url + '/' + response.data.result.file_path, './test')
                    .then((res) => {
                        resolve(watson('./test'));
                    }).catch((err) => reject('failed here: ' + err));
            })
            .catch((err) => {
                console.log(err);
                reject('catcherror: ' + err + '\nbot_url: ' + bot_url + '/getFile\nfile_id: ' + photo.file_id);
            })
    });
}


module.exports = recognize;