"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"

const CARDS = [
  { id: 1, name: "Child Marriage", imageUrl: "/images/child-marriage.jpg" },
  { id: 2, name: "Child", imageUrl: "/images/child.jpg" },
  { id: 3, name: "Gender", imageUrl: "/images/gender.jpg" },
  { id: 4, name: "Right Against Exploitation", imageUrl: "/images/Right-Against-Exploitation.jpg" },
  { id: 5, name: "Right to Education", imageUrl: "/images/right-to-education.jpg" },
  { id: 6, name: "Right to Religion", imageUrl: "/images/Right-to-Religion.jpg" },
  { id: 7, name: "Signal", imageUrl: "/images/signal.jpg" },
  { id: 8, name: "Bad", imageUrl: "/images/bad.webp" },
]

export default function MemoryGame({ onMove, onMismatch, onWin, restartSignal = 0 }) {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState({})
  const winFiredRef = useRef(false)

  useEffect(() => {
    initGame()
  }, [restartSignal])

  useEffect(() => {
    if (
      cards.length > 0 &&
      matchedCards.length === cards.length &&
      !winFiredRef.current
    ) {
      winFiredRef.current = true
      setGameOver(true)
      onWin?.(moves)
    }
  }, [matchedCards, cards, moves, onWin])

  useEffect(() => {
    if (flippedCards.length !== 2) return undefined
    const [first, second] = flippedCards
    if (cards[first].name === cards[second].name) {
      setMatchedCards((prev) => [...prev, first, second])
      setFlippedCards([])
      return undefined
    }
    onMismatch?.()
    const timer = setTimeout(() => setFlippedCards([]), 1000)
    return () => clearTimeout(timer)
  }, [flippedCards, cards, onMismatch])

  const initGame = () => {
    setLoading(true)
    winFiredRef.current = false
    const duplicatedCards = [...CARDS, ...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, id: index }))

    setCards(duplicatedCards)
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setGameOver(false)
    setImageErrors({})
    setTimeout(() => setLoading(false), 500)
  }

  const handleCardClick = (index) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      matchedCards.includes(index)
    ) {
      return
    }
    setFlippedCards((prev) => [...prev, index])
    setMoves((prev) => prev + 1)
    onMove?.()
  }

  const isFlipped = (index) => flippedCards.includes(index) || matchedCards.includes(index)
  const isMatched = (index) => matchedCards.includes(index)

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="text-purple-700 font-bold text-xl">Moves: {moves}</div>
        <button
          onClick={initGame}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Restart Game
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-xl border-4 border-purple-400 bg-purple-50 shadow-lg">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`aspect-square cursor-pointer transition-all duration-500 ${
                  isMatched(index) ? "opacity-80" : ""
                }`}
                onClick={() => handleCardClick(index)}
              >
                <div className="relative w-full h-full [perspective:1000px]">
                  <div
                    className={`absolute w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
                      isFlipped(index) ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <div className="absolute w-full h-full flex items-center justify-center bg-purple-200 rounded-xl shadow-md [backface-visibility:hidden]">
                      <span className="text-3xl">🎮</span>
                    </div>

                    <div className="absolute w-full h-full bg-white rounded-xl shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <div className="w-full h-full bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {imageErrors[index] ? (
                            <div className="flex flex-col items-center justify-center text-purple-700">
                              <ImageIcon className="w-8 h-8 mb-2" />
                              <span className="text-sm text-center">{card.name}</span>
                            </div>
                          ) : (
                            <div className="relative w-full h-full">
                              <Image
                                src={
                                  card.imageUrl ||
                                  `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(card.name)}`
                                }
                                alt={card.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover"
                                onError={() => handleImageError(index)}
                                priority={index < 4}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gameOver && (
            <div className="mt-8 p-6 bg-purple-100 rounded-xl text-center border-4 border-purple-400">
              <h2 className="text-2xl font-bold text-purple-700 mb-2">🎉 Hooray! You did it! 🎉</h2>
              <p className="text-purple-600 mb-4">You matched all the cards in {moves} moves!</p>
              <div className="text-3xl mb-4">🏆 👏 🥳</div>
              <button
                onClick={initGame}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Play Again 🎮
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
