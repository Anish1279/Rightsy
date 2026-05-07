"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminLoginRequest } from "@/features/admin/services/admin-api-client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      await adminLoginRequest({ password })
      router.push("/govtadmin/database")
      router.refresh()
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full bg-white border-b border-purple-200 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <Image src="/infi.webp" width={40} height={40} alt="Website Logo" className="mr-2" />
          <h1 className="text-purple-700 font-semibold text-lg md:text-xl">Rightsy</h1>
        </div>
        <div className="text-purple-700 font-semibold text-lg md:text-xl">Official Portal</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <Image
            src="/govt.png"
            width={80}
            height={80}
            alt="Ministry of Law and Justice Logo"
            className="mx-auto mb-4"
          />
          <h1 className="text-purple-900 text-xl md:text-2xl font-bold mb-1">Ministry of Law and Justice</h1>
          <h2 className="text-purple-800 text-lg md:text-xl font-medium">विधि और न्याय मंत्रालय</h2>
        </div>

        <Card className="w-full max-w-md border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-center text-xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-700 hover:bg-purple-800 text-white"
              >
                {loading ? "Signing in..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-purple-50 text-center p-4 text-sm text-purple-700">
        © {new Date().getFullYear()} Ministry of Law and Justice. All Rights Reserved.
      </footer>
    </div>
  )
}
