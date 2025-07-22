// Variables globales
let currentGame = null;
let gameRunning = false;
let score = 0;
let level = 1;
let gameTime = 0;
let gameTimer = null;

// Datos del leaderboard
let leaderboard = JSON.parse(localStorage.getItem('gameZoneLeaderboard')) || [];

// Estadísticas de la plataforma
let platformStats = {
    totalGames: 8,
    playersOnline: Math.floor(Math.random() * 2000) + 1000,
    gamesPlayed: JSON.parse(localStorage.getItem('gamesPlayed')) || 0
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('GameZone cargando...');
    initializeApp();
    setupEventListeners();
    updateStats();
    updateLeaderboard();
    console.log('GameZone cargado correctamente');
});

// Configuración inicial
function initializeApp() {
    // Animación de carga inicial
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);
    
    // Actualizar estadísticas cada 30 segundos
    setInterval(updateStats, 30000);
}

// Event Listeners
function setupEventListeners() {
    // Navegación móvil
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Cerrar menú móvil si está abierto
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Botones de juego
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.dataset.game;
            startGame(gameType);
        });
    });
    
    // Controles del juego
    document.getElementById('close-btn').addEventListener('click', closeGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    // Tabs del leaderboard
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLeaderboard(btn.dataset.game);
        });
    });
    
    // Teclas globales
    document.addEventListener('keydown', handleGlobalKeys);
}

// Manejo de teclas globales
function handleGlobalKeys(e) {
    if (e.key === 'Escape' && gameRunning) {
        closeGame();
    }
}

// Actualizar estadísticas
function updateStats() {
    const stats = document.querySelectorAll('.hero-stats .stat h3');
    stats[0].textContent = platformStats.totalGames;
    stats[1].textContent = platformStats.playersOnline.toLocaleString();
    stats[2].textContent = platformStats.gamesPlayed.toLocaleString();
    
    // Simular jugadores online variando
    platformStats.playersOnline += Math.floor(Math.random() * 20) - 10;
    if (platformStats.playersOnline < 500) platformStats.playersOnline = 500;
    if (platformStats.playersOnline > 3000) platformStats.playersOnline = 3000;
}

// Iniciar juego
function startGame(gameType) {
    console.log(`Iniciando juego: ${gameType}`);
    currentGame = gameType;
    gameRunning = true;
    score = 0;
    level = 1;
    gameTime = 0;
    
    // Mostrar contenedor del juego
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('hidden');
    gameContainer.setAttribute('data-game', gameType); // Añadir atributo para estilos específicos
    document.body.style.overflow = 'hidden';
    
    // Actualizar información del juego
    updateGameInfo();
    
    // Cargar el juego específico
    loadGame(gameType);
    
    // Iniciar timer
    startGameTimer();
    
    // Incrementar contador de partidas
    platformStats.gamesPlayed++;
    localStorage.setItem('gamesPlayed', JSON.stringify(platformStats.gamesPlayed));
    
    console.log(`Juego ${gameType} iniciado correctamente`);
}

// Cargar juego específico
function loadGame(gameType) {
    const gameArea = document.getElementById('game-area');
    const gameTitle = document.getElementById('current-game-title');
    const instructions = document.getElementById('instructions');
    
    // Limpiar área de juego
    gameArea.innerHTML = '';
    
    switch(gameType) {
        case 'tictactoe':
            gameTitle.textContent = 'Tic Tac Toe';
            instructions.textContent = 'Haz clic en las casillas para marcar X u O';
            loadTicTacToe();
            break;
        case 'snake':
            gameTitle.textContent = 'Snake';
            instructions.textContent = 'Usa las flechas para mover la serpiente';
            loadSnake();
            break;
        case 'memory':
            gameTitle.textContent = 'Memory Game';
            instructions.textContent = 'Haz clic en las cartas para encontrar las parejas';
            loadMemoryGame();
            break;
        case 'puzzle':
            gameTitle.textContent = 'Puzzle Deslizante';
            instructions.textContent = 'Haz clic en las piezas para moverlas al espacio vacío';
            loadSlidingPuzzle();
            break;
        case 'rps':
            gameTitle.textContent = 'Piedra, Papel, Tijera';
            instructions.textContent = 'Elige tu jugada y desafía a la computadora';
            loadRockPaperScissors();
            break;
        case 'uno':
            gameTitle.textContent = 'UNO';
            instructions.textContent = 'Haz coincidir colores o números. Usa cartas especiales estratégicamente';
            loadUnoGame();
            break;
        case 'flappy':
            gameTitle.textContent = 'Flappy Bird';
            instructions.textContent = 'Presiona ESPACIO para volar y evita los obstáculos';
            loadFlappyBird();
            break;
        case 'guess':
            gameTitle.textContent = 'Adivina el Número';
            instructions.textContent = 'Introduce un número para adivinar el número secreto';
            loadNumberGuessing();
            break;
        default:
            gameTitle.textContent = 'Juego no encontrado';
            instructions.textContent = 'Este juego aún no está disponible';
    }
}

