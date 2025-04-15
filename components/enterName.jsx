import { useState } from 'react'
import styles from "./enterName.module.css"

const EnterName = ({enterUrlCode}) => {

  const [playerName, setPlayerName] = useState("")

  const handleCreateGame = (e) => {
    e.preventDefault()
    enterUrlCode(playerName)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bienvenido a "El Juego"</h1>
        <p className={styles.description}>Ingrese su nombre!</p>
      </header>

      <main className={styles.main}>
        <div className={styles.containerCenter}>
          <div className={styles.formContainer}>
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
              <button type="submit" className={styles.button}>
                Entrar
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EnterName