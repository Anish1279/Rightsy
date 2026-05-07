"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function Header() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative h-12 w-12 mr-3">
            <Image src="/infi.webp" alt="Kids Learning Platform Logo" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-purple-600">Rightsy</h1>
        </div>

        <nav className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-lg font-medium text-purple-600 hover:text-purple-800 transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/about" className="text-lg font-medium text-purple-600 hover:text-purple-800 transition-colors">
            About
          </Link>
          <Link href="/premium" className="text-lg font-medium text-yellow-500 hover:text-yellow-600 transition-colors">
            Premium
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
