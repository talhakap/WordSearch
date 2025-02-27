const wordSearchMenu = document.getElementById('wordSearchMenu');
const wordSearch = document.getElementById('wordSearchGame');
const menu = document.getElementById('menu');
const wordPool = ["LOVE", "CAT", "SUKOTHAI", "FOOD", "MEMORIES", "CATCAFE", "POPEYES", "SKATING", "FUN", "CODING", "HAKKA", "LOOKOUT", "MOVIES", "PLAYDIUM", "MOMENT", "GIRL", "CUTE", "CHOCOLATE", "CANDY"];

let selectedCells = []; // Tracks the selected cells
let foundWords = []; // Tracks found words
let wordsToFind = []; // Words to find

document.addEventListener("DOMContentLoaded", () => {
    const difficultyLevel = document.getElementById("difficultyLevel");

    document.getElementById("wordSearchButton").addEventListener("click", () => {
        menu.style.display = "none";
        wordSearchMenu.style.display = "block";
        wordSearchMenu.classList.add("fade-in");
    });

    wordSearchMenu.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" && e.target.dataset.difficulty) {
            const difficulty = e.target.dataset.difficulty;
            startWordSearch(difficulty);
        }
    });

    document.getElementById("backButton").addEventListener("click", () => {
        wordSearch.style.display = "none";
        menu.style.display = "block";
        menu.classList.add("fade-in");
        resetGameState();
    
        // Hide the congratulations message
        const completionMessage = document.getElementById("completionMessage");
        completionMessage.style.display = "none";
    });

    // Add event listener for the Submit button
    document.getElementById("submitButton").addEventListener("click", () => {
        if (selectedCells.length > 0) {
            const selectedWord = selectedCells.map(cell => cell.textContent).join("");
            if (wordsToFind.includes(selectedWord) && isStraightLine(selectedCells)) {
                markWordAsFound(selectedWord);
            }
            clearSelection(); // Clear the selection after submission
        }
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startWordSearch(difficulty) {
        wordSearchMenu.style.display = "none";
        wordSearch.style.display = "block";
        wordSearch.classList.add("fade-in");
    
        const difficultyMap = {
            easy: { gridSize: 8, wordCount: 6 },
            medium: { gridSize: 12, wordCount: 8 },
            hard: { gridSize: 16, wordCount: 10 },
        };
    
        const { gridSize, wordCount } = difficultyMap[difficulty];
    
        // Shuffle and select words
        wordsToFind = shuffleArray([...wordPool]).slice(0, wordCount);
        difficultyLevel.textContent = `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    
        foundWords = []; // Reset found words
        renderWordSearch(gridSize);
    }

    function generateWordSearch(words, gridSize) {
        let grid;
        let allWordsPlaced = false;
    
        while (!allWordsPlaced) {
            grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
            allWordsPlaced = true; // Assume all words will be placed
    
            for (const word of words) {
                if (!placeWord(word, grid, gridSize)) {
                    allWordsPlaced = false; // If any word fails, restart the grid generation
                    break;
                }
            }
        }
    
        // Fill empty cells with random letters
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (!grid[row][col]) {
                    grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
    
        return grid;
    }
    
    function placeWord(word, grid, gridSize) {
        let placed = false;
        let attempts = 0;
    
        while (!placed && attempts < 100) {
            const direction = ["horizontal", "vertical", "diagonal"][Math.floor(Math.random() * 3)];
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
    
            if (direction === "horizontal" && col + word.length <= gridSize) {
                if (grid[row].slice(col, col + word.length).every(cell => !cell)) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row][col + i] = word[i];
                    }
                    placed = true;
                }
            } else if (direction === "vertical" && row + word.length <= gridSize) {
                if (grid.slice(row, row + word.length).every(row => !row[col])) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row + i][col] = word[i];
                    }
                    placed = true;
                }
            } else if (direction === "diagonal" && row + word.length <= gridSize && col + word.length <= gridSize) {
                if (Array.from({ length: word.length }, (_, i) => grid[row + i][col + i]).every(cell => !cell)) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row + i][col + i] = word[i];
                    }
                    placed = true;
                }
            }
            attempts++;
        }
    
        return placed;
    }

    function renderWordSearch(gridSize) {
        const grid = generateWordSearch(wordsToFind, gridSize);
        const wordGrid = document.querySelector(".word-grid");

        if (!wordGrid) {
            console.error("Grid container not found.");
            return;
        }

        wordGrid.innerHTML = "";
        selectedCells = [];

        grid.forEach((row, rowIndex) => {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("row");

            row.forEach((letter, colIndex) => {
                const cell = document.createElement("span");
                cell.textContent = letter;
                cell.dataset.row = rowIndex;
                cell.dataset.col = colIndex;
                cell.addEventListener("click", () => selectCell(cell));
                cell.classList.add("pop-in");
                rowDiv.appendChild(cell);
            });

            wordGrid.appendChild(rowDiv);
        });

        renderWordList();
    }

    function renderWordList() {
        const wordListContainer = document.getElementById("wordList");
        wordListContainer.innerHTML = "";

        wordsToFind.forEach(word => {
            const listItem = document.createElement("li");
            listItem.textContent = word;
            listItem.dataset.word = word;
            listItem.classList.add("slide-in");
            wordListContainer.appendChild(listItem);
        });
    }

    function selectCell(cell) {
        if (cell.classList.contains("selected")) {
            cell.classList.remove("selected");
            selectedCells = selectedCells.filter(c => c !== cell);
        } else {
            cell.classList.add("selected");
            selectedCells.push(cell);
        }
    }

    function isStraightLine(cells) {
        const rows = cells.map(cell => parseInt(cell.dataset.row));
        const cols = cells.map(cell => parseInt(cell.dataset.col));

        const isHorizontal = rows.every((row, i, arr) => row === arr[0]);
        const isVertical = cols.every((col, i, arr) => col === arr[0]);

        const isDiagonal = rows.every((row, i, arr) => row === arr[0] + i) && 
                          cols.every((col, i, arr) => col === arr[0] + i);

        return isHorizontal || isVertical || isDiagonal;
    }

    function markWordAsFound(word) {
        if (!foundWords.includes(word)) {
            foundWords.push(word);
            const listItem = document.querySelector(`[data-word="${word}"]`);
            listItem.classList.add("found"); // Add a class to cross out the word
    
            // Highlight the selected cells
            document.querySelectorAll(".selected").forEach(cell => {
                cell.classList.add("found-letter"); // Add a class for found letters
                cell.classList.add("highlight");
                cell.classList.remove("selected");
            });
    
            if (foundWords.length === wordsToFind.length) {
                displayCongratulations();
            }
        }
    }

    function clearSelection() {
        selectedCells.forEach(cell => cell.classList.remove("selected"));
        selectedCells = [];
    }

    function resetGameState() {
        selectedCells = [];
        foundWords = [];
        wordsToFind = [];
        document.querySelectorAll(".word-grid .row span").forEach(cell => {
            cell.classList.remove("selected", "found", "highlight");
        });
        document.querySelectorAll("#wordList li").forEach(li => {
            li.classList.remove("found");
        });
    }

    function displayCongratulations() {
        const completionMessage = document.getElementById("completionMessage");
        completionMessage.style.display = "block";
        completionMessage.classList.add("fade-in");
        completionMessage.innerHTML = "<p>🎉 Congratulations! You've completed the Word Search! 🎉</p>";
    }
});