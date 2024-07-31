import kaplay from "kaplay";

export const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  buttons: {
    keyboard: ["w", "a", "s", "d", "space", "enter", "e"],
  },
});
