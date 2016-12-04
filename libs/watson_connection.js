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

    return new Promise((resolve, reject) => {
        visual_recognition.classify(params, function (err, res) {
            // delete image
            fs.unlink(file, function (err) {
                if (err) console.log('fs.unlink failed: ', err);
                console.log('file deleted');
            });

            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(JSON.stringify(res, null, 2));
                resolve(parseRes(res));
            }

        });
    })
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

function parseRes(res) {
    console.log
    if (false && (!isSet(() => res.images[0].classifiers.classes) || res.images[0].classifiers.classes.constructor !== Array)) {
        return 'Something went wrong';
    }

    var classes = res.images[0].classifiers[0].classes;
    var ret = classes.map(function (obj) {
        if (!obj.class || !obj.score) {
            return 'SOmething went wrong'
        }

        return obj.class + ': ' + obj.score;
    }).join('\n')

    if (ret.length <= 0) {
        return 'Was not able to classify image';
    }
    return ret;
}

// function for testing if json keys exists
function isSet(fn) {
    var value;
    try {
        value = fn();
    } catch (err) {
        value = undefined;
    } finally {
        return value !== undefined;
    }
};


module.exports = recognize;