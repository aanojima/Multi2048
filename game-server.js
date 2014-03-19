#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var GameManager = require('./game_manager').GameManager;

var server = http.createServer(function(request, response){
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
	httpServer : server,
	autoAcceptConnections : false,
});

function originIsAllowed(origin) {
	return true;
}

var gm = new GameManager(4, wsServer);