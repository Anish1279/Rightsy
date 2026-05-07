"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Clock } from "lucide-react"
import Board from "@/features/game-zone/components/Board"
import Controls from "@/features/game-zone/components/Controls"
import PopupMessage from "@/features/game-zone/components/PopupMessage"
import { useLearningVideo } from "@/features/learning-videos"

const PUZZLES = {
  easy: {
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  medium: {
    puzzle: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
  },
  hard: {
    puzzle: [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0],
    ],
    solution: [
      [1, 2, 3, 6, 7, 8, 9, 4, 5],
      [5, 8, 4, 2, 3, 9, 7, 6, 1],
      [9, 6, 7, 1, 4, 5, 3, 2, 8],
      [3, 7, 2, 4, 6, 1, 5, 8, 9],
      [6, 9, 1, 5, 8, 3, 2, 7, 4],
      [4, 5, 8, 7, 9, 2, 6, 1, 3],
      [8, 3, 6, 9, 2, 4, 1, 5, 7],
      [2, 1, 9, 8, 5, 7, 4, 3, 6],
      [7, 4, 5, 3, 1, 6, 8, 9, 2],
    ],
  },
}

const GAME_ID = "sudoku"

export default function SudokuPage() {
  const [board, setBoard] = useState(() => Array(9).fill(0).map(() => Array(9).fill(0)))
  const [solution, setSolution] = useState(() => Array(9).fill(0).map(() => Array(9).fill(0)))
  const [fixedCells, setFixedCells] = useState(() => Array(9).fill(0).map(() => Array(9).fill(false)))
  const [selectedCell, setSelectedCell] = useState(null)
  const [difficulty, setDifficulty] = useState("medium")
  const [errors, setErrors] = useState([])
  const [message, setMessage] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const pendingHintRef = useRef(null)

  const handleHintUnlock = useCallback(() => {
    const hintCell = pendingHintRef.current
    pendingHintRef.current = null
    if (!hintCell) return

    const [row, col] = hintCell
    setBoard((current) => {
      const next = current.map((line) => line.slice())
      next[row][col] = solution[row][col]
      return next
    })
    setErrors((current) => current.filter(([r, c]) => r !== row || c !== col))
    setIsActive(true)
    setMessage({ text: "Here's your hint! ✨", type: "info" })
  }, [solution])

  const startNewGameRef = useRef(null)

  const handleResumeAfterLoss = useCallback(() => {
    startNewGameRef.current?.()
  }, [])

  const learning = useLearningVideo({
    gameId: GAME_ID,
    onUnlockByReason: {
      hint: handleHintUnlock,
      "failure-threshold": handleResumeAfterLoss,
      lose: handleResumeAfterLoss,
    },
  })

  const newGame = useCallback(() => {
    setSelectedCell(null)
    setErrors([])
    setTimer(0)
    setIsActive(true)
    pendingHintRef.current = null
    learning.resetFailures()

    const { puzzle, solution: nextSolution } = PUZZLES[difficulty]
    const puzzleCopy = puzzle.map((line) => line.slice())
    const solutionCopy = nextSolution.map((line) => line.slice())

    setBoard(puzzleCopy)
    setSolution(solutionCopy)

    const fixed = puzzle.map((line) => line.map((value) => value !== 0))
    setFixedCells(fixed)
    setMessage({ text: "New game started!", type: "info" })
  }, [difficulty, learning])

  useEffect(() => {
    startNewGameRef.current = newGame
  }, [newGame])

  useEffect(() => {
    newGame()
  }, [newGame])

  useEffect(() => {
    if (!isActive) return undefined
    const interval = setInterval(() => {
      setTimer((current) => current + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCellClick = (row, col) => {
    setSelectedCell([row, col])
    learning.noteActivity()
    if (fixedCells[row][col]) {
      setMessage({ text: "This is a fixed cell and cannot be modified", type: "info" })
    }
  }

  const isBoardComplete = (candidate) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (candidate[row][col] !== solution[row][col]) {
          return false
        }
      }
    }
    return true
  }

  const handleNumberClick = (num) => {
    if (!selectedCell) {
      setMessage({ text: "Please select a cell first", type: "info" })
      return
    }

    const [row, col] = selectedCell
    if (fixedCells[row][col]) {
      setMessage({ text: "Cannot modify fixed cells", type: "error" })
      return
    }

    learning.noteActivity()
    const newBoard = board.map((line) => line.slice())
    newBoard[row][col] = num
    setBoard(newBoard)

    if (num !== solution[row][col]) {
      setErrors((current) => [...current, [row, col]])
      const triggered = learning.registerFailure()
      if (triggered) {
        setIsActive(false)
      } else {
        setMessage({ text: "Wrong answer! Keep trying.", type: "error" })
      }
      return
    }

    setErrors((current) => current.filter(([r, c]) => r !== row || c !== col))
    if (isBoardComplete(newBoard)) {
      setIsActive(false)
      setMessage({ text: "Congratulations! You solved the puzzle!", type: "success" })
    }
  }

  const handleClearCell = () => {
    if (!selectedCell) {
      setMessage({ text: "Please select a cell first", type: "info" })
      return
    }
    const [row, col] = selectedCell
    if (fixedCells[row][col]) {
      setMessage({ text: "Cannot clear fixed cells", type: "error" })
      return
    }
    learning.noteActivity()
    const newBoard = board.map((line) => line.slice())
    newBoard[row][col] = 0
    setBoard(newBoard)
    setErrors((current) => current.filter(([r, c]) => r !== row || c !== col))
  }

  const handleHint = () => {
    if (!selectedCell) {
      setMessage({ text: "Please select a cell first", type: "info" })
      return
    }
    const [row, col] = selectedCell
    if (fixedCells[row][col]) {
      setMessage({ text: "This cell is already filled correctly", type: "info" })
      return
    }
    if (board[row][col] === solution[row][col]) {
      setMessage({ text: "This cell is already correct", type: "info" })
      return
    }

    pendingHintRef.current = [row, col]
    const queued = learning.triggerOnHint({ row, col })
    if (queued) {
      setIsActive(false)
    } else {
      pendingHintRef.current = null
      setMessage({ text: "Hint not ready yet — try again in a moment.", type: "info" })
    }
  }

  const handleSaveGame = () => {
    const gameState = { board, solution, fixedCells, timer, difficulty }
    try {
      localStorage.setItem("sudokuGameState", JSON.stringify(gameState))
      setMessage({ text: "Game saved successfully!", type: "success" })
    } catch {
      setMessage({ text: "Failed to save game", type: "error" })
    }
  }

  const handleLoadGame = () => {
    try {
      const savedState = localStorage.getItem("sudokuGameState")
      if (!savedState) {
        setMessage({ text: "No saved game found", type: "error" })
        return
      }
      const parsed = JSON.parse(savedState)
      setBoard(parsed.board)
      setSolution(parsed.solution)
      setFixedCells(parsed.fixedCells)
      setTimer(parsed.timer)
      setDifficulty(parsed.difficulty)
      setSelectedCell(null)
      setErrors([])
      setIsActive(true)
      setMessage({ text: "Game loaded successfully!", type: "success" })
    } catch {
      setMessage({ text: "Failed to load saved game", type: "error" })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-purple-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-8 text-center">Sudoku Challenge</h1>

      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-4 md:p-6">
        {message && <PopupMessage message={message.text} type={message.type} onClose={() => setMessage(null)} />}

        <div className="flex justify-between items-center mb-4">
          <div className="text-purple-700 font-semibold">
            Difficulty: <span className="capitalize">{difficulty}</span>
          </div>
          <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full text-purple-700">
            <Clock size={18} className="mr-1" />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
        </div>

        <Board
          board={board}
          fixedCells={fixedCells}
          selectedCell={selectedCell}
          handleCellClick={handleCellClick}
          errors={errors}
        />

        <div className="mt-6">
          <Controls
            handleNumberClick={handleNumberClick}
            handleClearCell={handleClearCell}
            handleNewGame={newGame}
            handleHint={handleHint}
            handleSaveGame={handleSaveGame}
            handleLoadGame={handleLoadGame}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </div>
      </div>
    </main>
  )
}
