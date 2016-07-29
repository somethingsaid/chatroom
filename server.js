var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

// keep copy of connected clients
// use socket id, and nickName
var clients = new Object();

// get client id by nickname
var getClientID = function(nickName) {
    var id = null;
    for(var index in clients) {
        if (clients.hasOwnProperty(index)) {
            if (clients[index] === nickName) {
                id = index;
                break;
            }
        }
    }
    return id;
};

io.on('connection', function (socket) {
    socket.on('regUser', function(nickName) {
        clients[socket.id] = nickName; // identify user by socket.id
        socket.broadcast.emit('message', nickName + ' has joined the chat.');
        io.emit('clients changed', clients);
    });


    socket.on('message', function(message) {
        var sender = clients[socket.id];
        console.log('Received message:', message);
        socket.broadcast.emit('message', sender + ": " + message);
    });

    socket.on('disconnect', function() {
        if (!clients[socket.id]) {
            return;
        }
        var user = clients[socket.id];
        delete clients[socket.id];
        socket.broadcast.emit('message', user + ' has left the chat.');
        io.emit('clients changed', clients);
    });
    
    socket.on('keydown', function() {
        var nickName = clients[socket.id];
        socket.broadcast.emit('keydown', nickName);
    });

    socket.on('keyup', function() {
        socket.broadcast.emit('keyup');
    });
});

server.listen(8080);
