"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AboutProject from "../components/aboutproject";
import Footer from "../components/footer";
import { useHealth } from "../contexts/healthcontext";

export default function OfflinePage() {
  const [retryCount, setRetryCount] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const { isHealthy, isChecking, checkHealth } = useHealth();

  const handleRetry = async () => {
    if (cooldown > 0) return;
    
    await checkHealth();
    setRetryCount((prev) => prev + 1);
    setCooldown(30);
    
    // If healthy after check, redirect
    if (isHealthy) {
      router.push('/signin');
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Auto-retry every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkHealth();
      setRetryCount((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  // Redirect if backend comes back online
  useEffect(() => {
    if (isHealthy) {
      router.push('/signin');
    }
  }, [isHealthy, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-4xl w-full flex-1 flex flex-col justify-center">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">♪</span>
            </div>
            <span className="text-2xl font-semibold text-white">ProjectPi</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 md:p-12 shadow-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              SpotiPi(ProjectPi) is Currently Offline
            </h1>
            <p className="text-lg text-gray-300 mb-2">
              The backend server is not responding.
            </p>
            <p className="text-sm text-gray-400">
              Please make sure your Raspberry Pi is powered on and connected to the network.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                disabled={isChecking || cooldown > 0}
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600 text-black font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isChecking ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Checking...
                  </span>
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s`
                ) : (
                  "Retry Connection"
                )}
              </button>

              <button
                onClick={() => setShowAbout(!showAbout)}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showAbout ? "Hide" : "About Project"}
              </button>
            </div>

            <p className="text-sm text-gray-400">
              Auto-retrying (Every 60s)... (Attempts: {retryCount})
            </p>
          </div>

          {/* About Section */}
          {showAbout && (
            <div className="mt-8 pt-8 border-t border-gray-800">
              <AboutProject />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}