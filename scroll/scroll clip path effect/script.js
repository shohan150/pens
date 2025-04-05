const box1 = document.querySelector(".box1");

const box2 = document.querySelector(".box2");

// Depending on screen size how much the circles will grow?
const modifier = window.innerWidth / 520;

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  box1.style.clipPath = "circle(" + scrollY * modifier + "px at 0 0)";

  box2.style.clipPath = "circle(" + scrollY * modifier + "px at 100% 100%)";
});
