let holders = 0;
let previous = "";

/** Bloque le défilement de la page tant qu'au moins une fenêtre est ouverte ; renvoie la fonction qui libère. */
export function lockScroll(): () => void {
  if (holders === 0) {
    previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  holders += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders = Math.max(0, holders - 1);
    if (holders === 0) document.body.style.overflow = previous;
  };
}
