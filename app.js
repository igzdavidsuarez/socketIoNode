var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var config = require('config');
var _ = require('lodash');

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
    request(config.get('nimbus.host') + ":" + config.get('nimbus.port') + '/api/v1/topology/summary', function(err, result, body) {
        if (err) return Error(err);

        var topologies = JSON.parse(body).topologies;
        if(!_.isEmpty(topologies)){
            topologyId = topologies[0].id;

            request(config.get('nimbus.host') + ":" + config.get('nimbus.port') + '/api/v1/topology/' + topologyId, function(err, result, body) {
                if (err) return Error(err);

                var bodyParsed = JSON.parse(body).bolts;
                dataJson = bodyParsed;
                io.emit('updateData', bodyParsed)
            });

        } else {
            io.emit('Error', 'No topology running');
        }
    });
}
