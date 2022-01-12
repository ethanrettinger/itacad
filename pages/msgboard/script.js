 
// sendMessage function
const socket = io();

let initialScroll = false;
function sendMessage(sender, content, options) {
    let isFromMe = options?.isFromMe;
    let time = options?.time;
    /* check if content is empty */
    if (!content) {
        return;
    }
    if (content.trim().length == 0) {
        return;
    }
    /* check if content is too long */
    if (content.length > 500) {
        return;
    }
    // TODO: get client secret from sender and if it matches the user's secret, either:
    // - send message as You
    // - get the name of the associated secret and send message as them

    
    /* remove html from content */
    content = content.replace(/(<([^>]+)>)/gi, '');

    /* create divs to hold message and grab examples from index.html */
    let msgContainer = document.createElement('div');
    let header = document.createElement('div');
    header.className = 'messageHeader';
    let messageName = document.createElement('div');
    messageName.className = 'messageName';
    if (sender == 'self') {
        msgContainer.classList = 'message fromMe';
        messageName.innerHTML = '<p>You</p>';
    } else {
        msgContainer.classList = 'message fromOther';
        messageName.innerHTML = '<p>' + sender + '</p>';
    }
    let messageTime = document.createElement('div');
    messageTime.className = 'messageTime';
    // convert unix timestamp to readable time
    // get 12 hour time from timestamp
    let date = new Date(time / 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
    messageTime.innerHTML = '<p>' + date + '</p>';
    // format time

    let messageBody = document.createElement('div');
    messageBody.className = 'messageBody';
    messageBody.innerHTML = '<p>' + content + '</p>';

    /* append elements to divs */
    header.appendChild(messageName);
    header.appendChild(messageTime);
    msgContainer.appendChild(header);
    msgContainer.appendChild(messageBody);
    /* create 32 character alphanumeric message id and split it with a hyphen every 4 characters */
    let messageID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    messageID = messageID.match(/.{1,4}/g).join('-');
    msgContainer.id = messageID;
    /* append msgContainer to message list */
    /* add messageData(id) to msgContainer click */
    msgContainer.addEventListener('click', function () {
        let messageID = this.id;
        alert(messageID)
    });


    let messageList = document.getElementById('messageList');
    messageList.appendChild(msgContainer);
    if (!isFromMe) {
        return;
    }
    socket.emit('message', {
        sender: sender,
        content: content,
        time: time,
        messageID: messageID
    });
}

function scrollSmoothToBottom(id) {
    var div = document.getElementById(id);
    $('#' + id).animate(
        {
            scrollTop: div.scrollHeight - div.clientHeight,
        },
        400
    );
}


// thank jesus christ and the rest of the world for stackoverflow :praying:

// when an element is added to #messageList scroll to bottom
$('#messageList').on('DOMNodeInserted', function () {
    // set height of #messageList to scroll height of #messageList
    $('#messageList').height($('#messageList').prop('scrollHeight'));
    if(!initialScroll) { return; }
    scrollSmoothToBottom('messageList');
});


$('form').submit(function (e) {
    e.preventDefault();
    // clear input

    // get input
    let sender = 'self';
    let content = $('#messageInput').val();
    $('input').val('');
    // send message
    sendMessage(sender, content, {
        time: new Date().getTime(),
        isFromMe: true,
    });
});

// send get request to django server to get messages
$.ajax({
    url: '/api',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
        console.log(Object.keys(data))
        for (let i = 0; i < Object.keys(data).length; i++) {
            let keyname = Object.keys(data)[i];
            sendMessage(data[keyname]['sender'], data[keyname]['content'], {
                time: data[keyname]['time'],
                isFromMe: false,
            });
        }
    },
});

setTimeout(() => {
    scrollSmoothToBottom('messageList');
    initialScroll = true;
}, 400)

// open socket on frontend to receive messages

// socket detect broadcast message
socket.on('message', function (data) {
    sendMessage(data['sender'], data['content'], {
        time: new Date().getTime(),
        isFromMe: false,
    });
});

socket.on('connect', () => {
    socket.emit('join', {
        username: 'self',
    });
});

socket.on('disconnect', () => {
    socket.emit('leave', {
        username: 'self',
    });
});

socket.on('newUser', (user) => {
    // write new user to chat
    user = user['username'];
    let newUser = document.createElement('h3');
    newUser.innerHTML = '<p>' + user + ' has joined the chat</p>';
    document.getElementById('messageList').appendChild(newUser);
})

socket.on('oldUser', (user) => {
    // write old user to chat
    user = user['username'];
    let oldUser = document.createElement('h3');
    oldUser.innerHTML = '<p>' + user + ' has left the chat</p>';
    document.getElementById('messageList').appendChild(oldUser);
});

function loginPage() {
    window.location.href = '/login';
}