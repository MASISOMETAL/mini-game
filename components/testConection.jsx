'use client'

import {useEffect, useRef, useState} from 'react'
import { io } from "socket.io-client";

const TestConection = () => {

const [text, setText] = useState("")

  const socketRef = useRef(null)

useEffect(()=> {
  socketRef.current = io("http://localhost:3000")

  socketRef.current.on("msg", (mensaje)=> setText(mensaje))

  return () => socketRef.current.disconnect()
},[])

const handleBtn = () => {
  socketRef.current.emit("getMsg", "")
}

  return (
    <div>
      El texto es: {text}
      <button onClick={handleBtn}>Test</button>
      </div>
  )
}

export default TestConection