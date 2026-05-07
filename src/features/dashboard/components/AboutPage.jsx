import { Shield, Sparkles, Brain, Award, Heart, Users } from "lucide-react";

const VALUES = [
  {
    icon: Shield,
    title: "Rights Education",
    description: "We make learning about rights accessible and engaging for every child.",
  },
  {
    icon: Brain,
    title: "Critical Thinking",
    description: "Our games and quizzes build problem-solving skills alongside legal literacy.",
  },
  {
    icon: Heart,
    title: "Safe Environment",
    description: "A kid-friendly platform with no ads, no tracking, and age-appropriate content.",
  },
  {
    icon: Sparkles,
    title: "Interactive Learning",
    description: "Learn through play — games, quizzes, and challenges make knowledge stick.",
  },
  {
    icon: Award,
    title: "Rewards & Progress",
    description: "Earn points, unlock achievements, and track your learning journey.",
  },
  {
    icon: Users,
    title: "Built for Kids",
    description: "Designed specifically for children ages 8–14 with simple, friendly language.",
  },
];

/**
 * AboutPage — Focused about-us page for the dashboard.
 *
 * Reduced from 987 lines (was a copy of the landing page)
 * to a clean ~100-line focused about page. Removes duplicate
 * hero, OctahedronVideo, and all landing-page sections.
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-brand-gradient py-10 px-4 sm:px-6">
        <div className="section-container text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            About Rightsy
          </h1>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            Making learning about rights and laws fun, safe, and engaging for every child.
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Mission */}
        <section className="max-w-3xl mx-auto text-center mb-16">
          <span className="badge badge-violet mb-4">OUR MISSION</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--rightsy-text-primary)] mb-4">
            Empowering Children Through{" "}
            <span className="text-gradient-brand">Knowledge</span>
          </h2>
          <p className="text-[var(--rightsy-text-secondary)] leading-relaxed">
            We believe every child deserves to understand their rights. Rightsy
            transforms complex legal concepts into interactive games, quizzes, and
            challenges that make learning natural, enjoyable, and memorable.
          </p>
        </section>

        {/* Values Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white p-6 rounded-2xl border-2 border-violet-100 card-hover"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-[var(--rightsy-text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--rightsy-text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Creator Section */}
        <section className="max-w-3xl mx-auto mt-20 mb-10">
          <div className="relative group rounded-[2.5rem] p-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 hover:shadow-[0_20px_50px_rgba(217,70,239,0.3)] transition-all duration-500">
            {/* Animated blurry background for glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-[2.3rem] p-10 sm:p-14 text-center overflow-hidden flex flex-col items-center justify-center z-10 border border-white/50">
              
              <div className="absolute top-[-2rem] right-[-2rem] p-8 opacity-[0.03] pointer-events-none">
                <Heart className="w-64 h-64 animate-pulse-soft text-fuchsia-800" />
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-50 to-fuchsia-50 rounded-full text-pink-600 font-bold text-sm mb-8 shadow-sm border border-pink-100">
                <Heart className="w-4 h-4 text-pink-500 animate-bounce-gentle fill-pink-500" />
                <span>Crafted with passion & love</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-[var(--rightsy-text-primary)]">
                Anish Singh
              </h2>
              
              <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 mb-8 max-w-md mx-auto leading-relaxed font-extrabold uppercase tracking-wide">
                Full Stack Developer & Co-Founder
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <span className="badge badge-violet shadow-sm px-4 py-1.5 border border-violet-100">Next.js Wizard</span>
                <span className="badge badge-coral shadow-sm px-4 py-1.5 border border-coral-100/50">Creative Architect</span>
                <span className="badge badge-amber shadow-sm px-4 py-1.5 border border-amber-100">Problem Solver</span>
              </div>

              {/* Decorative Ambient Effects */}
              <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-violet-400/20 rounded-full blur-[40px] animate-float-medium pointer-events-none"></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
