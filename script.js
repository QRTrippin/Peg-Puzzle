document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const message = document.getElementById("message");
    const newGameButton = document.getElementById("newGame");
    let selectedPeg = null;
    let legalMoves = [];
    let gameState = [];
    let gameOver = false;

    function createBoard() {
        board.innerHTML = "";
        message.innerText = "";
        gameOver = false;
        gameState = [];
        let pegId = 0;
        for (let row = 0; row < 5; row++) {
            let rowDiv = document.createElement("div");
            rowDiv.classList.add("row");
            let rowArray = [];
            for (let col = 0; col <= row; col++) {
                let peg = document.createElement("div");
                peg.classList.add("peg", "occupied");
                peg.dataset.id = pegId;
                peg.dataset.row = row;
                peg.dataset.col = col;
                peg.addEventListener("click", handlePegClick);
                rowDiv.appendChild(peg);
                rowArray.push({ element: peg, occupied: true });
                pegId++;
            }
            gameState.push(rowArray);
            board.appendChild(rowDiv);
        }
        let randomRow = Math.floor(Math.random() * 5);
        let randomCol = Math.floor(Math.random() * (randomRow + 1));
        gameState[randomRow][randomCol].occupied = false;
        gameState[randomRow][randomCol].element.classList.remove("occupied");
        gameState[randomRow][randomCol].element.classList.add("empty");
    }

    function handlePegClick(event) {
        if (gameOver) return; // Prevent moves after game over

        let peg = event.target;
        let row = parseInt(peg.dataset.row);
        let col = parseInt(peg.dataset.col);

        if (selectedPeg) {
            let move = legalMoves.find(m => m.row === row && m.col === col);
            if (move) {
                executeMove(selectedPeg, move);
            } else {
                resetSelection();
            }
        } else {
            legalMoves = getLegalMoves(row, col);
            if (legalMoves.length === 1) {
                executeMove({ row, col }, legalMoves[0]);
            } else if (legalMoves.length > 1) {
                selectedPeg = { row, col };
                message.innerText = "Select a red hole to choose your move.";
                legalMoves.forEach(move => gameState[move.row][move.col].element.classList.add("highlight"));
            }
        }
    }

    function getLegalMoves(row, col) {
        let moves = [];
        let directions = [
            { dr: -2, dc: 0 }, // Up
            { dr: 2, dc: 0 }, // Down
            { dr: 0, dc: -2 }, // Left
            { dr: 0, dc: 2 }, // Right
            { dr: -2, dc: -2 }, // Up Left
            { dr: -2, dc: 2 }, // Up Right
            { dr: 2, dc: -2 }, // Down Left
            { dr: 2, dc: 2 } // Down Right
        ];

        for (let { dr, dc } of directions) {
            let midRow = row + dr / 2;
            let midCol = col + dc / 2;
            let newRow = row + dr;
            let newCol = col + dc;
            if (isValidMove(row, col, midRow, midCol, newRow, newCol)) {
                moves.push({ row: newRow, col: newCol, midRow, midCol });
            }
        }
        return moves;
    }

    function isValidMove(row, col, midRow, midCol, newRow, newCol) {
        return gameState[midRow] && gameState[midRow][midCol] &&
            gameState[newRow] && gameState[newRow][newCol] &&
            gameState[midRow][midCol].occupied && !gameState[newRow][newCol].occupied;
    }

    function executeMove(from, to) {
        let peg = gameState[from.row][from.col].element;
        let jumpedPeg = gameState[to.midRow][to.midCol].element;
        let targetPeg = gameState[to.row][to.col].element;
        
        // Show the temporary image for the jumped peg
        jumpedPeg.style.backgroundImage = "url('./Ninja Player Fire.png')";
        
        setTimeout(() => {
            jumpedPeg.style.backgroundImage = "";
            jumpedPeg.classList.remove("occupied");
            jumpedPeg.classList.add("empty");
            gameState[to.midRow][to.midCol].occupied = false;
            
            peg.classList.remove("occupied");
            peg.classList.add("empty");
            targetPeg.classList.remove("empty");
            targetPeg.classList.add("occupied");
            
            gameState[from.row][from.col].occupied = false;
            gameState[to.row][to.col].occupied = true;
            
            resetSelection();
            checkGameOver();
        }, 250); // quarter-second delay to show defeated ninja
    }

    function resetSelection() {
        selectedPeg = null;
        message.innerText = "";
        document.querySelectorAll(".highlight").forEach(peg => peg.classList.remove("highlight"));
    }

    function checkGameOver() {
        let pegsLeft = gameState.flat().filter(p => p.occupied).length;
        if (pegsLeft === 1) {
            message.innerText = "You are a genius!";
            gameOver = true;
        } else if (!gameState.some(row => row.some(p => p.occupied && getLegalMoves(parseInt(p.element.dataset.row), parseInt(p.element.dataset.col)).length > 0))) {
            message.innerText = "Game over! No more legal moves.";
            gameOver = true;
        }
    }

    newGameButton.addEventListener("click", createBoard);
    createBoard();
});
