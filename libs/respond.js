const axios = require('axios');


function respond(chatId, url, message) {
    axios.post(url, {
            chat_id: chatId,
            text: message
        })
            .then(response => {
                // We get here if the message was successfully posted
                console.log('Message posted')
            })
            .catch(err => {
                // ...and here if it was not
                console.log('Error :', err)
            });
};


module.exports = respond;