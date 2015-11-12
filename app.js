var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var config = require('config');

server.listen(3000);

var dataJson = {};

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    io.emit('updateData', dataJson);
});

setInterval(updateData, 500);

function updateData(){
    request(config.get('nimbus.host') + ":" + config.get('nimbus.port') + '/api/v1/cluster/summary', function(err, result, body) {
        if (err) return Error(err);

        var nimbusUptime = JSON.parse(body).nimbusUptime;
        console.log('Result...', nimbusUptime);
        dataJson = nimbusUptime;
        io.emit('updateData', nimbusUptime)
    });
}