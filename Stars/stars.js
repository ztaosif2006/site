const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const starCount = 2000;
const stars = [];
const fov = 200; // field of view
let centerX = width / 2;
let centerY = height / 2;
let mouseX = 10;
let mouseY = 10;
let scrollDepth = 1;

//_z.taosif2006

// Color palette for stars
const starColors = [
  { r: 255, g: 255, b: 255 }, // White
  { r: 255, g: 200, b: 100 }, // Warm yellow
  { r: 100, g: 150, b: 255 }, // Blue
  { r: 255, g: 100, b: 100 }, // Red
  { r: 100, g: 255, b: 150 }, // Green
  { r: 255, g: 150, b: 255 }, // Magenta
  { r: 150, g: 255, b: 255 }  // Cyan
];

// Generate stars with colors
for (let i = 0; i < starCount; i++) {
  const colorIndex = Math.floor(Math.random() * starColors.length);
  stars.push({
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    z: Math.random() * 2000,
    color: starColors[colorIndex]
  });
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < starCount; i++) {
    let star = stars[i];
    star.z -= 2 + scrollDepth * 0.05;

    if (star.z <= 1) {
      star.z = 2000;
    }

    const scale = fov / (fov + star.z);
    const x2d = (star.x + mouseX * 5) * scale + centerX;
    const y2d = (star.y + mouseY * 5) * scale + centerY;

    const brightness = 1 - star.z / 2000;
    ctx.beginPath();
    ctx.arc(x2d, y2d, scale * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${brightness})`;
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

// Mouse perspective tilt
document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX - centerX) / centerX;
  mouseY = (e.clientY - centerY) / centerY;
});

// Scroll depth control
document.addEventListener("wheel", (e) => {
  scrollDepth += e.deltaY * 0.05;
  if (scrollDepth < -200) scrollDepth = -50;
  if (scrollDepth > 500) scrollDepth = 500;
});

// Resize
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
});

animate();