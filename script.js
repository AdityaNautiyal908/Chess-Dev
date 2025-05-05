// Screen elements
const startScreen = document.getElementById('startScreen');
const gameModeScreen = document.getElementById('gameModeScreen');
const gameScreen = document.getElementById('gameScreen');

// Buttons
const playBtn = document.getElementById('playBtn');
const quitBtn = document.getElementById('quitBtn');
const pvpBtn = document.getElementById('pvpBtn');
const pvcBtn = document.getElementById('pvcBtn');
const backToMenu = document.getElementById('backToMenu');

// Navigation functions
function showScreen(screen) {
    startScreen.classList.add('hidden');
    gameModeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

// Event listeners for navigation
playBtn.addEventListener('click', () => {
    showScreen(gameModeScreen);
});

quitBtn.addEventListener('click', () => {
    if (window.electron) {
        window.electron.quit();
    } else {
        window.close();
    }
});

backToMenu.addEventListener('click', () => {
    showScreen(startScreen);
});

pvpBtn.addEventListener('click', () => {
    showScreen(gameScreen);
    initializeGame('pvp');
});

pvcBtn.addEventListener('click', () => {
    showScreen(gameScreen);
    initializeGame('pvc');
});

// Chess piece Unicode characters
const PIECES = {
    'white': {
        'king': '♔',
        'queen': '♕',
        'rook': '♖',
        'bishop': '♗',
        'knight': '♘',
        'pawn': '♙'
    },
    'black': {
        'king': '♚',
        'queen': '♛',
        'rook': '♜',
        'bishop': '♝',
        'knight': '♞',
        'pawn': '♟'
    }
};

// Initial board setup
const initialBoard = [
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
];

class ChessGame {
    constructor(gameMode) {
        this.board = document.querySelector('.chess-board');
        this.selectedPiece = null;
        this.currentPlayer = 'white';
        this.gameMode = gameMode;
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        this.board.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add alternating colors
                if ((row + col) % 2 === 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }

                // Place pieces
                const piece = initialBoard[row][col];
                if (piece) {
                    const color = row < 2 ? 'black' : 'white';
                    square.textContent = PIECES[color][piece];
                    square.dataset.piece = piece;
                    square.dataset.color = color;
                }

                this.board.appendChild(square);
            }
        }
    }

    setupEventListeners() {
        this.board.addEventListener('click', (e) => {
            const square = e.target.closest('div[data-row]');
            if (!square) return;

            this.handleSquareClick(square);
        });

        // Game control buttons
        document.getElementById('newGame').addEventListener('click', () => {
            this.initializeBoard();
            this.currentPlayer = 'white';
        });

        document.getElementById('undo').addEventListener('click', () => {
            // TODO: Implement undo functionality
            console.log('Undo clicked');
        });

        document.getElementById('resign').addEventListener('click', () => {
            showScreen(startScreen);
        });
    }

    handleSquareClick(square) {
        const piece = square.dataset.piece;
        const color = square.dataset.color;

        // If no piece is selected and clicked square has a piece of current player's color
        if (!this.selectedPiece && piece && color === this.currentPlayer) {
            this.selectedPiece = square;
            square.classList.add('selected');
        }
        // If a piece is already selected
        else if (this.selectedPiece) {
            // If clicking the same piece, deselect it
            if (this.selectedPiece === square) {
                this.selectedPiece.classList.remove('selected');
                this.selectedPiece = null;
            }
            // If clicking a different square, try to move the piece
            else {
                // TODO: Implement move validation
                this.movePiece(this.selectedPiece, square);
                this.selectedPiece.classList.remove('selected');
                this.selectedPiece = null;

                // If in computer mode and it's computer's turn
                if (this.gameMode === 'pvc' && this.currentPlayer === 'black') {
                    // TODO: Implement computer move
                    setTimeout(() => this.makeComputerMove(), 500);
                }
            }
        }
    }

    movePiece(fromSquare, toSquare) {
        // TODO: Implement proper move validation
        toSquare.textContent = fromSquare.textContent;
        toSquare.dataset.piece = fromSquare.dataset.piece;
        toSquare.dataset.color = fromSquare.dataset.color;
        
        fromSquare.textContent = '';
        fromSquare.dataset.piece = '';
        fromSquare.dataset.color = '';

        // Switch turns
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    makeComputerMove() {
        // TODO: Implement computer move logic
        console.log('Computer is thinking...');
    }
}

// Initialize the game when a game mode is selected
function initializeGame(gameMode) {
    const game = new ChessGame(gameMode);
}

// Initialize the start screen when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showScreen(startScreen);
}); 