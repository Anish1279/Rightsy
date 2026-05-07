"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/quiz", label: "Assessments" },
  { href: "/dashboard/about", label: "About" },
];

/**
 * Header — Dashboard navigation bar.
 *
 * - Glassmorphic background on scroll
 * - Mobile hamburger menu
 * - Active link highlighting
 * - Brand mark
 */
export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }, [router]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((v) => !v);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-b border-violet-100/50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9">
              <Image
                src="/infi.webp"
                alt="Rightsy Logo"
                fill
                className="object-contain"
                sizes="36px"
              />
            </div>
            <span className="text-xl font-extrabold text-gradient-brand">Rightsy</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : "text-[var(--rightsy-text-secondary)] hover:text-violet-700 hover:bg-violet-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            <div className="ml-3 pl-3 border-l border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-violet-50 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-violet-100/50 mt-1 pt-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : "text-[var(--rightsy-text-secondary)] hover:text-violet-700 hover:bg-violet-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
