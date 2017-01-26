const AWS = require('aws-sdk');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const config = require('../config')
const download = require('./download')
const Puid = require('puid');
var puid = new Puid();



/**
 * identify image using AWS Rekognition
 */
function rekognize(fileName) {

    const keyId = process.env.AWS_ACCESS_KEY_ID
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY

    // No keyId or secretKey found
    if (!keyId || !secretKey) {
        return Promise()
    }

    const rekognition = new AWS.Rekognition({
        apiVersion: '2017-01-25',

    });


    const file = new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err) reject(err);
            resolve(data)
        })
    });

    return new Promise((resolve, reject) => {
        file.then((data) => {
            console.log(data)
            const params = {
                Image: { /* required */
                    Bytes: data
                }
            };
            rekognition.detectLabels(params, function (err, data) {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                else resolve(data)
            })
        })
            .catch((err) => reject(err))
    });
}

/**
 * Download a picture and identify it
 */
function recognizePhoto(photo, apiKey) {
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
                const location = process.env.TempStorage || './temp/'
                console.log('location: ', location)
                var file = location + puid.generate(true) + '.jpg';

                console.log(file_url + '/' + response.data.result.file_path)
                download(file_url + '/' + response.data.result.file_path, file)
                    .then(() => {
                        console.log('file downloaded')
                        resolve(rekognize(file));
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


module.exports = recognizePhoto;