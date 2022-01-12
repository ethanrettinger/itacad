// sendMessage function

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
    let date = new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
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

    /* append msgContainer to message list */
    let messageList = document.getElementById('messageList');
    messageList.appendChild(msgContainer);
    if (!isFromMe) {
        return;
    }
    $.ajax({
        url: '/message_board/api',
        type: 'POST',
        data: {
            sender: sender,
            content: content,
            time: new Date().getTime(),
        },
        dataType: 'json',
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

scrollSmoothToBottom('messageList');
// thank jesus christ and the rest of the world for stackoverflow :praying:

// when an element is added to #messageList scroll to bottom
$('#messageList').on('DOMNodeInserted', function () {
    // set height of #messageList to scroll height of #messageList
    $('#messageList').height($('#messageList').prop('scrollHeight'));
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
    url: '/message_board/api',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
        for (let i = 0; i < data.length; i++) {
            sendMessage(data[i]['sender'], data[i]['content'], {
                time: data[i]['time'],
                isFromMe: false,
            });
        }
    },
});

// open socket on frontend to receive messages
let socket = io.connect('http://localhost:5500');

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
