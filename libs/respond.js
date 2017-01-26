const axios = require('axios');

/**
 * Array containing regexps for messages and their callbacks
 * 
 * [{regexp, cb}]
 */
const callbacks = [];

function addCallback(regexp, cb) {
    callbacks.push({ regexp, cb });
}

addCallback(/\/help/i, function (chatId, url, message) {
    respond(chatId, url, 'help message')
});


/**
 * Receive a text message, test for matching callbacks
 */
function receive(chatId, url, message) {

    // test if a matching callback is found
    if (!callbacks.some(reg => {
        console.log('Checking regexp: ', reg.regexp, 'with message: ', message);
        if (reg.regexp.exec(message)) {
            console.log('regexp found')
            reg.cb(chatId, url, message);
            return true;
        }
    })) {
        // don't respond to every message
        // respond(chatId, url, 'Send a picture');
    }
}


/**
 * Send a message to a telegram chat
 */
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
}


module.exports = { respond, receive };