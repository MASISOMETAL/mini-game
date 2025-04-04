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
  const [codeError, setCodeError] = useState(false)
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
      id: uuidv4().toString(),
      codeId: newRoomCode,
      hostName: playerName,
      isHost: 1,
      isStart: 0
    }
    
    dispatch(setCode(data))

    socketRef.current.emit("create", data)
    router.push(`/game/${newRoomCode}`)
  }

  const handleJoinGame = (e) => {
    e.preventDefault()
    if (!playerName.trim() || !roomCode.trim()) return

    const data = {
      id: uuidv4().toString(),
      codeId: roomCode,
      hostName: playerName,
      isHost: 0,
      isStart: 0
    }

    dispatch(setCode(data))

    socketRef.current.emit("join", roomCode)

    socketRef.current.on("response join", (response) => {
      if (response.length) {
        socketRef.current.emit("join ok", data)
        router.push(`/game/${roomCode}`)
      } else {
        setCodeError(true)       
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
          Create Game
        </button>
        <button
          className={`${styles.tab} ${activeTab === "join" ? styles.active : ""}`}
          onClick={() => setActiveTab("join")}
        >
          Join Game
        </button>
      </div>

      <div className={styles.formContainer}>
        {activeTab === "create" ? (
          <form onSubmit={handleCreateGame} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="create-name" className={styles.label}>
                Your Name
              </label>
              <input
                id="create-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className={styles.input}
                placeholder="Enter your name"
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={btnBlock}>
              Create Room
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinGame} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="join-name" className={styles.label}>
                Your Name
              </label>
              <input
                id="join-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className={styles.input}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="room-code" className={styles.label}>
                Room Code
              </label>
              <input
                id="room-code"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className={styles.input}
                placeholder="Enter room code"
                maxLength={6}
                required
              />
              {codeError && <p className={styles.textError}>El codigo es incorrecto</p>}
            </div>

            <button type="submit" className={styles.button}>
              Join Room
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default GameEntry