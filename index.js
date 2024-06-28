const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("view engine", 'ejs');

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render("index.ejs");
});

app.get('/chat', (req, res) => {
    res.render('chat.ejs', {username: req.query.username});
});

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('chat message', (message) => {
        message.messageTime = moment().format("HH:mm");
        console.log(`${message.senderName}: ${message.message}\n${message.messageTime}`)
        io.emit('chat message', message);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(process.env.PORT || '3000', () => {
  console.log('server running at http://localhost:3000');
});