const socket = io();

function createRoom() {
  const name = document.getElementById('name').value;
  const logo = document.getElementById('logo').value;
  const password = prompt("Enter 4-digit room password");

  socket.emit('createRoom', { name, password, logo });

  socket.on('roomCreated', ({ roomId }) => {
    window.location.href = `/room/${roomId}`;
  });
}

function joinRoom() {
  const name = document.getElementById('name').value;
  const logo = document.getElementById('logo').value;
  const roomId = document.getElementById('joinRoomId').value;
  const password = document.getElementById('joinPassword').value;

  socket.emit('joinRoom', { roomId, password, name, logo });
  window.location.href = `/room/${roomId}`;
}

function ready() {
  const roomId = window.location.pathname.split('/').pop();
  socket.emit('ready', roomId);
}

function sendMessage() {
  const message = document.getElementById('chatInput').value;
  const roomId = window.location.pathname.split('/').pop();
  socket.emit('chat', { roomId, message, name: "Me" });
}

socket.on('chat', ({ name, message }) => {
  const div = document.createElement('div');
  div.textContent = `${name}: ${message}`;
  document.getElementById('messages').appendChild(div);
});

socket.on('startGame', () => {
  alert("Game is starting!");
});

socket.on('updatePlayers', players => {
  const div = document.getElementById('players');
  div.innerHTML = '';
  players.forEach(p => {
    const el = document.createElement('div');
    el.innerHTML = `<img src="/logos/${p.logo}" width="30"> ${p.name}`;
    div.appendChild(el);
  });
});
