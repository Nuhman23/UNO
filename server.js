const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
const rooms = require('./rooms');

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/room/:roomId', (req, res) => {
  res.sendFile(__dirname + '/public/game.html');
});

io.on('connection', socket => {
  socket.on('createRoom', ({ name, password, logo }) => {
    const roomId = uuidv4().slice(0, 6);
    rooms.createRoom(roomId, password);
    socket.join(roomId);
    rooms.addPlayer(roomId, socket.id, name, logo);
    socket.emit('roomCreated', { roomId });
  });

  socket.on('joinRoom', ({ roomId, password, name, logo }) => {
    if (!rooms.isValidRoom(roomId, password)) {
      socket.emit('error', 'Invalid Room ID or Password');
      return;
    }

    if (!rooms.addPlayer(roomId, socket.id, name, logo)) {
      socket.emit('error', 'Room is Full');
      return;
    }

    socket.join(roomId);
    io.to(roomId).emit('updatePlayers', rooms.getRoomPlayers(roomId));
  });

  socket.on('chat', ({ roomId, message, name }) => {
    io.to(roomId).emit('chat', { name, message });
  });

  socket.on('ready', roomId => {
    rooms.setReady(socket.id, roomId);
    if (rooms.allReady(roomId)) {
      io.to(roomId).emit('startGame');
    }
  });

  socket.on('disconnect', () => {
    const roomId = rooms.getRoomIdByPlayer(socket.id);
    if (roomId) {
      rooms.removePlayer(roomId, socket.id);
      io.to(roomId).emit('updatePlayers', rooms.getRoomPlayers(roomId));
    }
  });
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
