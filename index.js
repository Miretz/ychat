var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//serve static files
app.use("/static", express.static(__dirname + '/static'));

//holds all the messages in memory
var messages = []

//check if array contains
function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

//simple html escape
function replaceBadHtml(inputText){
    return inputText.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

io.on('connection', function (socket) {

	socket.on('chat message', function (msg) {
        msg.time = new Date().getTime();
        msg.author = replaceBadHtml(msg.author);
        msg.message = replaceBadHtml(msg.message);
        messages.push(msg);
		io.emit('chat message', msg);
	});

    socket.on('typing', function (authorStr) {
        io.emit('typing', authorStr + " is typing...");
    });

    var address = socket.handshake.address;
    var newUserMessage = {author: "Admin-Bot", message: "A user has connected: " + address, time: new Date().getTime()};
    messages.push(newUserMessage);
    io.emit('chat message', newUserMessage);
});

app.get('/', function (req, res) {
	res.sendFile('index.html', {
		root : __dirname
	});
});

app.get('/messages', function (req, res) {
	res.json(messages);
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080  
, ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
http.listen(port, ip);

console.log("Chat server started on port " + port);


