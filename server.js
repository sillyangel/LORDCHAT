const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};

app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {
  socket.on('userJoined', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('userJoined', username);
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit('userLeft', username);
  });

  socket.on('tabSwitched', (isTabSwitched) => {
    if (isTabSwitched) {
      socket.emit('tabSwitched', true);
    } else {
      socket.emit('tabSwitched', false);
    }
  });

  socket.on('chatMessage', ({ username, message }) => {
    io.emit('chatMessage', { username, message });
  });
});

const PORT = process.env.PORT || 3000;

// server.js
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
