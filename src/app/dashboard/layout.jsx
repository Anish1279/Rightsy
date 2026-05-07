import React from "react";
import Header from "@/features/dashboard/components/Header";

/**
 * DashboardLayout — Wraps all /dashboard/* routes.
 *
 * Provides the sticky header and a consistent content
 * container with proper max-width and padding.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}