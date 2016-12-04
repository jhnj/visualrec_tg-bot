const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const config = require('../config')
const download = require('./download')
const Puid = require('puid');
var puid = new Puid();



function watson(file) {

    var visual_recognition = new VisualRecognitionV3({
        api_key: config.watson_key,
        version_date: '2016-05-19'
    });

    var params = {
        images_file: fs.createReadStream(file)
    };

    visual_recognition.classify(params, function (err, res) {
        if (err)
            console.log(err);
        else
            console.log(JSON.stringify(res, null, 2));

        fs.unlink(file, function (err) {
            if (err) console.log('fs.unlink failed: ', err);
            console.log('file deleted');
        });

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
                // compressed files from telegram are always .jpg and watson needs the file extension
                var file = './temp/' + puid.generate(true) + '.jpg';

                download(file_url + '/' + response.data.result.file_path, file)
                    .then(() => {
                        resolve(watson(file));
                    })
                    .catch((err) => reject('failed here: ' + err));
            })
            .catch((err) => {
                console.log(err);
                reject('catcherror: ' + err + '\nbot_url: ' + bot_url + '/getFile\nfile_id: ' + photo.file_id);
            })
    });
}


module.exports = recognize;