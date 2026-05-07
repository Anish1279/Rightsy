"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Clock, RefreshCw, Check, Lightbulb } from "lucide-react"
import { useLearningVideo } from "@/features/learning-videos"
import { WORD_SCRAMBLE_WORDS } from "@/features/word-scramble/data/words"

const GAME_ID = "word-scramble"
const ROUND_SECONDS = 30

function scramble(word) {
  const letters = word.split("")
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  return letters.join("")
}

export default function WordScramblePage() {
  const [scrambledWord, setScrambledWord] = useState("")
  const [correctWord, setCorrectWord] = useState("")
  const [hint, setHint] = useState("")
  const [imageHint, setImageHint] = useState("")
  const [userInput, setUserInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [showWinPopup, setShowWinPopup] = useState(false)
  const [showWrongPopup, setShowWrongPopup] = useState(false)
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false)
  const [showHintAnswerPopup, setShowHintAnswerPopup] = useState(false)
  const timerRef = useRef(null)
  const initRef = useRef(null)

  const handleResumeNewRound = useCallback(() => {
    initRef.current?.()
  }, [])

  const learning = useLearningVideo({
    gameId: GAME_ID,
    onUnlockByReason: {
      hint: () => setShowHintAnswerPopup(true),
      lose: handleResumeNewRound,
      "failure-threshold": handleResumeNewRound,
    },
  })

  const initGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    setUserInput("")
    setTimeLeft(ROUND_SECONDS)
    setShowWinPopup(false)
    setShowWrongPopup(false)
    setShowTimeoutPopup(false)
    setShowHintAnswerPopup(false)

    const randomObj = WORD_SCRAMBLE_WORDS[Math.floor(Math.random() * WORD_SCRAMBLE_WORDS.length)]
    setCorrectWord(randomObj.word.toLowerCase())
    setHint(randomObj.hint)
    setImageHint(randomObj.imghint)
    setScrambledWord(scramble(randomObj.word))

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    initRef.current = initGame
  }, [initGame])

  useEffect(() => {
    initGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [initGame])

  useEffect(() => {
    if (timeLeft === 0 && !showWinPopup) {
      setShowTimeoutPopup(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft, showWinPopup])

  const checkWord = () => {
    if (!userInput.trim()) return
    learning.noteActivity()
    if (userInput.toLowerCase() === correctWord) {
      learning.resetFailures()
      setShowWinPopup(true)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      setShowWrongPopup(true)
      learning.registerFailure()
    }
  }

  const showHintFlow = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const queued = learning.triggerOnHint({ word: correctWord })
    if (!queued) {
      setShowHintAnswerPopup(true)
    }
  }

  const handleTimeoutContinue = () => {
    setShowTimeoutPopup(false)
    const queued = learning.triggerOnLose({ reason: "timeout" })
    if (!queued) {
      initGame()
    }
  }

  const handleWrongContinue = () => {
    setShowWrongPopup(false)
    if (!learning.isLockedForGame) {
      // failure threshold may have already queued a video; if not, just resume
    }
  }

  return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="relative border-b border-purple-200 py-4">
          <h2 className="text-center text-2xl font-bold text-purple-800">Word Scramble</h2>
          <button
            onClick={showHintFlow}
            className="absolute right-4 top-4 text-purple-600 hover:text-purple-800 transition-colors"
            aria-label="Show hint"
          >
            <Lightbulb className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <Image
              src={imageHint || "/placeholder.svg?height=150&width=200"}
              alt="Hint"
              width={200}
              height={150}
              className="h-[150px] w-[200px] object-cover border-2 border-purple-300 rounded-lg"
            />
          </div>

          <p className="text-xl font-medium text-center tracking-[25px] text-purple-900 uppercase mb-6">
            {scrambledWord}
          </p>

          <div className="flex justify-between mb-6">
            <p className="text-sm text-purple-700">
              <span className="font-semibold">Hint: </span>
              {hint}
            </p>
            <p className="text-sm text-purple-700 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-semibold">{timeLeft}s</span>
            </p>
          </div>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            maxLength={correctWord.length}
            placeholder="Enter a valid word"
            className="w-full h-14 px-4 rounded-xl border border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-lg"
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={initGame}
              className="flex-1 bg-purple-200 hover:bg-purple-300 text-purple-800 py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </button>
            <button
              onClick={checkWord}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-colors"
            >
              <Check className="w-5 h-5 mr-2" />
              Check
            </button>
          </div>
        </div>
      </div>

      {showWinPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center transform transition-all">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto -mt-16 border-4 border-white">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">WIN! 🎊🎊🎊</h2>
            <button
              onClick={() => {
                setShowWinPopup(false)
                initGame()
              }}
              className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showWrongPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center transform transition-all">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto -mt-16 border-4 border-white">
              <span className="text-3xl text-red-600">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">WRONG!! 😵‍💫😵‍💫</h2>
            <button
              onClick={handleWrongContinue}
              className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {showTimeoutPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center transform transition-all">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto -mt-16 border-4 border-white">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">TIME-OUT 〽️〽️</h2>
            <button
              onClick={handleTimeoutContinue}
              className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {showHintAnswerPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center transform transition-all">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto -mt-16 border-4 border-white">
              <Lightbulb className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">
              Correct Answer: <span className="text-purple-700">{correctWord}</span>
            </h2>
            <button
              onClick={() => {
                setShowHintAnswerPopup(false)
                initGame()
              }}
              className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Next Word
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
