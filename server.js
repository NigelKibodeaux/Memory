'use strict'

var express = require('express')
var fs = require('fs')


var app = express();

app.use('/', express.static(__dirname + '/public'))

app.post('/', (req, res) => {
    res.set('content-type', 'text/html')
    res.send(fs.readFileSync(__dirname + '/public/index.html'))
})

app.listen(8081, function () {
  console.log('app listening on port 8081!');
});
