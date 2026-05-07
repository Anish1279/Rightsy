"use client";

import { useId } from "react";

interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ProgressRing({
  percent,
  size = 88,
  stroke = 8,
  label,
}: ProgressRingProps) {
  const gradientId = useId();
  const clamped = Math.max(0, Math.min(1, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `Watch progress ${Math.round(clamped * 100)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
        />
      </svg>
      <span className="pointer-events-none absolute text-base font-black text-white drop-shadow">
        {Math.round(clamped * 100)}%
      </span>
    </div>
  );
}
