"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePlayer } from "../contexts/playercontext";

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

interface DeleteModalProps {
  isOpen: boolean;
  songTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface EditModalProps {
  isOpen: boolean;
  song: Song | null;
  onSave: (songTitle: string, artistName: string) => void;
  onCancel: () => void;
}

function DeleteConfirmationModal({ isOpen, songTitle, onConfirm, onCancel }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Delete Song</h3>
            <p className="text-sm text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-yellow-400">{songTitle}</span>? 
          This will permanently remove the song from your library.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditSongModal({ isOpen, song, onSave, onCancel }: EditModalProps) {
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [errors, setErrors] = useState({ title: "", artist: "" });

  // Reset form when modal opens with new song
  useEffect(() => {
    if (isOpen && song) {
      setSongTitle(song.Title || "");
      setArtistName(song.Artist || "");
      setErrors({ title: "", artist: "" });
    }
  }, [isOpen, song]); // Added isOpen to dependencies

  if (!isOpen || !song) return null;

  const handleSave = () => {
    // Validation
    const newErrors = { title: "", artist: "" };
    let isValid = true;

    if (!songTitle.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!artistName.trim()) {
      newErrors.artist = "Artist is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onSave(songTitle.trim(), artistName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Edit Song</h3>
            <p className="text-sm text-gray-400">Update song information</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="song-title" className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="song-title"
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
                errors.title ? "border-red-500" : "border-gray-700"
              } focus:border-yellow-400 focus:outline-none transition`}
              placeholder="Enter song title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="artist-name" className="block text-sm font-medium text-gray-300 mb-2">
              Artist <span className="text-red-500">*</span>
            </label>
            <input
              id="artist-name"
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
                errors.artist ? "border-red-500" : "border-gray-700"
              } focus:border-yellow-400 focus:outline-none transition`}
              placeholder="Enter artist name"
            />
            {errors.artist && (
              <p className="text-red-500 text-sm mt-1">{errors.artist}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; songId: string; songTitle: string }>({
    isOpen: false,
    songId: "",
    songTitle: "",
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; song: Song | null }>({
    isOpen: false,
    song: null,
  });
  const { playSong, currentSong, stopAndClear } = usePlayer();
  const router = useRouter();

  const ITEMS_PER_PAGE = 20;
  const BASE_URL = "http://localhost:8080";

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
          // Token expired or invalid
          localStorage.removeItem("token");
          router.push("/signin");
        } else {
          console.error("Failed to fetch songs");
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
    playSong(song);
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.Artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  const openDeleteModal = (songId: string, songTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, songId, songTitle });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, songId: "", songTitle: "" });
  };

  const confirmDelete = async () => {
    const { songId } = deleteModal;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`${BASE_URL}/song/${songId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // If the deleted song is currently playing, stop it
        if (currentSong?.SongID === songId) {
          stopAndClear();
        }
        // Remove song from state
        setSongs((prev) => prev.filter((s) => s.SongID !== songId));
        closeDeleteModal();
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin");
      } else {
        alert("Failed to delete song");
        closeDeleteModal();
      }
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Failed to delete song");
      closeDeleteModal();
    }
  };

  const openEditModal = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditModal({ isOpen: true, song });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, song: null });
  };

  const handleEditSave = async (songTitle: string, artistName: string) => {
    if (!editModal.song) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`${BASE_URL}/song/${editModal.song.SongID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: songTitle, artist: artistName }),
      });

      if (response.ok) {
        // Update song in state
        setSongs((prev) =>
          prev.map((s) =>
            s.SongID === editModal.song?.SongID
              ? { ...s, Title: songTitle, Artist: artistName }
              : s
          )
        );
        closeEditModal();
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin");
      } else {
        alert("Failed to update song");
      }
    } catch (error) {
      console.error("Error updating song:", error);
      alert("Failed to update song");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        songTitle={deleteModal.songTitle}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />

      {/* Edit Song Modal */}
      <EditSongModal
        isOpen={editModal.isOpen}
        song={editModal.song}
        onSave={handleEditSave}
        onCancel={closeEditModal}
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
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>

          <Link
            href="/dashboard/search"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Link>

          <Link
            href="/dashboard/library"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Your Library
          </Link>

          <Link
            href="/dashboard/playlists"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Playlists
          </Link>

          <Link
            href="/dashboard/upload"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/upload" className="hidden sm:block">
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition">
                  Upload Song
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <>
              {/* Your Songs */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Songs</h2>
                  {songs.length > 0 && (
                    <span className="text-gray-400 text-sm">{songs.length} songs</span>
                  )}
                </div>

                {filteredSongs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No songs found</h3>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {filteredSongs.map((song) => (
                        <div
                          key={song.SongID}
                          className="bg-[#1a1a1a] hover:bg-[#252525] p-4 rounded-lg transition cursor-pointer group relative"
                          onClick={() => handlePlaySong(song)}
                        >
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex gap-2 z-10">
                            <button
                              onClick={(e) => openEditModal(song, e)}
                              className="w-8 h-8 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              title="Edit song"
                            >
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => openDeleteModal(song.SongID, song.Title, e)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              title="Delete song"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

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
                      ))}
                    </div>

                    {/* Load More Button */}
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
              </section>

              {/* Recently Added */}
              {songs.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6">Recently Added</h2>
                  <div className="space-y-2">
                    {songs.slice(0, 5).map((song) => (
                      <div
                        key={song.SongID}
                        className="flex items-center gap-4 p-3 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition cursor-pointer group"
                        onClick={() => handlePlaySong(song)}
                      >
                        <Image
                          src="/music.gif"
                          alt={song.Title}
                          width={56}
                          height={56}
                          unoptimized={true}
                          className="w-14 h-14 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{song.Title}</h4>
                          <p className="text-sm text-gray-400 truncate">{song.Artist || "Unknown Artist"}</p>
                        </div>
                        <button 
                          onClick={(e) => openEditModal(song, e)}
                          className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition mr-2"
                          title="Edit song"
                        >
                          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => openDeleteModal(song.SongID, song.Title, e)}
                          className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition mr-2"
                          title="Delete song"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 px-4 py-2 flex justify-around z-40">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-yellow-400">
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