const socketApi = (socket, io, db) => {
  console.log('a user connected');

  // crear sala gameEntry.jsx
  socket.on("create", (data) => createGame(db, data, socket))

  // unirse a una sala gameEntry.jsx
  socket.on("join", (codeId) => joinGame(db, socket, codeId))

  socket.on("join ok", (data) => joinGameOk(db, socket, data))

  // dar datos en sala creada game/roomId/page.jsx
  socket.on("fetch data", (data) => fetchData(db, socket, io, data))

  socket.on("msg", (data) => chatGroup(data, io))

  socket.on("game start", (data) => gameStart(data, db, socket, io))

  socket.on('disconnect', () => closeSocket(socket, db, io))
}

module.exports = socketApi

function msgError(err) {
  if (err) {
    console.error("Error al insertar datos:", err.message);
  } else {
    console.log(`Un mensaje ha sido guardado en la base de datos con ID ${this.lastID}`);
  }
}
//create
const createGame = (db, data, socket) => {
  const { codeGame, userName, idUser, isHost, isStart } = data
  console.log(data);
  

  db.run(`INSERT INTO games (codeId, userName, idUser, isHost, isStart) VALUES (?, ?, ?, ?, ?)`, [codeGame, userName, idUser, isHost, isStart], msgError)
  db.run(`INSERT INTO players (idUser, codeId, userName, isHost) VALUES (?, ?, ?, ?)`, [idUser, codeGame, userName, isHost], msgError)
}
//join
const joinGame = (db, socket, codeGame) => {
  db.all(`SELECT * FROM games WHERE codeId == ?`, [codeGame], (err, row) => {
    if (err) {
      console.error("Error al obtener los datos:", err.message);
      return
    }
    socket.emit("response join", row)
  })
}
//join ok
const joinGameOk = (db, socket, data) => {
  const { codeGame, userName, idUser, isHost } = data
  db.run(`INSERT INTO players (idUser, codeId, userName, isHost) VALUES (?, ?, ?, ?)`, [idUser, codeGame, userName, isHost], msgError)
}

//fetch data
const fetchData = (db, socket, io, data) => {
  const { codeGame: roomId, idUser, isHost } = data
  // añadir valores al socket, para capturarlos en caso de cerrarse
  socket.roomCode = roomId
  socket.customId = idUser
  socket.isHost = isHost

  socket.join(roomId)
  db.all(`SELECT * FROM players WHERE codeId == ?`, [roomId], (err, row) => {
    if (err) {
      console.error("Error al obtener los datos:", err.message);
      return
    }
    io.to(roomId).emit("response fetch data", row)
  })
}
//msg
const chatGroup = (data, io) => {
  const { name, msg, roomId } = data
  io.to(roomId).emit("response msg", data)
}

const gameStart = (codeGame, db, socket, io) => {
  if (!codeGame) return
  db.run(`UPDATE games SET isStart = 1 WHERE codeId = ?`, [codeGame])
  io.to(codeGame).emit("response game start", true)
}

const closeSocket = (socket, db, io) => {
  {
    console.log('user disconnected');

    if (socket.customId) {
      db.run(`DELETE FROM players WHERE idUser == ?`, [socket.customId], (err) => {
        if (err) {
          console.error("Error al eliminar el jugador:", err.message);
          return;
        }
      });
      db.all(`SELECT * FROM players WHERE codeId == ?`, [socket.roomCode], (err, row) => {
        if (err) {
          console.error("Error al obtener los datos:", err.message);
          return
        }
        io.to(socket.roomCode).emit("response fetch data", row)
      })
    }

    if (socket.isHost) {
      db.run(`DELETE FROM games WHERE codeId == ?`, [socket.roomCode], (err) => {
        if (err) {
          console.error("Error al eliminar el jugador:", err.message);
          return;
        }
      })
      io.to(socket.roomCode).emit("close room", false)
    }
  }
}