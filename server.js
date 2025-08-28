const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 静的ファイルを配信（フロントHTML置く用）
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = generateRoomId();
    rooms[roomId] = { board: Array(9).fill(null), turn: "X" };
    socket.join(roomId);
    socket.emit("roomCreated", roomId);
    io.to(roomId).emit("state", rooms[roomId]);
  });

  socket.on("joinRoom", (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      socket.emit("roomJoined", roomId);
      io.to(roomId).emit("state", rooms[roomId]);
    } else {
      socket.emit("error", "ルームが存在しません");
    }
  });

  socket.on("move", ({ roomId, index }) => {
    const game = rooms[roomId];
    if (!game || game.board[index]) return;

    game.board[index] = game.turn;
    game.turn = game.turn === "X" ? "O" : "X";
    io.to(roomId).emit("state", game);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
