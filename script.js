// Elementos do DOM
const ship = document.querySelector(".player");
const playArea = document.querySelector("#gameArea");
const scoreDisplay = document.querySelector("#score");
const instructionsText = document.querySelector(".game-instructions");
const startButton = document.querySelector(".start-button");


// Assets do jogo
const aliensImg = [
  "image/bad1.png",
  "image/bad2.png",
  "image/bad3.png",
  "image/bad4.png"
];

// Variáveis do jogo
let alienInterval;
let score = 0;
let gameActive = false;

// Controles de movimento e disparo
function flyShip(event) {
  if (!gameActive) return;
  
  switch(event.key) {
    case "ArrowUp":
      event.preventDefault();
      moveUp();
      break;
    case "ArrowDown":
      event.preventDefault();
      moveDown();
      break;
    case "ArrowRight":
      event.preventDefault();
      moveRight();
      break;
    case "ArrowLeft":
      event.preventDefault();
      moveLeft();
      break;
    case " ":
      event.preventDefault();
      fireLaser();
      break;
  }
}

// Movimento para cima
function moveUp() {
  let topPosition = parseInt(getComputedStyle(ship).top);
  const minTop = 0;
  
  if (topPosition > minTop) {
    ship.style.top = `${topPosition - 30}px`;
    animateShip();
  }
}

// Movimento para baixo
function moveDown() {
  let topPosition = parseInt(getComputedStyle(ship).top);
  const maxTop = playArea.offsetHeight - ship.offsetHeight;
  
  if (topPosition < maxTop) {
    ship.style.top = `${topPosition + 30}px`;
    animateShip();
  }
}

// Movimento para esquerda
function moveLeft() {
  let leftPosition = parseInt(getComputedStyle(ship).left);
  const minLeft = 0;
  
  if (leftPosition > minLeft) {
    ship.style.left = `${leftPosition - 30}px`;
    animateShip();
  }
}

// Movimento para direita
function moveRight() {
  let leftPosition = parseInt(getComputedStyle(ship).left);
  const maxLeft = playArea.offsetWidth - ship.offsetWidth;
  
  if (leftPosition < maxLeft) {
    ship.style.left = `${leftPosition + 30}px`;
    animateShip();
  }
}

// Animação da nave ao mover
function animateShip() {
  ship.style.transform = "scale(1.1)";
  setTimeout(() => {
    ship.style.transform = "scale(1)";
  }, 100);
}

// Disparar laser
function fireLaser() {
  if (!gameActive) return;
  
  const laser = createLaserElement();
  playArea.appendChild(laser);
  moveLaser(laser);
  
  // Efeito sonoro (opcional)
  playSound("laser");
}

function createLaserElement() {
  const xPosition = parseInt(getComputedStyle(ship).left) + ship.offsetWidth / 2;
  const yPosition = parseInt(getComputedStyle(ship).top);
  
  const laser = document.createElement("img");
  laser.src = "image/shoot.png";
  laser.classList.add("laser");
  laser.style.left = `${xPosition}px`;
  laser.style.top = `${yPosition}px`;
  
  return laser;
}

function moveLaser(laser) {
  const laserSpeed = 10;
  const laserInterval = setInterval(() => {
    const xPosition = parseInt(laser.style.left);
    const aliens = document.querySelectorAll(".alien:not(.dead-alien)");

    // Verifica colisão com aliens
    aliens.forEach(alien => {
      if (checkCollision(laser, alien)) {
        handleAlienHit(alien);
        clearInterval(laserInterval);
        laser.remove();
      }
    });

    // Remove laser se sair da tela
    if (xPosition > playArea.offsetWidth) {
      clearInterval(laserInterval);
      laser.remove();
    } else {
      laser.style.left = `${xPosition + laserSpeed}px`;
    }
  }, 16); // ~60fps
}

