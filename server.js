const path = require('path');
const http = require('http');
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const server = http.createServer(app);
const cors = require('cors');

app.use(cors())
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'ixbu428ge',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
  genid: () => {
    return genid(); // use UUIDs for session IDs
  }
}));


const JSONdb = require('simple-json-db');
const db = new JSONdb('data/messages.json');
const userdb = new JSONdb('data/users.json');
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/msgboard/index.html'));
});
app.get('/api', (req, res) => {
    // send data/messages.json to client
    res.send(db.JSON());
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/landing/index.html'));
});
app.post('/users', async (req, res) => {
    // register user with username and password
    try {
        const { username, password, display } = req.body;
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        
        let users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8'));
        users.push({
            'username': username,
            'password': hash,
            'display': display
        });
        fs.writeFileSync(path.join(__dirname, 'data/users.json'), JSON.stringify(users));
        req.session.userId = username;
        req.session.loggedIn = true;
        // redirect user
        res.redirect('/');
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post('/log_in', async (req, res) => {
    // login user with username and password
    try {
        const { username, password } = req.body;
        let users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8'));
        let user = users.find(user => user.username === username);
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {    
                res.cookie('userId', username, { maxAge: 86400, httpOnly: true });
                req.session.userId = username;
                req.session.loggedIn = true;
                res.redirect('/');
            } else {
                res.redirect(301, '/login');
            }
        } else {
            res.redirect(301, '/login');
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
// Set static folder
app.use(express.static(path.join(__dirname, 'pages')));

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

function genid() {
    // make a random UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));