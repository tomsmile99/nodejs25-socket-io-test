import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config(); // โหลดค่า .env

const app = express();
const server = http.createServer((_, res) => { res.writeHead(200); res.end("OK"); });

// อ่านค่าจาก .env
//const PORT = process.env.PORT;
const ORIGIN = process.env.CORS_ORIGIN;

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket","polling"], // เปิด fallback เผื่อ
});

// เมื่อมี client connect
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // รับ event ตัวอย่าง
  socket.on("ping", (msg) => {
    console.log("📩 Received from client:", msg);
    socket.emit("pong", `Server response: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// HTTP route สำหรับทดสอบ
app.get("/", (req, res) => {
  res.send("Socket.IO server is running......");
});

// เริ่ม server
// server.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   console.log(`🌐 Allowed CORS origin: ${ORIGIN}`);
// });


io.on("connection", s => console.log("connected", s.id));
server.listen(4000);