const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config');
const recognize = require('./watson_connection');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var api_key = process.env.api_key || config.api
var bot_url = 'https://api.telegram.org/bot' + api_key

app.post('/msg', function (req, res) {
    const message = req.body.message;

    var text = '';
    if (!message) {
        // no message found
        return res.end()
    }

    const photos = message.photo;
    if (!photos || photos.constructor !== Array && photo.length < 4) {
        // not a photo

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
        var responses = photos.map((p) => recognize(p, bot_url));
        


        // bot has received a photos
        Promise.all(responses)
        .then((results) => {
            axios.post(bot_url + '/sendMessage', {
                chat_id: message.chat.id,
                text: results.join('\n') + '\nphotos.length: ' + photos.length
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
        })
            .catch((err) => {
                axios.post(bot_url + '/sendMessage', {
                    chat_id: message.chat.id,
                    text: 'err from recognize catch: ' + err
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
            });

    }



});

module.exports = app;