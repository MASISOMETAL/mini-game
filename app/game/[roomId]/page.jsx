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
import { v4 as uuidv4 } from 'uuid'
import Image from "next/image"

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
  const [sigotosSelected, setSigotosSelected] = useState([])
  const [situation, setSituation] = useState(situationInit)
  const [situationSelected, setSituationSelected] = useState({})

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

    socketRef.current.on("response game start", (isStart) => dispatch(startGameState(isStart)))

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
    socketRef.current.emit("game start", codeGame)
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
              <h3>Sigotos:</h3>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <td className={styles.cell}>1</td>
                      <td className={styles.cell}>2</td>
                      <td className={styles.cell}>3</td>
                    </tr>
                    <tr>
                      <td className={styles.cell}>
                        {sigotosSelected[0] && <img
                          src={sigotosSelected[0].image}
                          alt={sigotosSelected[0].name}
                          className={styles.image}
                        />}
                      </td>
                      <td className={styles.cell}>
                      {sigotosSelected[1] && <img
                          src={sigotosSelected[1].image}
                          alt={sigotosSelected[1].name}
                          className={styles.image}
                        />}
                      </td>
                      <td className={styles.cell}>
                      {sigotosSelected[2] && <img
                          src={sigotosSelected[2].image}
                          alt={sigotosSelected[2].name}
                          className={styles.image}
                        />}
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.cell}>4</td>
                      <td className={styles.cell}>5</td>
                      <td className={styles.cell}>6</td>
                    </tr>
                    <tr>
                      <td className={styles.cell}>
                      {sigotosSelected[3] && <img
                          src={sigotosSelected[3].image}
                          alt={sigotosSelected[3].name}
                          className={styles.image}
                        />}
                      </td>
                      <td className={styles.cell}>
                      {sigotosSelected[4] && <img
                          src={sigotosSelected[4].image}
                          alt={sigotosSelected[4].name}
                          className={styles.image}
                        />}
                      </td>
                      <td className={styles.cell}>
                      {sigotosSelected[5] && <img
                          src={sigotosSelected[5].image}
                          alt={sigotosSelected[5].name}
                          className={styles.image}
                        />}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </main>
      }
    </>
  )
}

export default page