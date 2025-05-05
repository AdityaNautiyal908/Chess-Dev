class ChessAI {
    constructor() {
        this.pieceValues = {
            'pawn': 1,
            'knight': 3,
            'bishop': 3,
            'rook': 5,
            'queen': 9,
            'king': 100
        };
    }

    // Evaluate the board position
    evaluateBoard(board) {
        let score = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = board[row][col];
                if (square) {
                    const value = this.pieceValues[square.piece];
                    score += square.color === 'white' ? value : -value;
                }
            }
        }
        return score;
    }

    // Get all possible moves for a piece
    getPossibleMoves(board, row, col) {
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = this.getPieceDirections(piece.piece);

        for (const [dx, dy] of directions) {
            let newRow = row + dy;
            let newCol = col + dx;

            // Check if the move is within bounds
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetSquare = board[newRow][newCol];
                
                // If square is empty, add move
                if (!targetSquare) {
                    moves.push({ row: newRow, col: newCol });
                }
                // If square has enemy piece, add capture move and stop
                else if (targetSquare.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol });
                    break;
                }
                // If square has friendly piece, stop
                else {
                    break;
                }

                // For pieces that can't move multiple squares, break after first move
                if (piece.piece === 'knight' || piece.piece === 'king') {
                    break;
                }

                newRow += dy;
                newCol += dx;
            }
        }

        return moves;
    }

    // Get movement directions for each piece type
    getPieceDirections(pieceType) {
        switch (pieceType) {
            case 'pawn':
                return [[0, 1]]; // Pawns only move forward
            case 'knight':
                return [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
            case 'bishop':
                return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            case 'rook':
                return [[-1, 0], [1, 0], [0, -1], [0, 1]];
            case 'queen':
                return [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
            case 'king':
                return [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
            default:
                return [];
        }
    }

    // Make a move for the computer
    makeMove(game) {
        const board = this.getBoardState(game);
        let bestScore = -Infinity;
        let bestMove = null;

        // Find all black pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = board[row][col];
                if (square && square.color === 'black') {
                    const moves = this.getPossibleMoves(board, row, col);
                    
                    // Evaluate each possible move
                    for (const move of moves) {
                        // Make the move
                        const tempBoard = JSON.parse(JSON.stringify(board));
                        tempBoard[move.row][move.col] = square;
                        tempBoard[row][col] = null;

                        // Evaluate the resulting position
                        const score = this.evaluateBoard(tempBoard);
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = {
                                from: { row, col },
                                to: move
                            };
                        }
                    }
                }
            }
        }

        return bestMove;
    }

    // Get current board state from the game
    getBoardState(game) {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        const squares = game.board.children;

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
} 