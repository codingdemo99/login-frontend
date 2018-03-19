var express = require('express');
var app = express();
var launcher = require('launch-browser');

var host = '127.0.0.1';
var port = 8080;

var options = {
    index: 'index.html'
};

app.use('/', express.static('public', options));

var server = app.listen(port, host, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("App listening at http://%s:%s", host, port);

    launcher('http://' + host + ':' + port, {
        browser: ['chrome', 'firefox', 'safari']
    }, function (e, browser) {

        if (e) return console.log(e);

        browser.on('stop', function (code) {
            console.log('Browser closed with exit code:', code);
        });

    })
});