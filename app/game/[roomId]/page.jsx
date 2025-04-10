'use client'

import ReduxProvider from "../../../components/ReduxProvider"
import styles from "./page.module.css"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { io } from "socket.io-client";
import sigotoInit from "../../../dataGame/sigoto.json"
import situationInit from "../../../dataGame/situation.json"
import { roundSelection } from "../../../lib/utils"

const page = () => {
  return (
    <ReduxProvider>
      <PageComponent />
    </ReduxProvider>
  )
}


const PageComponent = () => {
  const socketRef = useRef(null)
  const colorMap = useRef({})
  const chatBoxRef = useRef(null)

  const [isHost, setIsHost] = useState(true)
  const [isStart, setIsStart] = useState(false)
  const [players, setPlayers] = useState([])
  const [inputMsg, setinputMsg] = useState("")
  const [chatGroup, setChatGroup] = useState([])
  // juego iniciado
  const [sigotos, setSigotos] = useState(sigotoInit)
  const [sigotosSelected, setSigotosSelected] = useState([])
  const [situation, setSituation] = useState(situationInit)
  const [situationSelected, setSituationSelected] = useState({})

  const roomId = useSelector(state => state.game.codeGame)
  const hostNameR = useSelector(state => state.game.hostName)
  const idUserR = useSelector(state => state.game.id)
  const isHostR = useSelector(state => state.game.isHost)

  const obtenerColorUnico = (name) => {
    if (!colorMap.current[name]) {
      const letras = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
      }
      colorMap.current[name] = color;
    }
    return colorMap.current[name];
  };


  useEffect(() => {
    socketRef.current = io()

    socketRef.current.emit("fetch data", roomId, idUserR, isHostR)
    socketRef.current.on("response fetch data", (data) => setPlayers(data))

    socketRef.current.on("response msg", (data) => {
      setChatGroup(prev => [...prev, { ...data, color: obtenerColorUnico(data.name) }])
    })

    socketRef.current.on("close room", (info) => setIsHost(info))

    socketRef.current.on("response game start", (isStart) => setIsStart(isStart))


    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatGroup])

  const sendMsg = () => {
    if (!inputMsg.trim()) return
    socketRef.current.emit("msg", { name: hostNameR, msg: inputMsg, roomId: roomId })
    setinputMsg("")
  }

  const startGame = () => {
    socketRef.current.emit("game start", roomId)
    setIsStart(true)
  }

  const activacion = () => {
    roundSelection(sigotos, setSigotos, setSigotosSelected, situation, setSituation, setSituationSelected)
  }

  if (!isHost) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>La sala a la que intentaste entrar no existe o se ha cerrado</h1>
      </div>
    )
  }

  return (
    <>
      {!isStart ?
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Código de invitación: {roomId}</h1>
            <p className={styles.playerInfo}>Jugando como: {hostNameR}</p>
          </header>

          <main className={styles.main}>
            <div className={styles.playersSection}>
              <div className={styles.leftSection}>
                <h3>Jugadores:</h3>
                <ul className={styles.playerList}>
                  {players.map((player) => (
                    <li key={player.playerId} className={styles.playerItem}>
                      {player.player}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.rightSection}>
                <h3>Chat:</h3>
                <div className={styles.chatBox}>
                  <ul className={styles.chatMessages} ref={chatBoxRef}>
                    {chatGroup.map((msg, index) => (
                      <li key={index} className={styles.chatMessage}><span style={{ color: msg.color }}>{msg.name}</span>: {msg.msg}</li>
                    ))}
                  </ul>
                  <form onSubmit={(e) => { e.preventDefault(); sendMsg(); }} className={styles.containerForm}>
                    <input
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      className={styles.chatInput}
                      onChange={(e) => setinputMsg(e.target.value)}
                      value={inputMsg}
                    />
                    <button className={styles.sendButton} type="submit">Enviar</button>
                  </form>
                </div>
              </div>
            </div>

            <div className={styles.btnHandler}>
              <Link href="/" className={styles.backButton}>
                Salir
              </Link>
              {isHostR ? <button className={styles.backButton} onClick={startGame}>
                Iniciar
              </button> : null}
            </div>
          </main>
        </div>
        :
        <div className={styles.container}>
          <h2>Sigotos</h2>
          <div className={styles.containerCard}>
            {sigotosSelected && sigotosSelected.map((item, index) =>
              <div key={index} className={styles.card}>
                <img src={item.image} alt={item.name} width={100} height={100} />
                <p>{item.name}</p>
              </div>
            )}
          </div>
          <h2>Situacion</h2>
          <p>{situationSelected.situation}</p>
          <button onClick={activacion}>Activar</button>
        </div>
      }
    </>
  )
}

export default page