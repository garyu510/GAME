// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 各ルームのゲーム状態を保持
const rooms = {};

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { board: Array(9).fill(null), turn: "X" };
    }
    io.to(roomId).emit("state", rooms[roomId]);
  });

  socket.on("move", ({ roomId, index }) => {
    const game = rooms[roomId];
    if (!game) return;

    if (!game.board[index]) {
      game.board[index] = game.turn;
      game.turn = game.turn === "X" ? "O" : "X";
      io.to(roomId).emit("state", game);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
