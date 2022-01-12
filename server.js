const path = require('path');
const http = require('http');
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
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
const userdb = new JSONdb('data/users.json');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/msgboard/index.html'));
});
app.get('/api', (req, res) => {
    // send data/messages.json to client
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
app.use(express.static(path.join(__dirname, 'pages/msgboard')));

io.on('connection', (socket) => {
// tell all users that a new user has joined
    socket.on('join', (data) => {
        socket.broadcast.emit('newUser', data);
    });
    // Listen for chatMessage
  socket.on('message', msg => {
    io.emit('message', msg);
    // get messages.json and add new message to object
    // if db has more than 50 messages delete the first one
    db.set(msg.messageID, msg);
    if(Object.keys(db.JSON()).length < 100) {
        
        return;
    } else {
        db.delete(db.JSON()[Object.keys(db.JSON())[0]]?.messageID);
        console.log('deleted')
    }
    
    
  });

  // Runs when client disconnects
  socket.on('disconnect', (data) => {
    socket.broadcast.emit('oldUser', data);
    });
});

app.get('/users', (req, res) => {
    // send data/users.json to client
    res.sendFile(path.join(__dirname, 'data/users.json'));
});

app.post('/users', async (req, res) => {
    // register user with username and password
    try {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(req.body.password, salt);
        const user = {
            name: req.body.name,
            username: req.body.username,
            password: hash,
            secret: req.body.secret,
        }
        let users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8'));
        users.push(user);
        fs.writeFileSync(path.join(__dirname, 'data/users.json'), JSON.stringify(users));
    
    
    
        res.status(200).send({ success: true, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));