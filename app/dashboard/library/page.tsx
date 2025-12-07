"use client";

import { useState, useEffect, useCallback } from "react";
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

interface SongsResponse {
  songs: Song[];
  page: number;
  limit: number;
}

interface AddToPlaylistModalProps {
  isOpen: boolean;
  songId: string;
  onClose: () => void;
}

interface Playlist {
  ID: number;
  PlaylistID: string;
  Name: string;
  Description: string;
}

function AddToPlaylistModal({ isOpen, songId, onClose }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/playlists`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists || []);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`${BASE_URL}/playlist/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ song_id: songId }),
      });

      if (response.ok) {
        alert("Song added to playlist!");
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add song");
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
      alert("Failed to add song to playlist");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No playlists found</p>
            <Link href="/dashboard/playlists">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition">
                Create Playlist
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {playlists.map((playlist) => (
              <button
                key={playlist.PlaylistID}
                onClick={() => handleAddToPlaylist(playlist.PlaylistID)}
                disabled={isLoading}
                className="w-full text-left p-3 bg-[#0a0a0a] hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
              >
                <h4 className="font-semibold text-white">{playlist.Name}</h4>
                {playlist.Description && (
                  <p className="text-sm text-gray-400 truncate">{playlist.Description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "title" | "artist">("date");
  const [addToPlaylistModal, setAddToPlaylistModal] = useState<{ isOpen: boolean; songId: string }>({
    isOpen: false,
    songId: "",
  });
  const { playSong } = usePlayer();
  const router = useRouter();

  const ITEMS_PER_PAGE = 50;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const fetchSongs = useCallback(
    async (page: number) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/songs?page=${page}&limit=${ITEMS_PER_PAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: SongsResponse = await response.json();
          if (page === 1) {
            setSongs(data.songs || []);
          } else {
            setSongs((prev) => [...prev, ...(data.songs || [])]);
          }
          setHasMore((data.songs || []).length === ITEMS_PER_PAGE);
          setCurrentPage(page);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchSongs(1);
  }, [fetchSongs, router]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchSongs(currentPage + 1);
    }
  };

  const handlePlaySong = (song: Song) => {
    // Play this song with all filtered songs as queue
    playSong(song, filteredAndSortedSongs);
  };

  const handlePlayAll = () => {
    if (filteredAndSortedSongs.length > 0) {
      playSong(filteredAndSortedSongs[0], filteredAndSortedSongs);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.Artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAndSortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortBy === "title") {
      return a.Title.localeCompare(b.Title);
    } else if (sortBy === "artist") {
      return (a.Artist || "").localeCompare(b.Artist || "");
    } else {
      // Sort by date (newest first)
      return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={addToPlaylistModal.isOpen}
        songId={addToPlaylistModal.songId}
        onClose={() => setAddToPlaylistModal({ isOpen: false, songId: "" })}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f0f0f] border-r border-gray-800 p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold">♪</span>
          </div>
          <span className="text-xl font-semibold">ProjectPi</span>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>

          <Link href="/dashboard/search" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Link>

          <Link href="/dashboard/library" className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Your Library
          </Link>

          <Link href="/dashboard/playlists" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Playlists
          </Link>

          <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Song
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-32">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Your Library</h1>
              <div className="flex items-center gap-3">
                {filteredAndSortedSongs.length > 0 && (
                  <button
                    onClick={handlePlayAll}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play All
                  </button>
                )}
                <Link href="/dashboard/upload">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition">
                    Upload Song
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search in library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "title" | "artist")}
                className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
              >
                <option value="date">Recently Added</option>
                <option value="title">Title (A-Z)</option>
                <option value="artist">Artist (A-Z)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : filteredAndSortedSongs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No songs found" : "Your library is empty"}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? "Try a different search" : "Upload your first song to get started"}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/upload">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition">
                    Upload Your First Song
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-400">
                {filteredAndSortedSongs.length} {filteredAndSortedSongs.length === 1 ? "song" : "songs"}
              </div>

              <div className="space-y-1">
                {filteredAndSortedSongs.map((song, index) => (
                  <div
                    key={song.SongID}
                    className="flex items-center gap-4 p-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition cursor-pointer group"
                    onClick={() => handlePlaySong(song)}
                  >
                    <span className="w-8 text-center text-gray-400 text-sm">{index + 1}</span>
                    <Image
                      src="/music.gif"
                      alt={song.Title}
                      width={48}
                      height={48}
                      unoptimized={true}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{song.Title}</h4>
                      <p className="text-sm text-gray-400 truncate">{song.Artist || "Unknown Artist"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddToPlaylistModal({ isOpen: true, songId: song.SongID });
                        }}
                        className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="Add to playlist"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && !searchQuery && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 px-4 py-2 flex justify-around z-40">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/dashboard/search" className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">Search</span>
        </Link>
        <Link href="/dashboard/upload" className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-xs">Upload</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs">Logout</span>
        </button>
      </nav>
    </div>
  );
}