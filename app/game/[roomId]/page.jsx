'use client'

import ReduxProvider from "../../../components/ReduxProvider"
import styles from "./page.module.css"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client";
import sigotoInit from "../../../dataGame/sigoto.json"
import situationInit from "../../../dataGame/situation.json"
import { roundSelection } from "../../../lib/utils"
import { setCode, startGameState } from "../../../store/features/game"
import EnterName from "../../../components/enterName"
import GameInterface from "../../../components/gameInterface"
import { v4 as uuidv4 } from 'uuid'

const page = () => {

  return (
    <ReduxProvider>
      <PageComponent />
    </ReduxProvider>
  )
}


const PageComponent = () => {

  const dispatch = useDispatch()
  const socketRef = useRef(null)
  const colorMap = useRef({})
  const chatBoxRef = useRef(null)

  const [players, setPlayers] = useState([])
  const [gameOpen, setGameOpen] = useState(true)
  // useState para mensajes
  const [inputMsg, setinputMsg] = useState("")
  const [chatGroup, setChatGroup] = useState([])
  // juego iniciado
  const [sigotos, setSigotos] = useState(sigotoInit)
  const [sigotosSelected, setSigotosSelected] = useState(null)
  const [situation, setSituation] = useState(situationInit)
  const [situationSelected, setSituationSelected] = useState(null)

  const { codeGame, userName, idUser, isHost, isStart } = useSelector(state => state.game)

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

    if (codeGame) {
      socketRef.current.emit("fetch data", { codeGame, idUser, isHost })
    }
    socketRef.current.on("response fetch data", (data) => setPlayers(data))

    socketRef.current.on("response msg", (data) => {
      setChatGroup(prev => [...prev, { ...data, color: obtenerColorUnico(data.name) }])
    })

    // se ejecuta en caso de que el socket cierre el juego
    socketRef.current.on("close room", (info) => setGameOpen(info))

    // se inicia el juego
    socketRef.current.on("response game start", (data) => {
      if (!isHost) {
        setSigotosSelected(data.sigotosSelected)
        setSituationSelected(data.situationSelected)
      }
      dispatch(startGameState(data.start))
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  useEffect(() => {
    if (codeGame) {
      socketRef.current.emit("fetch data", { codeGame, idUser, isHost })
    }
  }, [codeGame])

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatGroup])

  useEffect(()=> {
    if (sigotosSelected && situationSelected) {
      const data = {
        codeGame: codeGame,
        sigotosSelected: sigotosSelected,
        situationSelected: situationSelected
      }
      socketRef.current.emit("game start", data)
    }
  }, [sigotosSelected, situationSelected])

  const sendMsg = () => {
    if (!inputMsg.trim()) return
    socketRef.current.emit("msg", { name: userName, msg: inputMsg, roomId: codeGame })
    setinputMsg("")
  }

  const enterUrlCode = (name) => {

    const code = window.location.pathname.split("/")[2]

    const data = {
      idUser: uuidv4().toString(),
      codeGame: code,
      userName: name,
      isHost: 0,
      isStart: 0,
    }

    socketRef.current.emit("join", code)

    socketRef.current.on("response join", (response) => {
      if (!response.length || response[0].isStart == 1) {
        setGameOpen(false)
      } else {
        socketRef.current.emit("join ok", data)

        dispatch(setCode(data))
      }
    })
  }

  const startGame = () => {
    roundSelection(sigotos, setSigotos, setSigotosSelected, situation, setSituation, setSituationSelected)
  }

  if (!gameOpen) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>La sala a la que intentaste entrar no existe o se ha cerrado</h1>
      </div>
    )
  }

  if (!userName) {
    return (
      <EnterName enterUrlCode={enterUrlCode} />
    )
  }

  return (
    <>
      {!isStart ?
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Código de invitación: {codeGame}</h1>
            <p className={styles.playerInfo}>Jugando como: {userName}</p>
          </header>

          <main className={styles.main}>
            <div className={styles.playersSection}>
              <div className={styles.leftSection}>
                <h3>Jugadores:</h3>
                <ul className={styles.playerList}>
                  {players.map((player) => (
                    <li key={player.idUser} className={styles.playerItem}>
                      {player.userName}
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
              {isHost ? <button className={styles.backButton} onClick={startGame}>
                Iniciar
              </button> : null}
            </div>
          </main>
        </div>
        :
        <GameInterface
          players={players}
          sigotosSelected={sigotosSelected}
          situationSelected={situationSelected}
        />
      }
    </>
  )
}

export default page