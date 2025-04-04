const express = require("express")
const next = require("next")
const http = require('http');
const app = express()
const server = http.createServer(app);
const { Server } = require("socket.io");
const socketApi = require("./sockets.js");
const io = new Server(server)
const sqlite3 = require('sqlite3').verbose();

const nextApp = next({ dev: false })
const handle = nextApp.getRequestHandler()
const db = new sqlite3.Database('./database/game');

const PORT = 3000

db.run(`CREATE TABLE IF NOT EXISTS games (
  idUser INTEGER PRIMARY KEY NOT NULL,
  codeId INTEGER NOT NULL, 
  hostName TEXT NOT NULL,
  isHost INTEGER,
  isStart INTEGER
);`)

db.run(`CREATE TABLE IF NOT EXISTS players (
  playerId TEXT NOT NULL,
  codeId TEXT NOT NULL, 
  player TEXT
);`)

nextApp.prepare().then(() => {

  app.get("/api/data", (req, res) => {
    res.json({ message: "Hola desde el backend" })
  })

  io.on("connection", (socket)=> socketApi(socket, io, db))

  app.use((req, res) => handle(req, res));

  server.listen(PORT, () => {
    console.log(`Server ejecutandose en http://localhost:${PORT}`)
  })
})
