// server.js
require('dotenv').config();
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');

const PORT = process.env.PORT || 4003;
const ALLOW = (process.env.CLIENT_ORIGINS || 'http://127.0.0.1:3008')
  .split(',').map(s => s.trim());

const app = express();
app.use(cors({ origin: ALLOW }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ALLOW, methods: ['GET','POST'] },
  pingInterval: 25000,
  pingTimeout : 20000,
});

// debug engine error ช่วยตอนหาเหตุวืด
io.engine.on('connection_error', (err) => {
  console.log('engine connection_error:', err.code, err.message);
});

io.on('connection', (socket) => {
  console.log('🔌 connected:', socket.id);
  socket.emit('server:welcome', { msg: 'hi', id: socket.id });

  socket.on('client:ping', (payload, cb) => {
    console.log('📥 client:ping', payload);
    socket.emit('server:pong', { ok: true, at: Date.now() });
    io.emit('server:broadcast', { from: socket.id, data: payload });
    cb && cb({ received: true });
  });

  socket.on('room:join', (room) => {
    socket.join(room);
    socket.emit('room:joined', room);
  });

  socket.on('room:message', ({ room, text }) => {
    io.to(room).emit('room:message', { from: socket.id, text, at: Date.now() });
  });

  socket.on('disconnect', (r) => console.log('❌ disconnected:', socket.id, r));
});

app.get('/', (_req, res) => res.send('Socket.IO server is running ✅'));

server.listen(PORT, '127.0.0.1', () =>
  console.log(`🚀 Socket.IO server listening on http://127.0.0.1:${PORT}`)
);
