import { useState, useEffect, useRef } from 'react'
import styles from "./gameInterface.module.css"

const GameInterface = ({ players, sigotosSelected, situationSelected }) => {

  const [active, setActive] = useState(null)
  const [selectNumber, setSelectNumber] = useState(null)
  const [clockStart, setClockStart] = useState(5)
  const [counter, setCounter] = useState(20)

  const rafRef = useRef()

  useEffect(() => {
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(5 - elapsed, 0); // Contador que no baja de 0

      setClockStart(remaining);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick); // Continuar mientras clockStart > 0
      } else {
        console.log("¡Tiempo inicial terminado!");
        initRound(); // Iniciar la siguiente ronda
      }
    };

    rafRef.current = requestAnimationFrame(tick); // Iniciar animación

    return () => cancelAnimationFrame(rafRef.current)
  }, []);

  const initRound = () => {
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(20 - elapsed, 0);

      setCounter(remaining);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        console.log("¡Ronda finalizada!");
        // Aquí podrías iniciar otra lógica o detener completamente
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const selector = (value) => {
    setActive(value)
    switch (value) {
      case "uno":
        return setSelectNumber(1)
      case "dos":
        return setSelectNumber(2)
      case "tres":
        return setSelectNumber(3)
      case "cuatro":
        return setSelectNumber(4)
      case "cinco":
        return setSelectNumber(5)
      case "seis":
        return setSelectNumber(6)
      default:
        return setSelectNumber(1)
    }
  }

  return (
    <main className={styles.main}>
      {clockStart ? <div className={styles.modal}>
        <h2>Comenzamos en:</h2>
        <span className={styles.clock}>{clockStart}</span>
      </div> : null}

      <div className={styles.situationContainer}>
        <div className={styles.titleContainer}>
          <h3>Situacion: {situationSelected.situation}</h3>
          <div className={styles.containerImg}>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" alt="" />
          </div>
        </div>

        <div className={styles.timeContainer}>
          <span><b>Tiempo: </b></span>
          <span>{counter} seg</span>
        </div>
      </div>

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
                  <td onClick={() => selector("uno")} className={`${styles.cellNumber} ${active === "uno" ? styles.active : ""}`}>1</td>
                  <td onClick={() => selector("dos")} className={`${styles.cellNumber} ${active === "dos" ? styles.active : ""}`}>2</td>
                  <td onClick={() => selector("tres")} className={`${styles.cellNumber} ${active === "tres" ? styles.active : ""}`}>3</td>
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
                  <td onClick={() => selector("cuatro")} className={`${styles.cellNumber} ${active === "cuatro" ? styles.active : ""}`}>4</td>
                  <td onClick={() => selector("cinco")} className={`${styles.cellNumber} ${active === "cinco" ? styles.active : ""}`}>5</td>
                  <td onClick={() => selector("seis")} className={`${styles.cellNumber} ${active === "seis" ? styles.active : ""}`}>6</td>
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
          <div className={styles.containerBtns}>
            <button className={styles.button}>Seleccionar</button>
          </div>

        </div>
      </div>
    </main>
  )
}

export default GameInterface