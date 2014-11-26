$(document).ready(function () {
    $.ajax({
        url : "/messages",
        context : document.body,
        dataType : 'json',
        success : function (data) {
            data.forEach(function (msg) {
                addMsg (msg);
            });
        }
    });

    var isLoggedIn = false;
    while(!isLoggedIn){
        var person = prompt("Please enter your name", "Noob");
        if (person != null) {
            socket = io();   
            socket.emit('login', person);
            $("#u").val(person);
            $.notify(person + " you are now connected.", "success");
            isLoggedIn = true;
        }
    } 

    $('#m').keypress(function( event ) {
        var authorStr = $('#u').val();
        socket.emit('typing', authorStr); 
    });

    $('form').submit(function () {
        var authorStr = $('#u').val();
        var messageStr = $('#m').val();
        var message = {author: authorStr, message: messageStr};
        socket.emit('chat message', message);
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function (msg) {
        addMsg(msg);
        gotANewMessage();
    });

    var currentMessages = [];
    socket.on('typing', function (msg) {
        var msgStr = "" + msg;
        if(currentMessages.indexOf(msgStr) == -1){
            $.notify(msgStr, {
                className: "info",
                autoHide: true,
                autoHideDelay: 2000
            });
            currentMessages.push(msgStr);
            var index = currentMessages.indexOf(msgStr);
            console.log(currentMessages);
            setTimeout(function(){
                currentMessages.splice(index, 1);
            }, 2000);

        } 
    });

    var blinking = false;
    var blinkInterval = "";

    //stop blinking on window focus
    window.onfocus = function() { 
        if(blinking){ clearInterval(blinkInterval);
            document.title = "yChat";
            blinking = false;
        }
    }

    //start blinking on new message
    function gotANewMessage() {
        if(!document.hasFocus() && !blinking){
            blinking = true;
            var title = document.title;
            blinkInterval = setInterval(function () {
                document.title = document.title === 'New Message!' ? title : 'New Message!';
            }, 500);
        }
    }

    //date now
    function dateString (date) { 
        return ((date.getDate() < 10)?"0":"") + date.getDate() +"."+(((date.getMonth()+1) < 10)?"0":"") + (date.getMonth()+1) +"."+ date.getFullYear();
    }

    //time now
    function timeNow (date) {
        return ((date.getHours() < 10) ? "0" : "") + date.getHours() + ":" + ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes() + ":" + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
    }

    //add new message
    function addMsg (msg) {
        var time = new Date(msg.time);
        var timestamp = "" + timeNow(time) + " | " + dateString(time);
        $('#messages').append('<li>['+ timestamp +']&nbsp;<strong>' + msg.author + '</strong>:&nbsp;' + msg.message + '</li>');
        $(document).scrollTop($(document).height());
    }
    

});
