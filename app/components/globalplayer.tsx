"use client";

import { usePlayer } from "../contexts/playercontext";
import Image from "next/image";

export default function GlobalPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    togglePlayPause,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    toggleRepeat,
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 px-4 py-3 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Image
            src="/music.gif"
            alt={currentSong.Title}
            width={56}
            height={56}
            unoptimized={true}
            className="w-14 h-14 rounded"
          />
          <div className="min-w-0">
            <h4 className="font-semibold truncate text-sm">{currentSong.Title}</h4>
            <p className="text-xs text-gray-400 truncate">
              {currentSong.Artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* Repeat Button */}
            <button
              onClick={toggleRepeat}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                repeatMode !== "off"
                  ? "text-yellow-400 hover:bg-yellow-400/20"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              title={
                repeatMode === "off"
                  ? "Repeat Off"
                  : repeatMode === "all"
                  ? "Repeat All"
                  : "Repeat One"
              }
            >
              {repeatMode === "one" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
              )}
            </button>

            {/* Previous Button */}
            <button
              onClick={playPrevious}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition"
              title="Previous"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition"
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={playNext}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition"
              title="Next"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Shuffle Button (placeholder for future) */}
            <button
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition opacity-50 cursor-not-allowed"
              title="Shuffle (coming soon)"
              disabled
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FACC15 0%, #FACC15 ${
                  (currentTime / duration) * 100
                }%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`,
              }}
            />
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #FACC15 0%, #FACC15 ${volume}%, #374151 ${volume}%, #374151 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}