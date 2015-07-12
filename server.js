
// Require Native Node.js Libraries
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var _ = require('underscore');
var Room = require('./game/Room').Room;

var room = new Room();

// ------------------------------------
// Route our Assets
// ------------------------------------

app.use('/assets/', express.static(__dirname + '/public/assets/'));

// ------------------------------------
// Route to Pages
// ------------------------------------

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

// ------------------------------------
// Handle Socket Connection
// ------------------------------------

io.on('connect', function(socket){
  if(room.getPlayerCount() < 10){
    room.players.addPlayer(socket);
    if(room.getPlayerCount() === 3 && !room.game.isStarted){
      room.game.startGame();
    }
  }
});

// ------------------------------------
// Start Server
// ------------------------------------

server.listen(process.env.PORT || 4000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server started at", addr.address + ":" + addr.port);
});
