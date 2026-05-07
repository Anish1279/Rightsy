import { Nunito } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata = {
  title: "Rightsy — Learn Your Rights Through Play",
  description:
    "An interactive platform for children ages 8–14 to learn about their rights and laws through games, quizzes, and challenges. Fun, safe, and educational.",
  keywords: ["children rights", "kids education", "legal literacy", "interactive learning", "quiz games"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} dark`}>
      <body className={nunito.className}>
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
