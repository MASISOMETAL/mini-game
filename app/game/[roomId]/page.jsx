'use client'

import ReduxProvider from "../../../components/ReduxProvider"
import styles from "./page.module.css"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { io } from "socket.io-client";

const page = () => {
  return (
    <ReduxProvider>
      <PageComponent />
    </ReduxProvider>
  )
}


const PageComponent = () => {
  const socketRef = useRef(null)
  const [codeRoom, setCodeRoom] = useState("")
  const [hostName, setHostName] = useState("")
  const [idUser, setidUser] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [isStart, setIsStart] = useState(false)
  const [players, setPlayers] = useState([])
  const [inputMsg, setinputMsg] = useState("")
  const [chatGroup, setChatGroup] = useState([])
  const [colorText, setColorText] = useState(obtenerColorRandom())

  const roomId = useSelector(state => state.game.codeGame)
  const hostNameR = useSelector(state => state.game.hostName)
  const isStartR = useSelector(state => state.game.isStart)
  const idUserR = useSelector(state => state.game.id)
  const isHostR = useSelector(state => state.game.isHost)

  useEffect(() => {
    socketRef.current = io()

    socketRef.current.emit("fetch data", roomId, idUserR, isHostR)
    socketRef.current.on("response fetch data", (data) => {
      console.log(data);

      setCodeRoom(roomId)
      setHostName(hostNameR)
      setIsHost(isHostR)
      setidUser(idUserR)
      setIsStart(isStartR)
      setPlayers(data)

    })

    socketRef.current.on("response msg", (data) => {
      setChatGroup(prev => [...prev, data])
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  const sendMsg = () => {
    socketRef.current.emit("msg", { name: hostNameR, msg: inputMsg, roomId: roomId })
    setinputMsg("")
  }

  function obtenerColorRandom() {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letras[Math.floor(Math.random() * 16)];
    }
    return { color };
  }
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Game Room: {codeRoom}</h1>
        <p className={styles.playerInfo}>Playing as: {hostName}</p>
      </header>

      <main className={styles.main}>
        <div className={styles.playersSection}>
          <div className={styles.leftSection}>
            <h3>Players:</h3>
            <ul className={styles.playerList}>
              {players.map((player) => (
                <li key={player.playerId} className={styles.playerItem}>
                  Jugador {player.player}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.rightSection}>
            <h3>Chat:</h3>
            <div className={styles.chatBox}>
              <ul className={styles.chatMessages}>
                {chatGroup.map((msg, index) => (
                  <li key={index} className={styles.chatMessage}><span style={colorText}>{msg.name}</span>: {msg.msg}</li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className={styles.chatInput}
                onChange={(e) => setinputMsg(e.target.value)}
                value={inputMsg}
              />
              <button className={styles.sendButton} onClick={sendMsg}>Enviar</button>
            </div>
          </div>
        </div>

        <div className={styles.gameInfo}>
          <h2>Game Room Created!</h2>
          <p>
            Share this code with your friends: <strong>{codeRoom}</strong>
          </p>
          <p>This is a placeholder for the actual game content.</p>
        </div>

        <Link href="/" className={styles.backButton}>
          Back to Home
        </Link>
      </main>
    </div>
  )
}

export default page