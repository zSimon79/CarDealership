const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const carImage = new Image();
carImage.src = '../kepek/car.png';

let car = { x: canvas.width / 2, y: canvas.height / 2, angle: 0 };
carImage.width = 125;
carImage.height = 75;
const scaledWidth = carImage.width * 0.5;
const scaledHeight = carImage.height * 0.5;
function drawCar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate((car.angle * Math.PI) / 180);

  ctx.drawImage(carImage, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

  ctx.restore();
}

function moveCar(action, steps) {
  switch (action) {
    case 'forward':
      car.x += steps * Math.cos((car.angle * Math.PI) / 180);
      car.y += steps * Math.sin((car.angle * Math.PI) / 180);
      break;
    case 'backward':
      car.x -= steps * Math.cos((car.angle * Math.PI) / 180);
      car.y -= steps * Math.sin((car.angle * Math.PI) / 180);
      break;
    case 'right':
      car.angle += steps;
      break;
    case 'left':
      car.angle -= steps;
      break;
    default:
      console.log('Car stops');
      break;
  }
  car.x = (car.x + canvas.width) % canvas.width;
  car.y = (car.y + canvas.height) % canvas.height;
  drawCar();
}

let timer;
function startMovement() {
  const interval = document.getElementById('interval').value;
  const action = document.querySelector('input[name="action"]:checked').value;
  const step = document.getElementById('step').value;
  clearInterval(timer);
  if (action !== 'stop') {
    timer = setInterval(() => moveCar(action, parseInt(step, 10)), interval);
  } else {
    moveCar(action, parseInt(step, 10));
  }
}

function resetPosition() {
  clearInterval(timer);
  car = { x: canvas.width / 2, y: canvas.height / 2, angle: 0 };
  drawCar();
}
document.getElementById('controlForm').addEventListener('submit', (event) => {
  event.preventDefault();
  startMovement();
});
document.getElementById('resetButton').addEventListener('click', resetPosition);

carImage.onload = () => {
  drawCar();
};
