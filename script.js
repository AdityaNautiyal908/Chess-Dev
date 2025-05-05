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

// Initialize sound manager
const soundManager = new SoundManager();

// Navigation functions
function showScreen(screen) {
    startScreen.classList.add('hidden');
    gameModeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    screen.classList.remove('hidden');
    
    // Add entrance animation
    screen.classList.add('animate__animated', 'animate__fadeIn');
}

// Event listeners for navigation
playBtn.addEventListener('click', () => {
    soundManager.play('buttonClick');
    showScreen(gameModeScreen);
});

quitBtn.addEventListener('click', () => {
    soundManager.play('buttonClick');
    if (window.electron) {
        window.electron.quit();
    } else {
        window.close();
    }
});

backToMenu.addEventListener('click', () => {
    soundManager.play('buttonClick');
    showScreen(startScreen);
});

pvpBtn.addEventListener('click', () => {
    soundManager.play('gameStart');
    showScreen(gameScreen);
    initializeGame('pvp');
});

pvcBtn.addEventListener('click', () => {
    soundManager.play('gameStart');
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
        this.ai = gameMode === 'pvc' ? new ChessAI() : null;
        this.moveHistory = [];
        this.initializeBoard();
        this.setupEventListeners();
        this.updatePlayerInfo();
    }

    initializeBoard() {
        this.board.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
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
                    
                    // Add entrance animation for pieces
                    square.classList.add('animate__animated', 'animate__fadeIn');
                    square.style.animationDelay = `${(row * 8 + col) * 0.05}s`;
                }

                this.board.appendChild(square);
            }
        }
    }

    setupEventListeners() {
        this.board.addEventListener('click', (e) => {
            const square = e.target.closest('div[data-row]');
            if (!square) return;

            // Don't allow moves if it's computer's turn in PVC mode
            if (this.gameMode === 'pvc' && this.currentPlayer === 'black') {
                return;
            }

            this.handleSquareClick(square);
        });

        // Game control buttons
        document.getElementById('newGame').addEventListener('click', () => {
            soundManager.play('buttonClick');
            this.initializeBoard();
            this.currentPlayer = 'white';
            this.moveHistory = [];
            this.updatePlayerInfo();
        });

        document.getElementById('undo').addEventListener('click', () => {
            soundManager.play('buttonClick');
            this.undoLastMove();
        });

        document.getElementById('resign').addEventListener('click', () => {
            soundManager.play('gameOver');
            showScreen(startScreen);
        });
    }

    updatePlayerInfo() {
        const whitePlayer = document.querySelector('.player.white');
        const blackPlayer = document.querySelector('.player.black');
        
        if (this.gameMode === 'pvc') {
            whitePlayer.querySelector('.player-name').textContent = 'Player';
            blackPlayer.querySelector('.player-name').textContent = 'Computer';
        } else {
            whitePlayer.querySelector('.player-name').textContent = 'Player 1';
            blackPlayer.querySelector('.player-name').textContent = 'Player 2';
        }

        // Highlight current player
        whitePlayer.classList.toggle('active', this.currentPlayer === 'white');
        blackPlayer.classList.toggle('active', this.currentPlayer === 'black');
    }

    handleSquareClick(square) {
        const piece = square.dataset.piece;
        const color = square.dataset.color;

        // Remove previous highlights
        this.clearHighlights();

        // If no piece is selected and clicked square has a piece of current player's color
        if (!this.selectedPiece && piece && color === this.currentPlayer) {
            this.selectedPiece = square;
            square.classList.add('selected', 'animate__animated', 'animate__pulse');
            soundManager.play('buttonClick');
            // Highlight possible moves
            this.highlightPossibleMoves(square);
        }
        // If a piece is already selected
        else if (this.selectedPiece) {
            // If clicking the same piece, deselect it
            if (this.selectedPiece === square) {
                this.selectedPiece.classList.remove('selected', 'animate__pulse');
                this.selectedPiece = null;
                soundManager.play('buttonClick');
                this.clearHighlights();
            }
            // If clicking another of your own pieces, switch selection
            else if (piece && color === this.currentPlayer) {
                this.selectedPiece.classList.remove('selected', 'animate__pulse');
                this.selectedPiece = square;
                square.classList.add('selected', 'animate__animated', 'animate__pulse');
                soundManager.play('buttonClick');
                this.highlightPossibleMoves(square);
            }
            // If clicking a valid destination (empty or opponent's piece)
            else {
                const isCapture = square.dataset.piece !== undefined && color !== this.currentPlayer;
                // Only allow move if destination is empty or opponent's piece
                if (!piece || (piece && color !== this.currentPlayer)) {
                    this.movePiece(this.selectedPiece, square);
                    this.selectedPiece.classList.remove('selected', 'animate__pulse');
                    this.selectedPiece = null;
                    this.clearHighlights();
                    // Play appropriate sound
                    soundManager.play(isCapture ? 'capture' : 'move');
                    // If in computer mode and it's computer's turn
                    if (this.gameMode === 'pvc' && this.currentPlayer === 'black') {
                        setTimeout(() => this.makeComputerMove(), 500);
                    }
                }
            }
        }
    }

    highlightPossibleMoves(square) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = square.dataset.piece;
        const color = square.dataset.color;
        if (!piece || !color) return;
        // Use AI move generator for consistency
        const boardState = this.getBoardState();
        let moves = [];
        if (this.ai) {
            moves = this.ai.getPossibleMoves(boardState, row, col);
        } else {
            // For PvP, use a simple move generator (reuse AI logic)
            moves = (new ChessAI()).getPossibleMoves(boardState, row, col);
        }
        moves.forEach(move => {
            const target = this.board.querySelector(`.square[data-row='${move.row}'][data-col='${move.col}']`);
            if (target) target.classList.add('highlight');
        });
    }

    clearHighlights() {
        this.board.querySelectorAll('.highlight').forEach(sq => sq.classList.remove('highlight'));
    }

    getBoardState() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        const squares = this.board.children;
        for (let i = 0; i < squares.length; i++) {
            const square = squares[i];
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = square.dataset.piece;
            const color = square.dataset.color;
            if (piece && color) {
                board[row][col] = { piece, color };
            }
        }
        return board;
    }

    movePiece(fromSquare, toSquare) {
        // Store move in history
        this.moveHistory.push({
            from: {
                row: parseInt(fromSquare.dataset.row),
                col: parseInt(fromSquare.dataset.col),
                piece: fromSquare.dataset.piece,
                color: fromSquare.dataset.color
            },
            to: {
                row: parseInt(toSquare.dataset.row),
                col: parseInt(toSquare.dataset.col),
                piece: toSquare.dataset.piece,
                color: toSquare.dataset.color
            }
        });

        // Add move animation
        toSquare.classList.add('animate__animated', 'animate__fadeIn');
        
        // Move the piece
        toSquare.textContent = fromSquare.textContent;
        toSquare.dataset.piece = fromSquare.dataset.piece;
        toSquare.dataset.color = fromSquare.dataset.color;
        
        fromSquare.textContent = '';
        fromSquare.dataset.piece = '';
        fromSquare.dataset.color = '';

        // Switch turns
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updatePlayerInfo();
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        const fromSquare = this.board.children[lastMove.from.row * 8 + lastMove.from.col];
        const toSquare = this.board.children[lastMove.to.row * 8 + lastMove.to.col];

        // Restore the moved piece
        fromSquare.textContent = PIECES[lastMove.from.color][lastMove.from.piece];
        fromSquare.dataset.piece = lastMove.from.piece;
        fromSquare.dataset.color = lastMove.from.color;

        // Restore the captured piece (if any)
        if (lastMove.to.piece) {
            toSquare.textContent = PIECES[lastMove.to.color][lastMove.to.piece];
            toSquare.dataset.piece = lastMove.to.piece;
            toSquare.dataset.color = lastMove.to.color;
        } else {
            toSquare.textContent = '';
            toSquare.dataset.piece = '';
            toSquare.dataset.color = '';
        }

        // Switch turns back
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updatePlayerInfo();
    }

    makeComputerMove() {
        if (this.ai) {
            const move = this.ai.makeMove(this);
            if (move) {
                const fromSquare = this.board.children[move.from.row * 8 + move.from.col];
                const toSquare = this.board.children[move.to.row * 8 + move.to.col];
                const isCapture = toSquare.dataset.piece !== undefined;
                
                this.movePiece(fromSquare, toSquare);
                soundManager.play(isCapture ? 'capture' : 'move');
            }
        }
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