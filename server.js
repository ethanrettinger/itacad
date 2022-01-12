const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

const JSONdb = require('simple-json-db');
const db = new JSONdb('data/messages.json');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/api', (req, res) => {
    // send data/messages.json to client
    console.log(db.JSON())
    res.send(db.JSON());
});

app.post('/register', async (req, res) => {
    // register user with username and password
    // save user to data/users.json
    // return success message
    const user = req.body;
    const users = await fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8');
    const usersObj = JSON.parse(users);
    usersObj.push(user);
    await fs.writeFileSync(path.join(__dirname, 'data/users.json'), JSON.stringify(usersObj));
    res.send({
        success: true,
        message: 'User registered successfully'
    });
});
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
// tell all users that a new user has joined
    socket.on('join', (data) => {
        socket.broadcast.emit('newUser', data);
    });
    // Listen for chatMessage
  socket.on('message', msg => {
    io.emit('message', msg);
    console.log(msg)
    // get messages.json and add new message to object
    db.set(msg.messageID, msg);
  });

  // Runs when client disconnects
  socket.on('disconnect', (data) => {
    socket.broadcast.emit('oldUser', data);
    });
});
const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));