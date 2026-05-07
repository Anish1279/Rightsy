import { Suspense } from "react"
//  this is providing the basic layout for the aboves quiz section ....

export const metadata = {
  title: "Indian Laws & Rights Quiz for Kids",
  description: "Learn about Indian laws and rights through fun interactive quizzes for children Of age group of 6-14 years",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Indian Laws & Rights Quiz for Kids</title>
        <meta name="description" content="Learn about Indian laws and rights through fun interactive quizzes for children" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
