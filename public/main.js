$(document).ready(function() {

    // prompt for nickname and set to socket
    var nickName = null;
    while (!nickName) {
        nickName = window.prompt("Please enter your nickname:", "");
    }

    $('#nickName').html(nickName);

    var socket = io();
    socket.emit('regUser', nickName);

    var input = $('input');
    var messages = $('#messages');
    var clientCount = $('#clientCount');
    var typing = $('#userTyping');

    // add message to message area
    var addMessage = function(message, includeNickName) {

        // look for pm|{username}|{message} format
        var args = message.split('|');
        if (args.length === 3) {
            message = args[2];
        }
        if (includeNickName) {
            message = nickName + ': ' + message;
        }
        messages.append('<div>' + message + '</div>');
    };

    // update client count
    var updClients = function(clients) {
        clientCount.html('Connected Clients = ' + Object.keys(clients).length);

        $("ul").empty();
        var html = "";
        for(var index in clients) {
            if (clients.hasOwnProperty(index)) {
                html += "<li>" + clients[index] + "</li>";
            }
        }
        $("ul").html(html);
    };

    // update {username} is typing div
    var userTyping = function(nickName) {
        typing.html(nickName + ' is typing.');
    };

    // clear {username} is typing div
    var clearUserTyping = function() {
        typing.html('');
    };

    // socket event handlers
    socket.on('message', addMessage);
    socket.on('clientsChanged', updClients);
    socket.on('keydown', userTyping);
    socket.on('keyup', clearUserTyping);

    // on keydown, if enter, send message.
    // otherwise emit 'keydown' event
    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            console.log('keydown');
            socket.emit('keydown');
            return;
        }

        var message = input.val();
        addMessage(message, true);
        socket.emit('message', message);
        input.val('');
    });

    // on keyup, emit 'keyup' event if not enter
    input.on('keyup', function(event) {
        if (event.keyCode != 13) {
            socket.emit('keyup');
        }
    });

});
