"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePlayer } from "../../contexts/playercontext";

interface Song {
  ID: number;
  SongID: string;
  Title: string;
  Artist: string;
  Filename: string;
  CreatedAt: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const { playSong } = usePlayer();

  const BASE_URL = "https://effective-halibut-9w4xp4qppggf7qv5-8080.app.github.dev/";

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&page=1&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSongs(data.songs || []);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin");
      } else {
        console.error("Search failed");
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold">♪</span>
            </div>
            <span className="text-xl font-semibold">ProjectPi</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Search Your Library</h1>
          <p className="text-gray-400">Find songs by title or artist</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-[#1a1a1a] text-white pl-12 pr-32 py-4 rounded-xl border border-gray-700 focus:border-yellow-400 focus:outline-none text-lg"
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : hasSearched ? (
          songs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-400">Try searching with different keywords</p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Found {songs.length} result{songs.length !== 1 ? "s" : ""}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {songs.map((song) => (
                  <Link href="/dashboard" key={song.SongID}>
                    <div
                      key={song.SongID}
                      className="bg-[#1a1a1a] hover:bg-[#252525] p-4 rounded-lg transition cursor-pointer group"
                      onClick={() => playSong(song)}
                    >
                      <div className="relative mb-4">
                        <Image
                          src="/music.gif"
                          alt={song.Title}
                          width={200}
                          height={200}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button className="absolute bottom-2 right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform hover:scale-105 shadow-lg">
                          <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="font-semibold truncate mb-1">{song.Title}</h3>
                      <p className="text-sm text-gray-400 truncate">{song.Artist || "Unknown Artist"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-gray-400">Type in the search box above to find your songs</p>
          </div>
        )}
      </main>
    </div>
  );
}