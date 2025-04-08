const socketApi = (socket, io, db) => {
  console.log('a user connected');

  // crear sala gameEntry.jsx
  socket.on("create", (data) => createGame(db, data, socket))

  // unirse a una sala gameEntry.jsx
  socket.on("join", (codeId) => joinGame(db, socket, codeId))

  socket.on("join ok", (data) => joinGameOk(db, socket, data))

  // dar datos en sala creada game/roomId/page.jsx
  socket.on("fetch data", (roomId, idUserR, isHostR) => fetchData(db, socket, roomId, io, idUserR, isHostR))

  socket.on("msg", (data) => chatGroup(data, io))

  socket.on("game start", (data) => gameStart(data, db, socket, io))

  socket.on('disconnect', () => {
    console.log('user disconnected');

    if (socket.customId) {
      db.run(`DELETE FROM players WHERE playerId == ?`, [socket.customId], (err) => {
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
  });


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
  const { id, codeId, hostName, isHost, isStart } = data

  db.run(`INSERT INTO games (codeId, hostName, isHost, isStart) VALUES (?, ?, ?, ?)`, [codeId, hostName, isHost, isStart], msgError)
  db.run(`INSERT INTO players (playerId, codeId, player) VALUES (?, ?, ?)`, [id, codeId, hostName], msgError)
}
//join
const joinGame = (db, socket, codeId) => {
  db.all(`SELECT * FROM games WHERE codeId == ?`, [codeId], (err, row) => {
    if (err) {
      console.error("Error al obtener los datos:", err.message);
      return
    }
    socket.emit("response join", row)
  })
}
//join ok
const joinGameOk = (db, socket, data) => {
  const { id, codeId, hostName, isHost, isStart } = data
  db.run(`INSERT INTO players (playerId, codeId, player) VALUES (?, ?, ?)`, [id, codeId, hostName], msgError)
}

//fetch data
const fetchData = (db, socket, roomId, io, idUserR, isHostR) => {
  socket.customId = idUserR
  socket.isHost = isHostR
  socket.roomCode = roomId
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

const gameStart = (data, db, socket, io) => {
  if (!data) return
  db.run(`UPDATE games SET isStart = 1 WHERE codeId = ?`, [data])
  io.to(data).emit("response game start", true)
}