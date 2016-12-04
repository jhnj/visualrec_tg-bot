const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config');
const recognize = require('./watson_connection');


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

    const photos = message.photo;
    // should be an array with 4 photos
    if (!photos || photos.constructor !== Array && photo.length < 4) {

        axios.post(bot_url + '/sendMessage', {
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
    } else {


        // recognize the picture using IBM watson visual recognition
        // the 3rd image seems to be the largest so we send that
        var watsonResponse = recognize(photos[2], apiKey);




        watsonResponse.then((wtResp) => {
            axios.post(bot_url + '/sendMessage', {
                chat_id: message.chat.id,
                text: wtResp
            })
                .then(response => {
                    // We get here if the message was successfully posted
                    console.log('Message posted')
                })
                .catch(err => {
                    // ...and here if it was not
                    console.log('Error :', err)
                });

        })
            .catch((err) => {
                axios.post(bot_url + '/sendMessage', {
                    chat_id: message.chat.id,
                    text: 'err from watsonResponse catch: ' + err
                })
                    .then(response => {
                        // We get here if the message was successfully posted
                        console.log('Message posted')
                    })
                    .catch(err => {
                        // ...and here if it was not
                        console.log('Error :', err)
                    });
            });
        
        // acknowledge that message was received
        res.end('ok');
    }



});

module.exports = app;