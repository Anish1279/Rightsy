import { GameStateProvider } from "@/hooks/use-game-state"

export const metadata = {
  title: "Sudoku Game",
  description: "A modern Sudoku game with YouTube integration",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  )
}
