const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const config = require('../config')
const download = require('./download')
const Puid = require('puid');
var puid = new Puid();


/**
 * identify image using 'watson-developer-cloud/visual-recognition' 
 */
function watson(file) {

    var visual_recognition = new VisualRecognitionV3({
        api_key: config.watson_key,
        version_date: '2016-05-19'
    });

    var params = {
        images_file: fs.createReadStream(file)
    };

    // return a promise containing the response from watson
    return new Promise((resolve, reject) => {
        visual_recognition.classify(params, function (err, res) {
            // delete image after use
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

/**
 * Download a picture and identify it using 'watson-developer-cloud/visual-recognition'
 */
function recognize(photo, apiKey) {
    var bot_url = 'https://api.telegram.org/bot' + apiKey;
    var file_url = 'https://api.telegram.org/file/bot' + apiKey;

    return new Promise((resolve, reject) => {
        axios.post(bot_url + '/getFile', {
            file_id: photo.file_id
        })
            .then((response) => {
                if (!isSet(() => response.data.result.file_path)) {
                    reject();
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
                reject();
            })
    });
}

function parseRes(res) {

    if ((!isSet(() => res.images[0].classifiers[0].classes) || res.images[0].classifiers[0].classes.constructor !== Array)) {
        return 'Something went wrong';
    }

    var classes = res.images[0].classifiers[0].classes;

    if (classes.length <= 0) {
        return 'Was not able to classify image';
    }

    // Construct a simple text answer
    return classes.map(function (obj) {
        if (!obj.class || !obj.score) {
            return 'Something went wrong'
        }

        // return 'classifier: matchpercent%'
        return obj.class + ': ' + obj.score * 100 + '%';
    }).join('\n')

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