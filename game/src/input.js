// Keyboard + klik. Tombol yang ditahan ada di `held`; yang baru ditekan ada di `pressed`
// (dibersihkan tiap frame oleh loop utama, jadi satu tekanan tidak terhitung dua kali).
export function createInput() {
  const held = new Set();
  const pressed = new Set();
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (!event.repeat) pressed.add(event.code);
    held.add(event.code);
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
  });
  window.addEventListener('blur', () => {
    held.clear();
  });
  return {
    held,
    pressed,
    clearPressed() {
      pressed.clear();
    },
  };
}
