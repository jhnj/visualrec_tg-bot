const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config');
const recognize = require('./libs/watson_connection');
const respond = require('./libs/respond');


const fs = require('fs');
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var apiKey = process.env.api_key || config.tg_key
var bot_url = 'https://api.telegram.org/bot' + apiKey

app.post('/msg', function (req, res) {
    const message = req.body.message;

    var text = '';
    if (!message) {
        // no message found
        return res.end()
    }

    // Check if bot has received photos
    const photos = message.photo;
    // should be an array
    if (!photos || photos.constructor !== Array) {
        respond(message.chat.id, bot_url + '/sendMessage', 'Send a photo');
    } else {

        // recognize the picture using IBM watson visual recognition apis
        // TODO: Identify the largest image from photos and send it
        var watsonResponse = recognize(photos[photos.length - 1], apiKey);


        watsonResponse.then((wtResp) => {

            respond(message.chat.id, bot_url + '/sendMessage', wtResp);

        })
            .catch((err) => {

                respond(message.chat.id, bot_url + '/sendMessage',
                    'Something went wrong when trying to classify the image')
            });
    }

    // acknowledge that message was received
    res.end('ok');



});

module.exports = app;