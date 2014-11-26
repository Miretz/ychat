var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//serve static files
app.use("/static", express.static(__dirname + '/static'));

//holds all the messages in memory
var messages = []
var loggedIn = []

//check if array contains
function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

//simple html escape
function replaceBadHtml(inputText){
    return inputText.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

//function send admin message
function adminMessage(action, username, socket){
    var adminMessage = {
        author: "Admin-Bot", 
        message: action + ": " + escapedUsername, 
        time: new Date().getTime()
    };
    messages.push(adminMessage);
    io.emit('chat message', adminMessage);
}

//get user ip address
function getUserIp(socket){
    return socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
}

//io functions
io.on('connection', function (socket) {

    //messages
	socket.on('chat message', function (msg) {
        msg.time = new Date().getTime();
        msg.author = replaceBadHtml(msg.author);
        msg.message = replaceBadHtml(msg.message);
        messages.push(msg);
		io.emit('chat message', msg);
	});

    //typing notification
    socket.on('typing', function (authorStr) {
        io.emit('typing', authorStr + " is typing...");
    });





    //login notification
    socket.on('login', function (username) {
        escapedUsername = replaceBadHtml(username);
        var address = getUserIp(socket);
        var user = {
            username: escapedUsername,
            ip: address
        };
        loggedIn.push(user);
        adminMessage("User connected",escapedUsername, socket);
        console.info(loggedIn);
    });

    //logout notification
    socket.on('disconnect', function(){
        var address = getUserIp(socket);
    
        for(var i = 0; i < loggedIn.length; i++) {
            if(loggedIn[i].ip==address){
                adminMessage("User disconnected",loggedIn[i].username, socket);
           
                //remove user from user array
                loggedIn.splice(i, 1);

                console.info(loggedIn);

                break; 
            }
        }
    });

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


