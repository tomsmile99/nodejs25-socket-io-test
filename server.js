require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 4001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://isr.sakerp.org'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  // ปรับแต่งเพิ่มเติมได้ เช่น pingTimeout/pingInterval
});

app.get('/', (_req, res) => {
  res.send('Socket.IO server is running ✅');
});

// ตัวอย่าง event
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // ส่ง welcome ไปหา client ที่เพิ่งต่อ
  socket.emit('server:welcome', { msg: 'Welcome from server', id: socket.id });

  // รับข้อความจาก client
  socket.on('client:ping', (payload) => {
    console.log('📨 client:ping ->', payload);
    // โต้กลับผู้ส่ง
    socket.emit('server:pong', { ok: true, received: payload });
    // กระจายให้ทุก client
    io.emit('server:broadcast', { from: socket.id, data: payload });
  });

  // ตัวอย่าง join room
  socket.on('room:join', (room) => {
    socket.join(room);
    socket.emit('room:joined', room);
  });

  // ส่งเฉพาะ room (ถ้าต้องการ)
  socket.on('room:message', ({ room, text }) => {
    io.to(room).emit('room:message', { from: socket.id, text });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server listening on ${PORT}`);
});


