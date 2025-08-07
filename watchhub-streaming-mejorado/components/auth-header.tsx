"use client"

import Link from "next/link"
import { Play } from "lucide-react"

export function AuthHeader() {
  return (
    <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo igual al del dashboard */}
          <Link href="/" className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">WatchHub</h1>
          </Link>

          {/* Solo el logo, sin opciones de usuario */}
        </div>
      </div>
    </header>
  )
}
