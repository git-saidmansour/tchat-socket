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

let connectedUsers = [];

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

io.on('connection', async (socket) => {
  try {
    let userInfo = await socket.timeout(5000).emitWithAck('register event')
    connectedUsers.push({
      username: userInfo.username,
      socketId: socket.id
    });
    console.log(userInfo.username, 'is conected');
    io.emit("connection event", connectedUsers.length);
    
    socket.on('chat message', (message) => {
        io.timeout(5000).emit('date event', (error, response) => {
          if (error) {
            console.log("une erreur");
            message.messageTime = moment().format("HH:mm");
            io.emit('chat message', message);
          } else {
            for(const elt of response){
              message.messageTime = moment(elt.date).format("HH:mm");
              const user = connectedUsers.filter((user) => user.username === elt.username);
              io.to(user[0].socketId).emit('chat message', message);
            }
            console.log(message, `at ${moment().format("DD/MM/YYYY HH:mm")}`);
          }
        })
    });

    // socket.onAny((eventName, ...args) => {
    //   console.log("debug in event")
    //   console.log(eventName); // 'hello'
    //   console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    // });

    // socket.onAnyOutgoing((eventName, ...args) => {
    //   console.log("debug out event")
    //   console.log(eventName); // 'hello'
    //   console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    // });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user.socketId !== socket.id);
        console.log('user disconnected');
        io.emit("connection event", connectedUsers.length);
    });
  } catch (error) {
    console.log(error.message)
    socket.disconnect();
  }
});

server.listen(process.env.PORT || '3000', () => {
  console.log('server running at http://localhost:3000');
});