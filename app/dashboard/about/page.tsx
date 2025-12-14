"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AboutProject from "../../components/aboutproject";
import Footer from "../../components/footer";

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    }
  }, [router]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold">♪</span>
              </div>
              <span className="text-xl font-semibold text-white">ProjectPi</span>
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors px-3 py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/library"
                className="text-gray-300 hover:text-white transition-colors px-3 py-2"
              >
                Library
              </Link>
              <Link
                href="/dashboard/playlists"
                className="text-gray-300 hover:text-white transition-colors px-3 py-2"
              >
                Playlists
              </Link>
              <Link
                href="/dashboard/about"
                className="text-yellow-400 font-semibold transition-colors px-3 py-2"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 md:p-12">
          <AboutProject />
        </div>
      </main>

      <Footer />
    </div>
  );
}