// Tic Tac Toe
function loadTicTacToe() {
    const gameArea = document.getElementById('game-area');
    let currentPlayer = 'X';
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    
    const boardElement = document.createElement('div');
    boardElement.className = 'tic-tac-toe-board';
    boardElement.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 100px);
        grid-template-rows: repeat(3, 100px);
        gap: 5px;
        justify-content: center;
    `;
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'tic-tac-toe-cell';
        cell.style.cssText = `
            background: rgba(22, 33, 62, 0.8);
            border: 2px solid var(--primary-color);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        cell.addEventListener('click', () => {
            if (board[i] === '' && gameActive) {
                board[i] = currentPlayer;
                cell.textContent = currentPlayer;
                cell.style.color = currentPlayer === 'X' ? 'var(--primary-color)' : 'var(--secondary-color)';
                
                if (checkWinner()) {
                    showNotification(`¡Jugador ${currentPlayer} gana!`, 'success');
                    score += 100;
                    updateGameInfo();
                    gameActive = false;
                    addToLeaderboard('tictactoe', score);
                } else if (board.every(cell => cell !== '')) {
                    showNotification('¡Empate!', 'info');
                    score += 50;
                    updateGameInfo();
                    gameActive = false;
                } else {
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                }
            }
        });
        
        boardElement.appendChild(cell);
    }
    
    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
            [0, 4, 8], [2, 4, 6] // Diagonales
        ];
        
        return winPatterns.some(pattern => {
            return pattern.every(index => board[index] === currentPlayer);
        });
    }
    
    gameArea.appendChild(boardElement);
}

