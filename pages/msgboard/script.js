// sendMessage function 

function sendMessage(sender, content) {
    console.log(content)
    /* check if content is empty */
    if(!content) { return; }
    if (content.length == 0) { return; }
    /* check if content is too long */
    if (content.length > 500) { return; }
    /* remove html from content */
    content = content.replace(/<\/?[^>]+(>|$)/g, "");
    /* remove newlines from content */
    content = content.replace(/\n/g, "");
    

    /* create divs to hold message and grab examples from index.html */
    let msgContainer = document.createElement("div");
    let header = document.createElement("div");
    header.className = "messageHeader";
    let messageName = document.createElement("div");
    messageName.className = "messageName";
    if(sender == "self") {
        msgContainer.classList = "message fromMe";
        messageName.innerHTML = "<p>You</p>";
    } else {
        msgContainer.classList = "message fromOther";
        messageName.innerHTML = "<p>" + sender + "</p>";
    }
    console.log(msgContainer)
    let messageTime = document.createElement("div");
    messageTime.className = "messageTime";
    messageTime.innerHTML = "<p>" + new Date().toLocaleTimeString() + "</p>";

    let messageBody = document.createElement("div");
    messageBody.className = "messageBody";
    messageBody.innerHTML = "<p>" + content + "</p>";
 
    /* append elements to divs */
    header.appendChild(messageName);
    header.appendChild(messageTime);
    msgContainer.appendChild(header);
    msgContainer.appendChild(messageBody);

    /* append msgContainer to message list */
    let messageList = document.getElementById("messageList");
    messageList.appendChild(msgContainer);
    $.ajax({
        url: "/msgboard/",
        type: "POST",
        data: {
            sender: sender,
            content: content,
            time: new Date().getTime()
        },
        dataType: "json",
        success: function(data) {
            console.log(data)
        }
    });
}

function scrollSmoothToBottom (id) {
    var div = document.getElementById(id);
    $('#' + id).animate({
       scrollTop: div.scrollHeight - div.clientHeight
    }, 400);
 }

scrollSmoothToBottom('messageList');
// thank jesus christ and the rest of the world for stackoverflow :praying:

// when an element is added to #messageList scroll to bottom
$('#messageList').on('DOMNodeInserted', function() {
    scrollSmoothToBottom('messageList');
});

$("form").submit(function(e) {
    e.preventDefault();
    // clear input
    
    // get input
    let sender = "self";
    let content = $("#messageInput").val();
    $("input").val("");
    // send message
    sendMessage(sender, content);
});


// send get request to django server to get messages
$.ajax({
    url: "/msgboard/",
    type: "GET",
    dataType: "json",
    success: function(data) {
        console.log(data)
        for(let i = 0; i < data.length; i++) {
            sendMessage(data[i]["sender"], data[i]["content"]);
        }
    }   
});


// send post request to django server to send message
