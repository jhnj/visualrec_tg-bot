const fs = require('fs');
const axios = require('axios');



// download file from url to dest
// returns a promise
function download(url, dest) {

    return new Promise(function (resolve, reject) {

        var writeStream = fs.createWriteStream(dest);

        writeStream.on('finish', () => {
            writeStream.close(() => {
                resolve(dest);
            });
        });

        // Delete file on failure in writeStream
        writeStream.on('error', function (err) {
            fs.unlink(dest, reject());
        });


        axios.get(url, {
            responseType: 'stream'
        })
            .then((response) => {
                var readStream = response.data;

                // Delete file on error in readStream
                readStream.on('error', function (err) {
                    fs.unlink(dest, reject());
                });

                readStream.pipe(writeStream);
            })
            .catch((err) => {
                console.log(err);
                reject();
            })
    });
};

module.exports = download;