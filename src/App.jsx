import { useState } from "react";

const createEmptyBoard = () => Array.from({ length: 9 }, () => Array(9).fill(""));

const VALID_MSG = "Sudoku is valid so far!";
const INVALID_MSG = "Invalid Sudoku! Conflicts found.";

// Finds duplicates in a group of cells. Each cell is { r, c, value }.
// Returns the positions ("r-c") of every cell involved in a duplicate.
function findDuplicates(cells) {
  const seen = new Map(); // value -> list of positions
  for (const { r, c, value } of cells) {
    if (!value) continue; // ignore empty cells
    if (!seen.has(value)) seen.set(value, []);
    seen.get(value).push(`${r}-${c}`);
  }
  const conflicts = [];
  for (const positions of seen.values()) {
    if (positions.length > 1) conflicts.push(...positions);
  }
  return conflicts;
}

function isValidRow(board, r) {
  return findDuplicates(board[r].map((value, c) => ({ r, c, value })));
}

function isValidColumn(board, c) {
  return findDuplicates(board.map((row, r) => ({ r, c, value: row[c] })));
}

function isValidBox(board, boxRow, boxCol) {
  const cells = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      cells.push({ r, c, value: board[r][c] });
    }
  }
  return findDuplicates(cells);
}

function App() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [message, setMessage] = useState("");
  const [conflictingCells, setConflictingCells] = useState(new Set());

  const handleChange = (r, c, raw) => {
    const value = raw.replace(/[^1-9]/g, "").slice(-1); // only a single 1-9 digit
    setBoard((prev) => prev.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row)));
    // Editing removes previous results
    setConflictingCells(new Set());
    setMessage("");
  };

  const handleValidate = () => {
    const conflicts = new Set();
    for (let i = 0; i < 9; i++) {
      isValidRow(board, i).forEach((p) => conflicts.add(p));
      isValidColumn(board, i).forEach((p) => conflicts.add(p));
    }
    for (let r = 0; r < 9; r += 3) {
      for (let c = 0; c < 9; c += 3) {
        isValidBox(board, r, c).forEach((p) => conflicts.add(p));
      }
    }
    setConflictingCells(conflicts);
    setMessage(conflicts.size > 0 ? INVALID_MSG : VALID_MSG);
  };

  const handleClear = () => {
    setBoard(createEmptyBoard());
    setConflictingCells(new Set());
    setMessage("");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="card shadow-sm border-0 sudoku-card">
        <div className="card-body p-4 text-center">
          <h1 className="title mb-1">Sudoku Validator</h1>
          <p className="subtitle mb-3">Enter numbers 1-9 and validate the board.</p>

          <div className="board">
            {board.map((row, r) =>
              row.map((value, c) => {
                const classes = ["cell"];
                if (conflictingCells.has(`${r}-${c}`)) classes.push("invalid");
                return (
                  <input
                    key={`${r}-${c}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={classes.join(" ")}
                    value={value}
                    onChange={(e) => handleChange(r, c, e.target.value)}
                    aria-label={`Row ${r + 1} Column ${c + 1}`}
                  />
                );
              })
            )}
          </div>

          <div className="d-flex justify-content-center gap-2 mt-3">
            <button type="button" className="btn btn-primary btn-sm btn-validate" onClick={handleValidate}>
              Validate
            </button>
            <button type="button" className="btn btn-sm btn-clear" onClick={handleClear}>
              Clear
            </button>
          </div>

          {message && (
            <p className="message mt-3 mb-0">
              {message === VALID_MSG ? "✅ " : "❌ "}
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
