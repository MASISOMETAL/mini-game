import GameEntry from '../components/gameEntry'
import styles from './page.module.css'
import ReduxProvider from "../components/ReduxProvider"

const page = () => {
  return (
    <ReduxProvider>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Game Room</h1>
          <p className={styles.description}>Create or join a game room to start playing</p>
        </header>

        <main className={styles.main}>
          <GameEntry />
        </main>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Game Room</p>
        </footer>
      </div>
    </ReduxProvider>
  )
}

export default page