// Snake Game
function loadSnake() {
    console.log('Cargando juego Snake...');
    const gameArea = document.getElementById('game-area');
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.border = '2px solid var(--primary-color)';
    canvas.style.borderRadius = '10px';
    canvas.style.background = 'rgba(10, 10, 15, 0.9)';
    canvas.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.3)';
    canvas.style.maxWidth = '90vw';
    canvas.style.maxHeight = '60vh';
    
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{x: 200, y: 200}];
    let direction = {x: 0, y: 0};
    let food = {x: 0, y: 0};
    let gameSpeed = 150;
    let animationFrame = 0;
    let lastDirection = {x: 0, y: 0};
    let foodPulse = 0;
    let snakeGlow = 0;
    let particles = [];
    let gameLoop = null;
    
    generateFood();
    console.log('Snake game inicializado');
    
    function generateFood() {
        do {
            food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
            food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
        console.log('Nueva comida generada en:', food);
    }
    
    function draw() {
        // Limpiar canvas
        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grid sutil
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Dibujar serpiente
        snake.forEach((segment, index) => {
            const isHead = index === 0;
            const size = gridSize - 4;
            const x = segment.x + 2;
            const y = segment.y + 2;
            
            if (isHead) {
                // Cabeza con brillo
                ctx.fillStyle = '#00ff41';
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = 15;
                ctx.fillRect(x, y, size, size);
                
                // Ojos
                ctx.fillStyle = '#0a0a0f';
                ctx.shadowBlur = 0;
                ctx.fillRect(x + 6, y + 6, 4, 4);
                ctx.fillRect(x + size - 10, y + 6, 4, 4);
            } else {
                // Cuerpo
                const alpha = (snake.length - index) / snake.length;
                ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`;
                ctx.shadowColor = '#00f5ff';
                ctx.shadowBlur = 8;
                ctx.fillRect(x, y, size, size);
            }
        });
        
        // Dibujar comida
        ctx.fillStyle = '#ff00f5';
        ctx.shadowColor = '#ff00f5';
        ctx.shadowBlur = 20;
        const foodSize = gridSize - 4;
        ctx.fillRect(food.x + 2, food.y + 2, foodSize, foodSize);
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    function update() {
        if (!gameRunning) return;
        
        // Si no hay dirección, no mover
        if (direction.x === 0 && direction.y === 0) {
            draw();
            return;
        }
        
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
        
        // Verificar colisiones con paredes
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            gameOver();
            return;
        }
        
        // Verificar colisiones con el cuerpo
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }
        
        snake.unshift(head);
        
        // Verificar si comió la comida
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            level = Math.floor(score / 50) + 1;
            updateGameInfo();
            generateFood();
            
            // Aumentar velocidad gradualmente
            const newSpeed = Math.max(80, 150 - (level * 8));
            if (newSpeed !== gameSpeed) {
                gameSpeed = newSpeed;
                clearInterval(gameLoop);
                gameLoop = setInterval(update, gameSpeed);
            }
        } else {
            snake.pop();
        }
        
        lastDirection = {...direction};
        draw();
    }
    
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        
        // Efecto de game over
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 102, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = 'bold 14px Orbitron';
        ctx.fillText(`Puntuación: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
        ctx.restore();
        
        showNotification(`¡Game Over! Puntuación final: ${score}`, 'error');
        addToLeaderboard('snake', score);
    }
    
    // Crear handler de teclas único para este juego
    function handleSnakeKeys(e) {
        if (!gameRunning) return;
        
        let newDirection = null;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (lastDirection.y === 0) newDirection = {x: 0, y: -gridSize};
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (lastDirection.y === 0) newDirection = {x: 0, y: gridSize};
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (lastDirection.x === 0) newDirection = {x: -gridSize, y: 0};
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (lastDirection.x === 0) newDirection = {x: gridSize, y: 0};
                break;
        }
        
        if (newDirection) {
            direction = newDirection;
            e.preventDefault();
            console.log('Dirección cambiada:', direction);
        }
    }
    
    // Agregar event listener
    document.addEventListener('keydown', handleSnakeKeys);
    
    // Controles táctiles simplificados
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!gameRunning) return;
        
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const touchEndX = touch.clientX - rect.left;
        const touchEndY = touch.clientY - rect.top;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Movimiento horizontal
            if (Math.abs(deltaX) > minSwipeDistance && lastDirection.x === 0) {
                direction = deltaX > 0 ? {x: gridSize, y: 0} : {x: -gridSize, y: 0};
            }
        } else {
            // Movimiento vertical
            if (Math.abs(deltaY) > minSwipeDistance && lastDirection.y === 0) {
                direction = deltaY > 0 ? {x: 0, y: gridSize} : {x: 0, y: -gridSize};
            }
        }
    });
    
    gameArea.appendChild(canvas);
    
    // Dibujo inicial
    draw();
    
    // Mostrar instrucciones
    showNotification('¡Usa las flechas o WASD para moverte! También puedes deslizar en móvil', 'info');
    
    // Iniciar el juego
    gameLoop = setInterval(update, gameSpeed);
    console.log('Game loop iniciado con velocidad:', gameSpeed);
    
    // Limpiar interval cuando se cierre el juego
    gameArea.dataset.cleanup = () => {
        console.log('Limpiando Snake game...');
        clearInterval(gameLoop);
        document.removeEventListener('keydown', handleSnakeKeys);
    };
}


