import Card from "@/features/game-zone/components/Card";
import { Sparkles } from "lucide-react";

const ACTIVITIES = [
  {
    id: 1,
    title: "Game Zone",
    description: "Fun games to improve your thinking skills and creativity!",
    image: "/gamezone.jpg",
    color: "bg-purple-500",
    link: "/dashboard/game-zone",
  },
  {
    id: 2,
    title: "Car Race",
    description: "Race against time and learn new things along the way!",
    image: "/carrace.png",
    color: "bg-blue-500",
    link: process.env.NEXT_PUBLIC_CAR_RACING_LINK || "https://3d-car-racing-phi.vercel.app/",
  },
  {
    id: 3,
    title: "Tank Battle Game",
    description: "Engage in epic tank battles and test your strategy skills!",
    image: "/tank.png",
    color: "bg-red-500",
    link: process.env.NEXT_PUBLIC_TANK_GAME_LINK || "https://battle-tanks.vercel.app/",
  },
  {
    id: 4,
    title: "3D Chess Game",
    description: "Challenge your mind with an immersive 3D chess experience!",
    image: "/chess.png",
    color: "bg-indigo-500",
    link: process.env.NEXT_PUBLIC_CHESS_GAME_LINK || "https://3-d-chess-dun.vercel.app/",
  },
  {
    id: 5,
    title: "Situation Reaction Test",
    description: "Practice safe, fair reactions to real-life situations.",
    image: "/srt.webp",
    color: "bg-pink-500",
    link: "/dashboard/srt",
  },
  {
    id: 6,
    title: "Quiz Section",
    description: "Build rights knowledge with adaptive quizzes and feedback.",
    image: "/quiz.jpg",
    color: "bg-green-500",
    link: "/dashboard/quiz",
  },
  {
    id: 7,
    title: "Chatbot",
    description: "Talk to our friendly robot and ask any questions you have!",
    image: "/chatbot.avif",
    color: "bg-yellow-500",
    link: "/chatbot",
  },
];

/**
 * DashboardHome — Main dashboard page.
 *
 * Displays a welcome banner, quick stats, and activity cards
 * in a responsive grid. Uses the shared Card component for
 * consistent presentation.
 */
export default function DashboardHome() {
  return (
    <main className="min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-brand-gradient text-white py-10 px-4 sm:px-6">
        <div className="section-container">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <span className="badge bg-white/15 text-white text-xs">Welcome Explorer!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Your Learning Adventure
          </h1>
          <p className="text-white/80 text-base max-w-xl">
            Pick an activity below to start learning about your rights and laws through
            fun games, quizzes, and challenges!
          </p>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="section-container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((activity) => (
            <Card
              key={activity.id}
              title={activity.title}
              description={activity.description}
              image={activity.image}
              color={activity.color}
              link={activity.link}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
