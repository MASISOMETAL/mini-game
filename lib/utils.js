export const roundSelection = (sigotos, setSigotos, setSigotosSelected, situation, setSituation, setSituationSelected) => {
  // Seleccionamos 6 sigotos aleatorios
  const selectedSigotos = [];
  const remainingSigotos = [...sigotos];
  const remainingSituation = [...situation];

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * remainingSigotos.length);
    selectedSigotos.push(remainingSigotos[randomIndex]);
    remainingSigotos.splice(randomIndex, 1); // Eliminamos el sigoto seleccionado
  }

  const randomSituation = Math.floor(Math.random() * remainingSituation.length)
  const selectedSituation = remainingSituation[randomSituation]
  remainingSituation.splice(randomSituation, 1);

  // Actualizamos los estados
  setSigotos(remainingSigotos);
  setSigotosSelected(selectedSigotos);
  setSituation(remainingSituation)
  setSituationSelected(selectedSituation)
}