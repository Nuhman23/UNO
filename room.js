const rooms = {};

function createRoom(roomId, password) {
  rooms[roomId] = {
    password,
    players: [],
    ready: {}
  };
}

function isValidRoom(roomId, password) {
  return rooms[roomId] && rooms[roomId].password === password;
}

function addPlayer(roomId, socketId, name, logo) {
  const room = rooms[roomId];
  if (room.players.length >= 6) return false;

  room.players.push({ id: socketId, name, logo });
  room.ready[socketId] = false;
  return true;
}

function setReady(socketId, roomId) {
  rooms[roomId].ready[socketId] = true;
}

function allReady(roomId) {
  const room = rooms[roomId];
  return room.players.length >= 2 &&
         room.players.length <= 6 &&
         Object.values(room.ready).every(r => r);
}

function getRoomPlayers(roomId) {
  return rooms[roomId].players;
}

function getRoomIdByPlayer(socketId) {
  for (let id in rooms) {
    if (rooms[id].players.find(p => p.id === socketId)) return id;
  }
  return null;
}

function removePlayer(roomId, socketId) {
  const room = rooms[roomId];
  if (!room) return;
  room.players = room.players.filter(p => p.id !== socketId);
  delete room.ready[socketId];
}

module.exports = {
  createRoom,
  isValidRoom,
  addPlayer,
  setReady,
  allReady,
  getRoomPlayers,
  getRoomIdByPlayer,
  removePlayer
};
