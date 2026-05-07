"use client";

import { motion } from "motion/react";
import { Bot, Sparkles, ArrowLeft, Send, Stars } from "lucide-react";
import Link from "next/link";

export default function ChatbotComingSoon() {
  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Decorative background elements floating in the dark/brand background */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-white/10 rounded-full blur-[80px] animate-float-slow"></div>
      <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px] animate-float-medium"></div>
      <div className="absolute top-[60%] left-[5%] w-48 h-48 bg-teal-400/20 rounded-full blur-[60px] animate-float-fast"></div>
      
      {/* Floating Sparkles in Background */}
      <motion.div 
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }} 
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-[20%] right-[25%] text-amber-200/50"
      >
        <Stars className="w-8 h-8" />
      </motion.div>
      <motion.div 
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }} 
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[30%] left-[20%] text-fuchsia-200/40"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>

      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_40px_rgba(124,58,237,0.3)] relative overflow-hidden border-2 border-white/50">
          
          {/* Subtle top glare/gradient over the card */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-violet-100/50 to-transparent pointer-events-none"></div>

          {/* 3D-like Icon Display */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-28 h-28 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl relative"
          >
            {/* Inner glow/border */}
            <div className="absolute inset-[2px] rounded-[1.35rem] border border-white/20 bg-gradient-to-br from-violet-400/20 to-transparent"></div>
            <Bot className="w-14 h-14 text-white animate-bounce-gentle relative z-10" />
            
            {/* Online indicator dot */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-sm z-20"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full text-violet-700 font-bold text-sm mb-6 shadow-sm border border-violet-100">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Under Construction</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--rightsy-text-primary)] mb-5 tracking-tight leading-tight">
              Friendly AI Buddy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">
                Coming Soon
              </span>
            </h1>
            
            <p className="text-[1.05rem] text-[var(--rightsy-text-secondary)] mb-10 max-w-lg mx-auto leading-relaxed">
              We&apos;re teaching our super-smart robot everything about rights, laws, and fun facts! Soon, you&apos;ll be able to ask anything and learn in a completely magically new way. 🚀
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-violet-700 font-bold rounded-xl border-2 border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-violet-100 shadow-sm hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Games
            </Link>
            
            <button 
              onClick={() => alert("You will be notified when the Chatbot launches!")}
              className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-violet-500/40 hover:-translate-y-1"
            >
              <Send className="w-5 h-5" />
              Notify Me
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
