# Visualrecognition telegrambot

Telegram bot that will identify the images sent to it using IBM Watson Visual Recognition.

Trying out node.js and es6

## Setup
* [Create](https://core.telegram.org/bots#botfather) a telegram bot and setup a
[webhook](https://core.telegram.org/bots/api#setwebhook) to it for your node app "guide".
Rename config.template.js to config.js and add your bot api-key to it. 

* Create a [Visual Recognition service](https://www.ibm.com/watson/developercloud/visual-recognition.html) and add its api-key to config.js

* Run the node app using npm start and try to sending it pictures.