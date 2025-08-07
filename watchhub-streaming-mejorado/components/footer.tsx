import Link from "next/link"
import { Play } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8 px-4">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center space-x-2">
          <Play className="h-6 w-6 text-red-500" />
          <span className="text-xl font-bold text-white">WatchHub</span>
        </div>
      </div>
    </footer>
  )
}
