const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config');
const recognizePhoto = require('./libs/rekognition');
const respond = require('./libs/respond').respond;
const receive = require('./libs/respond').receive;


const fs = require('fs');
//if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var apiKey = process.env.api_key || config.tg_key
var bot_url = 'https://api.telegram.org/bot' + apiKey

exports.handler = function (event, context, callback) {
    const message = event.message;
    console.log("received: ", event)

    if (!message) {
        // no message found
        callback(null, "success");
        return;
    }

    // Check if bot has received photos
    const photos = message.photo;
    // should be an array
    if (!photos || photos.constructor !== Array) {
        if (message.text)
            receive(message.chat.id, bot_url + '/sendMessage', message.text);
    } else {

        // recognize the picture using AWS Rekognition
        // TODO: Identify the largest image from photos and send it
        var res = recognizePhoto(photos[photos.length - 1], apiKey);


        res.then((resp) => {

            respond(message.chat.id, bot_url + '/sendMessage', resp);

        })
            .catch((err) => {

                respond(message.chat.id, bot_url + '/sendMessage',
                    'Something went wrong when trying to classify the image: ' + err)
            });
    }
};