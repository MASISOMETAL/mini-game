'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/navigation"
import styles from "./gameEntry.module.css"
import { io } from "socket.io-client";
import { useDispatch } from 'react-redux';
import { setCode } from '../store/features/game';
import { v4 as uuidv4 } from 'uuid'

const GameEntry = () => {

  const router = useRouter()
  const [activeTab, setActiveTab] = useState("create")
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [btnBlock, setBtnBlock] = useState(false)
  const socketRef = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    socketRef.current = io()

    return () => socketRef.current.disconnect()
  }, [])

  const handleCreateGame = (e) => {
    e.preventDefault()
    if (!playerName.trim()) return
    setBtnBlock(true)

    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const data = {
      codeGame: newRoomCode,
      userName: playerName,
      idUser: uuidv4().toString(),
      isHost: 1,
      isStart: 0,
    }

    dispatch(setCode(data))

    socketRef.current.emit("create", data)
    router.push(`/game/${newRoomCode}`)
  }

  const handleJoinGame = (e) => {
    e.preventDefault()
    if (!playerName.trim() || !roomCode.trim()) return

    const data = {
      idUser: uuidv4().toString(),
      codeGame: roomCode,
      userName: playerName,
      isHost: 0,
      isStart: 0,
    }

    dispatch(setCode(data))

    socketRef.current.emit("join", roomCode)

    socketRef.current.on("response join", (response) => { 
      if (response.length) {
        if (response[0].isStart == 1) {
          setCodeError("El juego ya fue iniciado")
        } else {
          socketRef.current.emit("join ok", data)
          router.push(`/game/${roomCode}`)
        }
      } else {
        setCodeError("El codigo es incorrecto")
      }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "create" ? styles.active : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Crear Juego
        </button>
        <button
          className={`${styles.tab} ${activeTab === "join" ? styles.active : ""}`}
          onClick={() => setActiveTab("join")}
        >
          Unirte a Juego
        </button>
      </div>

      <div className={styles.formContainer}>
        {activeTab === "create" ? (
          <form onSubmit={handleCreateGame} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="create-name" className={styles.label}>
                Tu Nombre
              </label>
              <input
                id="create-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className={styles.input}
                placeholder="Ingresa tu nombre..."
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={btnBlock}>
              Crear Juego
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinGame} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="join-name" className={styles.label}>
                Tu Nombre
              </label>
              <input
                id="join-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className={styles.input}
                placeholder="Ingresa tu nombre..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="room-code" className={styles.label}>
                Codigo
              </label>
              <input
                id="room-code"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className={styles.input}
                placeholder="Ingrese el codigo de invitación"
                maxLength={6}
                required
              />
              {codeError && <p className={styles.textError}>{codeError}</p>}
            </div>

            <button type="submit" className={styles.button}>
              Unirse al juego
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default GameEntry