// Memory Game
function loadMemoryGame() {
    const gameArea = document.getElementById('game-area');
    const icons = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨'];
    const cards = [...icons, ...icons]; // Duplicar para parejas
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    
    // Mezclar cartas
    cards.sort(() => Math.random() - 0.5);
    
    const gameBoard = document.createElement('div');
    gameBoard.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 80px);
        grid-template-rows: repeat(4, 80px);
        gap: 10px;
        justify-content: center;
    `;
    
    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.icon = icon;
        card.dataset.index = index;
        card.style.cssText = `
            background: var(--gradient-primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            transform-style: preserve-3d;
        `;
        
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    });
    
    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
            card.textContent = card.dataset.icon;
            card.classList.add('flipped');
            flippedCards.push(card);
            
            if (flippedCards.length === 2) {
                moves++;
                checkMatch();
            }
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.icon === card2.dataset.icon) {
            matchedPairs++;
            score += 20;
            updateGameInfo();
            flippedCards = [];
            
            if (matchedPairs === icons.length) {
                setTimeout(() => {
                    showNotification(`¡Ganaste! Movimientos: ${moves}`, 'success');
                    addToLeaderboard('memory', score);
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.textContent = '';
                card2.textContent = '';
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }
    
    gameArea.appendChild(gameBoard);
}

// Rock Paper Scissors
function loadRockPaperScissors() {
    const gameArea = document.getElementById('game-area');
    let playerWins = 0;
    let computerWins = 0;
    
    const gameBoard = document.createElement('div');
    gameBoard.style.cssText = `
        text-align: center;
        color: var(--text-primary);
    `;
    
    gameBoard.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Jugador: ${playerWins} - Computadora: ${computerWins}</h3>
            <div id="game-result" style="font-size: 1.5rem; margin: 1rem 0; min-height: 2rem;"></div>
        </div>
        <div style="display: flex; justify-content: center; gap: 2rem;">
            <button class="rps-btn" data-choice="rock">
                <i class="fas fa-hand-rock" style="font-size: 3rem;"></i>
                <br>Piedra
            </button>
            <button class="rps-btn" data-choice="paper">
                <i class="fas fa-hand-paper" style="font-size: 3rem;"></i>
                <br>Papel
            </button>
            <button class="rps-btn" data-choice="scissors">
                <i class="fas fa-hand-scissors" style="font-size: 3rem;"></i>
                <br>Tijera
            </button>
        </div>
    `;
    
    const buttons = gameBoard.querySelectorAll('.rps-btn');
    buttons.forEach(btn => {
        btn.style.cssText = `
            background: var(--gradient-primary);
            border: none;
            border-radius: 15px;
            padding: 1rem;
            color: var(--background-dark);
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 100px;
        `;
        
        btn.addEventListener('click', () => playRound(btn.dataset.choice));
    });
    
    function playRound(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        let result = '';
        if (playerChoice === computerChoice) {
            result = 'Empate';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = '¡Ganaste!';
            playerWins++;
            score += 10;
        } else {
            result = 'Perdiste';
            computerWins++;
        }
        
        document.getElementById('game-result').innerHTML = `
            Tú: ${getIcon(playerChoice)} - Computadora: ${getIcon(computerChoice)}<br>
            ${result}
        `;
        
        updateGameInfo();
        gameBoard.querySelector('h3').textContent = `Jugador: ${playerWins} - Computadora: ${computerWins}`;
        
        if (playerWins === 5 || computerWins === 5) {
            setTimeout(() => {
                showNotification(playerWins === 5 ? '¡Ganaste la serie!' : 'La computadora ganó la serie', 
                               playerWins === 5 ? 'success' : 'info');
                addToLeaderboard('rps', score);
            }, 1000);
        }
    }
    
    function getIcon(choice) {
        const icons = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        return icons[choice];
    }
    
    gameArea.appendChild(gameBoard);
}

// Number Guessing Game
function loadNumberGuessing() {
    const gameArea = document.getElementById('game-area');
    const secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    let maxAttempts = 10;
    
    const gameBoard = document.createElement('div');
    gameBoard.style.cssText = `
        text-align: center;
        color: var(--text-primary);
        max-width: 400px;
    `;
    
    gameBoard.innerHTML = `
        <h3 style="color: var(--primary-color); margin-bottom: 2rem;">
            Adivina el número entre 1 y 100
        </h3>
        <div style="margin-bottom: 2rem;">
            <input type="number" id="guess-input" min="1" max="100" 
                   style="padding: 1rem; font-size: 1.2rem; width: 150px; text-align: center; 
                          border: 2px solid var(--primary-color); border-radius: 10px; 
                          background: rgba(22, 33, 62, 0.8); color: var(--text-primary);">
            <button id="guess-btn" style="padding: 1rem 2rem; margin-left: 1rem; 
                                          background: var(--gradient-primary); border: none; 
                                          border-radius: 10px; color: var(--background-dark); 
                                          font-weight: bold; cursor: pointer;">
                Adivinar
            </button>
        </div>
        <div id="guess-feedback" style="font-size: 1.2rem; margin-bottom: 1rem; min-height: 2rem;"></div>
        <div id="attempts-left" style="color: var(--text-secondary);">
            Intentos restantes: ${maxAttempts}
        </div>
    `;
    
    const input = gameBoard.querySelector('#guess-input');
    const button = gameBoard.querySelector('#guess-btn');
    const feedback = gameBoard.querySelector('#guess-feedback');
    const attemptsDisplay = gameBoard.querySelector('#attempts-left');
    
    function makeGuess() {
        const guess = parseInt(input.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            feedback.textContent = 'Ingresa un número válido entre 1 y 100';
            feedback.style.color = 'var(--error-color)';
            return;
        }
        
        attempts++;
        
        if (guess === secretNumber) {
            feedback.textContent = '¡Correcto! ¡Adivinaste el número!';
            feedback.style.color = 'var(--success-color)';
            score += (maxAttempts - attempts + 1) * 10;
            updateGameInfo();
            addToLeaderboard('guess', score);
            button.disabled = true;
            input.disabled = true;
        } else if (attempts >= maxAttempts) {
            feedback.textContent = `Se acabaron los intentos. El número era ${secretNumber}`;
            feedback.style.color = 'var(--error-color)';
            button.disabled = true;
            input.disabled = true;
            addToLeaderboard('guess', score);
        } else {
            const hint = guess < secretNumber ? 'más alto' : 'más bajo';
            feedback.textContent = `El número es ${hint}`;
            feedback.style.color = 'var(--warning-color)';
            attemptsDisplay.textContent = `Intentos restantes: ${maxAttempts - attempts}`;
        }
        
        input.value = '';
        input.focus();
    }
    
    button.addEventListener('click', makeGuess);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') makeGuess();
    });
    
    gameArea.appendChild(gameBoard);
    input.focus();
}