// Criar inimigos
function createAliens() {
  if (!gameActive) return;
  
  const newAlien = document.createElement("img");
  const alienSprite = aliensImg[Math.floor(Math.random() * aliensImg.length)];
  
  newAlien.src = alienSprite;
  newAlien.classList.add("alien", "alien-transition");
  newAlien.style.left = `${playArea.offsetWidth}px`;
  newAlien.style.top = `${Math.random() * (playArea.offsetHeight - 60)}px`;
  
  playArea.appendChild(newAlien);
  moveAlien(newAlien);
}

function moveAlien(alien) {
  const alienSpeed = 2 + Math.random() * 2; // Velocidade variável
  const moveInterval = setInterval(() => {
    if (!gameActive) {
      clearInterval(moveInterval);
      return;
    }
    
    const xPosition = parseInt(alien.style.left);
    
    // Verifica se alien chegou ao fim da tela
    if (xPosition < -alien.offsetWidth) {
      clearInterval(moveInterval);
      alien.remove();
    } 
    // Verifica se alien foi atingido
    else if (alien.classList.contains("dead-alien")) {
      clearInterval(moveInterval);
      setTimeout(() => alien.remove(), 500);
    } 
    // Verifica colisão com o jogador
    else if (checkCollision(alien, ship)) {
      gameOver();
    } 
    // Move o alien normalmente
    else {
      alien.style.left = `${xPosition - alienSpeed}px`;
    }
  }, 16); // ~60fps
}

// Verificação de colisão genérica
function checkCollision(obj1, obj2) {
  const rect1 = obj1.getBoundingClientRect();
  const rect2 = obj2.getBoundingClientRect();
  
  return !(
    rect1.right < rect2.left || 
    rect1.left > rect2.right || 
    rect1.bottom < rect2.top || 
    rect1.top > rect2.bottom
  );
}

// Quando um alien é atingido
function handleAlienHit(alien) {
  alien.src = "image/smallExplosion.png";
  alien.classList.remove("alien");
  alien.classList.add("dead-alien");
  
  // Atualiza pontuação
  score++;
  scoreDisplay.textContent = score;
  
  // Efeito sonoro (opcional)
  playSound("explosion");
  
  // Efeito visual de explosão
  createExplosion(alien);
}

function createExplosion(element) {
  const explosion = document.createElement("div");
  explosion.classList.add("explosion");
  explosion.style.left = element.style.left;
  explosion.style.top = element.style.top;
  playArea.appendChild(explosion);
  
  setTimeout(() => {
    explosion.remove();
  }, 500);
}

// Efeitos sonoros (opcional)
function playSound(type) {
  // Implementar se desejar adicionar sons
}


// Iniciar jogo
startButton.addEventListener("click", playGame);

function playGame() {
  // Resetar jogo
  resetGame();
  
  // Configurar interface
  startButton.style.display = "none";
  instructionsText.style.display = "none";
  gameActive = true;
  
  // Configurar controles
  window.addEventListener("keydown", flyShip);
  
  // Iniciar spawn de aliens
  alienInterval = setInterval(createAliens, 2000);
}

// Resetar jogo
function resetGame() {
  score = 0;
  scoreDisplay.textContent = score;
  ship.style.top = "250px";
  ship.style.left = "20px";
  
  // Remover todos os aliens e lasers
  document.querySelectorAll(".alien, .laser, .explosion").forEach(el => el.remove());
}

// Game over
function gameOver() {
  gameActive = false;
  
  // Remover listeners e intervalos
  window.removeEventListener("keydown", flyShip);
  clearInterval(alienInterval);
  
  // Remover todos os aliens e lasers
  document.querySelectorAll(".alien, .laser" ).forEach(el => el.remove());
  
  // Mostrar tela de game over
  setTimeout(() => {
    alert(`Game Over!\nYour Score: ${score}`);
    startButton.style.display = "block";
    instructionsText.style.display = "block";
  }, 500);
}