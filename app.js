const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config')
const fs = require('fs')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var api_key = process.env.api_key || config.api
var bot_url = 'https://api.telegram.org/bot' + api_key + '/sendMessage'

app.post('/msg', function (req, res) {
    const message = req.body.message;

    var text = '';
    if (!message) {
        // no message found
        return res.end()
    }

    const photo = message.photo;
    if (!photo || photo.constructor !== Array) {
        // not a photo

        axios.post(bot_url, {
            chat_id: message.chat.id,
            text: 'Send a photo'
        })
            .then(response => {
                // We get here if the message was successfully posted
                console.log('Message posted')
                res.end('ok')
            })
            .catch(err => {
                // ...and here if it was not
                console.log('Error :', err)
                res.end('Error :' + err)
            });

        return res.end();
    }


    // bot has received a photo
    axios.post(bot_url, {
        chat_id: message.chat.id,
        text: 'Photo'
    })
        .then(response => {
            // We get here if the message was successfully posted
            console.log('Message posted')
            res.end('ok')
        })
        .catch(err => {
            // ...and here if it was not
            console.log('Error :', err)
            res.end('Error :' + err)
        });

    return res.end();

});

module.exports = app;