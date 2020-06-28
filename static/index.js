document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // User local storage
    var storage = window.localStorage;

    var username = document.querySelector('#username').innerText
    console.log(username)
    storage.setItem("username", username);

    function change_channel_function()
    {
        /* Change channel function */

        // Each button having class btn-link should emit a "change channel" event
        document.querySelectorAll('button.btn-link').forEach(button => {
            button.onclick = () => {
                var channel = button.dataset.channel;
                console.log('change channel requested')
                socket.emit('change channel', storage.getItem('channel'), channel, storage.getItem('username'));
            };
        });

    }

    socket.on('connect', () => {
        /* Connect socket */
        console.log('socket connection')

        // Join a channel if a user was in that particular channel before leaving
        if (storage.getItem('channel')) {
            socket.emit("change channel", storage.getItem('channel'), storage.getItem('channel'), storage.getItem('username'));
        }
        // Else hide the chat section
        else {
            document.querySelector("#chat").style.display = "none";
        }

        // Initialize every channel button's onclick event
        change_channel_function();

    });


        socket.on('join_channel', data => {
        /* Execute when user joins a channel */

            // Save channel in storage
            storage.setItem('channel', data["channel"]);

            // Clear messages area
            document.querySelector("#messages").innerHTML = "";

            // Display channel name at header
            document.querySelector("#channel_name").innerHTML = data["channel"];

            // Display Channel details in the details section
            document.querySelector("#channel_details").innerHTML = data["channel info"];
            if (document.querySelector("#channel_details").innerHTML == '')
                {
                    console.log('hiding details')
                   document.querySelector("#channel_details_area").style.display="none";
                }
            else
                {
                console.log('showing details')
                    document.querySelector("#channel_details_area").style.display="block";
                }


            // Display chat section
            document.querySelector("#chat").style.display = "block";

            // Fill up messages area with the selected channel's messages
            var x;
            for (x in data["messages"]) {
                const div = document.createElement('div');
                if (data["messages"][x].user == storage.getItem("username"))
                {
                    div.innerHTML = `<div class="jumbotron jumbotron4"><strong style="font-family: sans-serif;">${data["messages"][x].user}:</strong><div>${data["messages"][x].msg}</div><small>${data["messages"][x].msg_time}</small></div>`;
                }
                else
                {
                    div.innerHTML = `<div class="jumbotron jumbotron5"><strong style="font-family: sans-serif;">${data["messages"][x].user}:</strong><div>${data["messages"][x].msg}</div><small>(${data["messages"][x].msg_time})</small></div>`;
                }
                document.querySelector("#messages").append(div);
            }

    });

    socket.on('room_change', message => {
        /* Announce new channel for everyone */

        const div = document.createElement('div');
        div.innerHTML = `<div class="jumbotron jumbotron6"><strong>${message}</strong></div>`;
        document.querySelector("#messages").append(div);

    });

    socket.on('receive_message', data => {
        /* Execute when a message is sent */
        console.log('new message received')
        // Show message for all users on the channel
        const div = document.createElement('div');

        if (data.user == storage.getItem("username"))
        {
            console.log("my message")
            div.innerHTML = `<div class="jumbotron jumbotron4"><strong style="font-family: sans-serif;">${data.user}:</strong><div>${data.msg}</div><small>${data.msg_time}</small></div>`;
        }
        else
        {
            console.log("someone else's message")
            div.innerHTML = `<div class="jumbotron jumbotron5"><strong style="font-family: sans-serif;">${data.user}:</strong><div>${data.msg}</div><small>${data.msg_time}</small></div>`;
            if (document.getElementById('notificationSound').checked)
            {
            document.getElementById('newMsgSound').play();
            }
        }

        /* without differentiation
        div.innerHTML = `<div class="jumbotron jumbotron5"><strong style="font-family: sans-serif;">${data.user}:</strong><div>${data.msg}</div><small>(${data.msg_time})</small></div>`;
        */

        document.querySelector("#messages").append(div);

    });


    document.querySelector("#send_message_form").onsubmit = () => {
        /* Execute on submitting send_message_form */

        // Get the msg field
        msg = document.querySelector("#message");
        console.log(msg)

        // Ensure msg is typed (and not only spaces)
        if (msg.value.trim().length == 0)
        {
            alert("Type a message first!");
            msg.focus();
            return false;
        }

        // Get username, channel name
        user = storage.getItem('username');
        console.log(storage.getItem('channel'))
        channel = storage.getItem('channel');

        // Data having msg, username, and channel name
        data = {'msg': msg.value, 'user': user, 'channel': channel};

        // Emit send message
        socket.emit('send_message', data);

        // Remove msg from text field
        document.querySelector("#message").value = '';

        // Set focus to message field
        document.querySelector("#message").focus();

        // Prevent form submission
        return false;

    };


   socket.on('new room', channel => {
        /* The creating user will see it since we made the room creation in a separate page
         but we need to update everyone else */
        console.log('new room created')
        console.log(channel)
        // Trigger update
        const div = document.createElement('div');
        div.innerHTML = `<img src="static/img/bootstrap icons/caret-right-fill.svg"><button class="btn btn-link" data-channel="${ channel }">${ channel }</button>`;
        document.querySelector('#channels').append(div);

        /*
        // Focus on message field
        document.querySelector("#message").focus();
        */

        // Initialize onclick event of channels - otherwise the new button has no effect
        change_channel_function();


    });



});
