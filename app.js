var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');

// var WebSocketServer = require('websocket').server;
var WebSocketServer = require('ws').Server;
var GameManager = require('./game_manager').GameManager;

var app = express();

var port = process.env.PORT || 5000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals({ layout: false });

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// app.use(express.static(__dirname + '/'));
app.get('/game/:id', routes.game);
app.get('/', routes.select);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = http.createServer(app);
server.listen(port);

console.log('Server is listening on port %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

var clients = {};
var games = {};

function forEachClient(game_id, callback){
  if (clients[game_id]){
    var game_clients = clients[game_id];
    for (var i = 0; i < game_clients.length; i++){
      callback(game_clients[i]);
    }
  }
}

wss.on('connection', function(ws) {

    var connection = ws;
    console.log((new Date()) + ' Connection accepted.');
    var connection_id = connection.protocol;
    console.log(connection_id);

    connection.on('message', function(message) {
      var data = JSON.parse(message);
      var game_id = data.game_id;
      if (data.instruction == "loadGame"){
        var game_manager;
        if (games[data.game_id] && clients[connection_id]){
          game_manager = games[game_id];
          clients[connection_id].push(connection);
        } else {
          game_manager = new GameManager(game_id, 4);
          games[game_id] = game_manager;
          clients[connection_id] = [connection];
        }
        data.score = game_manager.score;
        data.cells = game_manager.grid.cells;
        message = JSON.stringify(data);
      } else if (data.instruction == "move"){
        var game_manager = games[game_id];
        game_manager.move(data.direction);
        data.newTile = game_manager.newTile;
        message = JSON.stringify(data);
      } else if (data.instruction == "restart"){
        var game_manager = games[game_id];
        game_manager.restart();
        data.cells = game_manager.grid.cells;
        message = JSON.stringify(data);
      } else if (data.instruction == "keepPlaying"){
        var game_manager = games[game_id];
        game_manager.keepGoing();
      } else if (data.instruction == "ping"){
        data.instruction = "pong";
        message = JSON.stringify(data);
      }

      if (data.instruction == "loadGame" || data.instruction == "pong"){
        connection.send(message);
      } else {
        forEachClient(game_id, function(client){
          client.send(message);
        });  
      }
    });

    connection.on('close', function() {
      console.log((new Date()) + ' Peer disconnected.');
      clients[connection_id].pop(connection);
      if (clients[connection_id].length == 0){
        delete clients[connection_id];
        delete games[connection_id];
      }
    });
});

// var gm = new GameManager(4, wss);

module.exports = app;