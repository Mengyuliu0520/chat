var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var lodash = require('lodash');
var MarkdownIt = require("markdown-it");
var md = new MarkdownIt({
  breaks: true,
  linkify: true
});

var users = [];

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

  socket.on('user connection', function(msg) {
    users.push({
      id: socket.id,
      name: msg
    })
    io.sockets.emit('hi', msg + ' join \n current ' + users.length);
  });

  socket.on('disconnect', function() {
    var i = lodash.findIndex(users, {
      id: socket.id
    });
    if (i >= 0) {
      var _user = users[i];
      lodash.remove(users, function(u) {
        return u.id == socket.id;
      })
      io.sockets.emit('hi', _user.name + ' exit \n current ' + users.length);
    }
  });

  socket.on('chat message', function(msg) {
    if (msg) {
      var i = lodash.findIndex(users, {
        id: socket.id
      });
      if (i >= 0) {
        io.emit('chat message', {
          user: users[i],
          msg:md.render(msg)
        });
      }
    }
  });

});

http.listen(4000, function() {
  console.log('listening on *:4000');
});
