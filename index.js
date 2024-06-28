const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// app.set("view engine", 'ejs');
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/public/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});