// UNO Card Game
function loadUnoGame() {
    const gameArea = document.getElementById('game-area');
    
    // Definir las cartas UNO
    const colors = ['red', 'yellow', 'green', 'blue'];
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const specialCards = ['skip', 'reverse', 'draw2'];
    const wildCards = ['wild', 'wild4'];
    
    let deck = [];
    let playerHand = [];
    let computerHand = [];
    let discardPile = [];
    let currentPlayer = 'player'; // 'player' o 'computer'
    let direction = 1; // 1 = normal, -1 = reverso
    let gameActive = true;
    
    // Crear la baraja
    function createDeck() {
        deck = [];
        
        // Cartas numéricas (0: 1 carta por color, 1-9: 2 cartas por color)
        colors.forEach(color => {
            numbers.forEach(number => {
                deck.push({ type: 'number', color: color, value: number });
                if (number > 0) {
                    deck.push({ type: 'number', color: color, value: number });
                }
            });
            
            // Cartas especiales (2 de cada tipo por color)
            specialCards.forEach(special => {
                deck.push({ type: 'special', color: color, value: special });
                deck.push({ type: 'special', color: color, value: special });
            });
        });
        
        // Cartas wild (4 de cada tipo)
        for (let i = 0; i < 4; i++) {
            deck.push({ type: 'wild', color: 'black', value: 'wild' });
            deck.push({ type: 'wild', color: 'black', value: 'wild4' });
        }
        
        // Mezclar baraja
        shuffleDeck();
    }
    
    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    function drawCard() {
        if (deck.length === 0) {
            // Rehacer baraja con cartas de descarte
            const topCard = discardPile.pop();
            deck = [...discardPile];
            discardPile = [topCard];
            shuffleDeck();
        }
        return deck.pop();
    }
    
    function dealInitialCards() {
        // Repartir 7 cartas a cada jugador
        for (let i = 0; i < 7; i++) {
            playerHand.push(drawCard());
            computerHand.push(drawCard());
        }
        
        // Carta inicial del montón de descarte
        let firstCard;
        do {
            firstCard = drawCard();
        } while (firstCard.type === 'wild'); // No empezar con wild
        
        discardPile.push(firstCard);
    }
    
    function getCardColor(card) {
        const colorMap = {
            'red': '#ff4444',
            'yellow': '#ffdd44',
            'green': '#44ff44',
            'blue': '#4488ff',
            'black': '#333333'
        };
        return colorMap[card.color] || '#666666';
    }
    
    function getCardText(card) {
        if (card.type === 'number') return card.value;
        if (card.value === 'skip') return '⊘';
        if (card.value === 'reverse') return '⇄';
        if (card.value === 'draw2') return '+2';
        if (card.value === 'wild') return 'W';
        if (card.value === 'wild4') return '+4';
        return '?';
    }
    
    function createCardElement(card, isClickable = false, isHidden = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'uno-card';
        
        if (isHidden) {
            cardEl.style.cssText = `
                width: 60px;
                height: 90px;
                background: linear-gradient(135deg, #2c3e50, #4a69bd);
                border: 2px solid var(--primary-color);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 2px;
                color: var(--primary-color);
                font-weight: bold;
                cursor: default;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;
            cardEl.textContent = 'UNO';
        } else {
            cardEl.style.cssText = `
                width: 60px;
                height: 90px;
                background: ${getCardColor(card)};
                border: 2px solid #fff;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 2px;
                color: ${card.color === 'yellow' ? '#000' : '#fff'};
                font-weight: bold;
                font-size: 1.2rem;
                cursor: ${isClickable ? 'pointer' : 'default'};
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;
            
            if (isClickable) {
                cardEl.style.transform = 'translateY(-5px)';
                cardEl.addEventListener('mouseenter', () => {
                    cardEl.style.transform = 'translateY(-10px) scale(1.05)';
                    cardEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
                });
                cardEl.addEventListener('mouseleave', () => {
                    cardEl.style.transform = 'translateY(-5px) scale(1)';
                    cardEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                });
            }
            
            cardEl.textContent = getCardText(card);
        }
        
        return cardEl;
    }
    
    function updateUI() {
        // Limpiar contenedores
        document.getElementById('player-hand').innerHTML = '';
        document.getElementById('computer-hand').innerHTML = '';
        document.getElementById('discard-pile').innerHTML = '';
        
        // Mano del jugador
        playerHand.forEach((card, index) => {
            const cardEl = createCardElement(card, true);
            cardEl.addEventListener('click', () => playCard(index));
            document.getElementById('player-hand').appendChild(cardEl);
        });
        
        // Mano de la computadora (oculta)
        computerHand.forEach(() => {
            const cardEl = createCardElement(null, false, true);
            document.getElementById('computer-hand').appendChild(cardEl);
        });
        
        // Carta superior del montón de descarte
        if (discardPile.length > 0) {
            const topCard = discardPile[discardPile.length - 1];
            const cardEl = createCardElement(topCard);
            document.getElementById('discard-pile').appendChild(cardEl);
        }
        
        // Actualizar información
        document.getElementById('player-count').textContent = `Tus cartas: ${playerHand.length}`;
        document.getElementById('computer-count').textContent = `IA: ${computerHand.length} cartas`;
        document.getElementById('current-player').textContent = 
            currentPlayer === 'player' ? 'Tu turno' : 'Turno de la IA';
    }
    
    function canPlayCard(card) {
        const topCard = discardPile[discardPile.length - 1];
        
        if (card.type === 'wild') return true;
        if (card.color === topCard.color) return true;
        if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;
        if (card.type === 'special' && card.value === topCard.value) return true;
        
        return false;
    }
    
    function playCard(cardIndex) {
        if (currentPlayer !== 'player' || !gameActive) return;
        
        const card = playerHand[cardIndex];
        if (!canPlayCard(card)) {
            showNotification('No puedes jugar esa carta', 'error');
            return;
        }
        
        // Quitar carta de la mano y ponerla en descarte
        playerHand.splice(cardIndex, 1);
        discardPile.push(card);
        
        // Manejar efectos de cartas especiales
        handleCardEffect(card);
        
        // Verificar victoria
        if (playerHand.length === 0) {
            gameWon('player');
            return;
        }
        
        updateUI();
        
        // Cambiar turno si no se saltó
        if (currentPlayer === 'player') {
            currentPlayer = 'computer';
            setTimeout(computerTurn, 1000);
        }
    }
    
    function handleCardEffect(card) {
        if (card.value === 'skip') {
            // El siguiente jugador pierde turno
            currentPlayer = currentPlayer === 'player' ? 'player' : 'computer';
        } else if (card.value === 'reverse') {
            direction *= -1;
            // En 2 jugadores, reverse = skip
            currentPlayer = currentPlayer === 'player' ? 'player' : 'computer';
        } else if (card.value === 'draw2') {
            const targetHand = currentPlayer === 'player' ? computerHand : playerHand;
            targetHand.push(drawCard());
            targetHand.push(drawCard());
            // El siguiente jugador pierde turno
            currentPlayer = currentPlayer === 'player' ? 'player' : 'computer';
        } else if (card.value === 'wild4') {
            const targetHand = currentPlayer === 'player' ? computerHand : playerHand;
            for (let i = 0; i < 4; i++) {
                targetHand.push(drawCard());
            }
            // El siguiente jugador pierde turno
            currentPlayer = currentPlayer === 'player' ? 'player' : 'computer';
            
            // Elegir color para wild
            if (currentPlayer === 'player') {
                chooseWildColor(card);
            }
        } else if (card.value === 'wild') {
            if (currentPlayer === 'player') {
                chooseWildColor(card);
            }
        }
    }
    
    function chooseWildColor(card) {
        const colors = ['red', 'yellow', 'green', 'blue'];
        const colorButtons = colors.map(color => {
            const btn = document.createElement('button');
            btn.textContent = color.toUpperCase();
            btn.style.cssText = `
                background: ${getCardColor({color: color})};
                color: ${color === 'yellow' ? '#000' : '#fff'};
                border: none;
                padding: 0.5rem 1rem;
                margin: 0.2rem;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            `;
            btn.addEventListener('click', () => {
                card.color = color;
                document.getElementById('color-chooser').style.display = 'none';
                updateUI();
            });
            return btn;
        });
        
        const chooser = document.getElementById('color-chooser');
        chooser.innerHTML = '<p>Elige un color:</p>';
        colorButtons.forEach(btn => chooser.appendChild(btn));
        chooser.style.display = 'block';
    }
    
    function computerTurn() {
        if (currentPlayer !== 'computer' || !gameActive) return;
        
        // IA simple: jugar primera carta válida o robar
        let playedCard = false;
        
        for (let i = 0; i < computerHand.length; i++) {
            const card = computerHand[i];
            if (canPlayCard(card)) {
                computerHand.splice(i, 1);
                discardPile.push(card);
                
                // Si es wild, elegir color más común en la mano
                if (card.type === 'wild') {
                    const colorCounts = { red: 0, yellow: 0, green: 0, blue: 0 };
                    computerHand.forEach(c => {
                        if (c.color !== 'black') colorCounts[c.color]++;
                    });
                    const bestColor = Object.keys(colorCounts).reduce((a, b) => 
                        colorCounts[a] > colorCounts[b] ? a : b);
                    card.color = bestColor;
                }
                
                handleCardEffect(card);
                playedCard = true;
                break;
            }
        }
        
        if (!playedCard) {
            // IA roba una carta
            computerHand.push(drawCard());
            showNotification('La IA robó una carta', 'info');
        }
        
        // Verificar victoria de la IA
        if (computerHand.length === 0) {
            gameWon('computer');
            return;
        }
        
        updateUI();
        
        // Cambiar turno si no se saltó
        if (currentPlayer === 'computer') {
            currentPlayer = 'player';
        }
    }
    
    function drawCardPlayer() {
        if (currentPlayer !== 'player' || !gameActive) return;
        
        playerHand.push(drawCard());
        currentPlayer = 'computer';
        updateUI();
        setTimeout(computerTurn, 1000);
    }
    
    function gameWon(winner) {
        gameActive = false;
        const message = winner === 'player' ? '¡Ganaste!' : 'La IA ganó';
        const type = winner === 'player' ? 'success' : 'error';
        
        showNotification(message, type);
        
        if (winner === 'player') {
            score += 100 + (computerHand.length * 10);
            updateGameInfo();
            addToLeaderboard('uno', score);
        }
    }
    
    // Crear interfaz del juego
    const gameBoard = document.createElement('div');
    gameBoard.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        max-width: 800px;
        margin: 0 auto;
    `;
    
    gameBoard.innerHTML = `
        <div id="computer-section" style="text-align: center;">
            <div id="computer-count" style="color: var(--primary-color); margin-bottom: 0.5rem;"></div>
            <div id="computer-hand" style="display: flex; justify-content: center; flex-wrap: wrap;"></div>
        </div>
        
        <div id="center-area" style="display: flex; align-items: center; gap: 2rem; margin: 1rem 0;">
            <div style="text-align: center;">
                <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">Baraja</div>
                <div id="deck" style="
                    width: 60px; 
                    height: 90px; 
                    background: linear-gradient(135deg, #2c3e50, #4a69bd);
                    border: 2px solid var(--primary-color);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary-color);
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                " onclick="drawCardPlayer()">UNO</div>
            </div>
            
            <div style="text-align: center;">
                <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">Última carta</div>
                <div id="discard-pile"></div>
            </div>
        </div>
        
        <div id="player-section" style="text-align: center;">
            <div id="player-count" style="color: var(--success-color); margin-bottom: 0.5rem;"></div>
            <div id="player-hand" style="display: flex; justify-content: center; flex-wrap: wrap;"></div>
        </div>
        
        <div id="game-status" style="text-align: center; margin-top: 1rem;">
            <div id="current-player" style="color: var(--accent-color); font-weight: bold;"></div>
        </div>
        
        <div id="color-chooser" style="
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(22, 33, 62, 0.95);
            padding: 1rem;
            border: 2px solid var(--primary-color);
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
        "></div>
    `;
    
    // Configurar evento para robar carta
    window.drawCardPlayer = drawCardPlayer;
    
    gameArea.appendChild(gameBoard);
    
    // Inicializar juego
    createDeck();
    dealInitialCards();
    updateUI();
    
    showNotification('¡Bienvenido a UNO! Haz coincidir colores o números', 'info');
}

// Funciones auxiliares para juegos más complejos
function loadSlidingPuzzle() {
    const gameArea = document.getElementById('game-area');
    // Implementación simplificada del puzzle deslizante
    gameArea.innerHTML = '<div style="text-align: center; color: var(--text-primary);">Puzzle deslizante - En desarrollo</div>';
}

function loadTetris() {
    const gameArea = document.getElementById('game-area');
    // Implementación simplificada de Tetris
    gameArea.innerHTML = '<div style="text-align: center; color: var(--text-primary);">Tetris - En desarrollo</div>';
}

function loadFlappyBird() {
    const gameArea = document.getElementById('game-area');
    // Implementación simplificada de Flappy Bird
    gameArea.innerHTML = '<div style="text-align: center; color: var(--text-primary);">Flappy Bird - En desarrollo</div>';
}

// Funciones de gestión del juego
function updateGameInfo() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

function startGameTimer() {
    gameTimer = setInterval(() => {
        if (gameRunning) {
            gameTime++;
            const minutes = Math.floor(gameTime / 60);
            const seconds = gameTime % 60;
            document.getElementById('time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function closeGame() {
    gameRunning = false;
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // Limpiar cualquier listener o interval específico del juego
    const gameArea = document.getElementById('game-area');
    if (gameArea.dataset.cleanup) {
        try {
            gameArea.dataset.cleanup();
        } catch (e) {
            console.log('Error cleaning up game:', e);
        }
        delete gameArea.dataset.cleanup;
    }
    
    // Limpiar el área de juego
    gameArea.innerHTML = '';
    
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('hidden');
    gameContainer.removeAttribute('data-game');
    document.body.style.overflow = 'auto';
    currentGame = null;
}

function restartGame() {
    if (currentGame) {
        const gameType = currentGame;
        closeGame();
        setTimeout(() => startGame(gameType), 100);
    }
}

function togglePause() {
    gameRunning = !gameRunning;
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.innerHTML = gameRunning ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: var(--background-dark);
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-neon);
        font-weight: bold;
    `;
    
    if (type === 'success') {
        notification.style.background = 'var(--success-color)';
    } else if (type === 'error') {
        notification.style.background = 'var(--error-color)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Sistema de leaderboard
function addToLeaderboard(game, finalScore) {
    const entry = {
        game: game,
        score: finalScore,
        date: new Date().toLocaleDateString(),
        player: 'Jugador'
    };
    
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100); // Mantener solo top 100
    
    localStorage.setItem('gameZoneLeaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
}

function updateLeaderboard() {
    const container = document.getElementById('leaderboard-entries');
    const activeTab = document.querySelector('.tab-btn.active');
    const gameFilter = activeTab ? activeTab.dataset.game : 'all';
    
    filterLeaderboard(gameFilter);
}

function filterLeaderboard(gameType) {
    const container = document.getElementById('leaderboard-entries');
    let filteredLeaderboard = leaderboard;
    
    if (gameType !== 'all') {
        filteredLeaderboard = leaderboard.filter(entry => entry.game === gameType);
    }
    
    container.innerHTML = '';
    
    filteredLeaderboard.slice(0, 10).forEach((entry, index) => {
        const row = document.createElement('div');
        row.style.cssText = `
            display: grid;
            grid-template-columns: 80px 1fr 1fr 120px 120px;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        `;
        
        if (index < 3) {
            const medals = ['🥇', '🥈', '🥉'];
            row.style.background = 'rgba(255, 215, 0, 0.1)';
        }
        
        row.innerHTML = `
            <span style="text-align: center; font-weight: bold; color: var(--primary-color);">
                ${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
            </span>
            <span>${entry.player}</span>
            <span style="text-transform: capitalize;">${getGameName(entry.game)}</span>
            <span style="text-align: center; font-weight: bold; color: var(--accent-color);">
                ${entry.score.toLocaleString()}
            </span>
            <span style="text-align: center; color: var(--text-secondary);">${entry.date}</span>
        `;
        
        container.appendChild(row);
    });
    
    if (filteredLeaderboard.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                No hay puntuaciones registradas aún
            </div>
        `;
    }
}

function getGameName(gameKey) {
    const gameNames = {
        'tictactoe': 'Tic Tac Toe',
        'snake': 'Snake',
        'memory': 'Memory',
        'puzzle': 'Puzzle',
        'rps': 'Piedra, Papel, Tijera',
        'uno': 'UNO',
        'flappy': 'Flappy Bird',
        'guess': 'Adivina el Número'
    };
    return gameNames[gameKey] || gameKey;
}
