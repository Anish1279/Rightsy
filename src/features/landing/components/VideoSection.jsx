"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Clock } from "lucide-react";

const VIDEOS = {
  rights: [
    { title: "Right to Education", duration: "5:24", color: "from-violet-500 to-indigo-600" },
    { title: "Right to Play", duration: "4:18", color: "from-teal-500 to-emerald-600" },
  ],
  laws: [
    { title: "Online Privacy Laws", duration: "6:42", color: "from-amber-500 to-orange-600" },
    { title: "Anti-Bullying Laws", duration: "5:15", color: "from-pink-500 to-rose-600" },
  ],
  safety: [
    { title: "Safe Social Media Use", duration: "7:30", color: "from-blue-500 to-cyan-600" },
    { title: "Protecting Personal Info", duration: "4:55", color: "from-violet-500 to-purple-600" },
  ],
};

const TABS = [
  { value: "rights", label: "Children's Rights" },
  { value: "laws", label: "Important Laws" },
  { value: "safety", label: "Online Safety" },
];

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function VideoCard({ title, duration, color, index, inView }) {
  return (
    <div
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${300 + index * 100}ms` }}
    >
      {/* Background gradient */}
      <div className={`aspect-[4/3] bg-gradient-to-br ${color} relative flex flex-col justify-between p-6`}>
        {/* Grain overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1IiBkPSJNMCAwbDMyIDMydS0zMiAweiIvPjwvc3ZnPg==')] opacity-[0.15]" />
        
        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3 text-white/80" />
            <span className="text-white/80 text-xs font-medium">{duration}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Play className="w-3.5 h-3.5 text-white ml-0.5" />
          </div>
        </div>

        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>

        {/* Bottom title */}
        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-extrabold text-white drop-shadow-md">
            {title}
          </h3>
          <span className="text-white/70 text-xs font-medium">Watch & Learn</span>
        </div>
      </div>
    </div>
  );
}

function VideoSection() {
  const [vRef, inView] = useInView(0.1);

  return (
    <section id="videos" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0f0a1f]" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[50%] bg-[radial-gradient(ellipse_at_100%_100%,_rgba(124,58,237,0.15)_0%,_transparent_60%)]" />
      <div className="absolute top-20 left-0 w-[30%] h-[40%] bg-[radial-gradient(ellipse_at_0%_50%,_rgba(20,184,166,0.1)_0%,_transparent_60%)]" />

      <div ref={vRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`text-center max-w-xl mx-auto mb-14 transition-all duration-800 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-flex items-center gap-2 text-teal-400 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <span className="w-8 h-px bg-teal-500" />
            Video Library
            <span className="w-8 h-px bg-teal-500" />
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
            Learn through{" "}
            <span className="bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
              videos
            </span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Short, engaging videos that explain rights and laws in simple, fun ways.
          </p>
        </div>

        <Tabs defaultValue="rights" className="w-full">
          <div className="flex justify-center mb-10 relative z-20">
            <TabsList className="bg-[#0a0618]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-full p-1.5 h-auto flex gap-1">
              {TABS.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/50 hover:text-white/80 rounded-full py-2.5 px-6 text-xs font-semibold transition-all"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="relative z-10">
            {Object.entries(VIDEOS).map(([key, videos]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {videos.map((video, i) => (
                    <VideoCard key={video.title} {...video} index={i} inView={inView} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}

export default memo(VideoSection);
