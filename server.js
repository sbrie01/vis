var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
// var io = require('socket.io').listen(server);
// var fs = require('fs');
// var jsonfile = require('jsonfile');

// serve up webapp
app.use(express.static(__dirname + "/"));
//app.use('/bower_components',  express.static(__dirname + '/bower_components'));
//app.use('/node_modules',  express.static(__dirname + '/node_modules'));

// open server on port 3000
server.listen(3000, function() {
	console.log("listening on port *:3000");
});
