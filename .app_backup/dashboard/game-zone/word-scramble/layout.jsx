import { GameStateProvider } from "@/hooks/use-game-state"

export const metadata = {
  title: "Word Scramble Game",
  description: "A fun word scramble game with hints and rewards",
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
