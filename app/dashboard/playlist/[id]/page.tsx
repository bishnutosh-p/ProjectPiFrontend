"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { usePlayer } from "../../../contexts/playercontext";

interface Song {
  ID: number;
  SongID: string;
  Title: string;
  Artist: string;
  Filename: string;
  CreatedAt: string;
}

interface Playlist {
  ID: number;
  PlaylistID: string;
  Name: string;
  Description: string;
  CreatedAt: string;
}

interface AddSongModalProps {
  isOpen: boolean;
  onAdd: (songId: string) => void;
  onCancel: () => void;
  availableSongs: Song[];
}

function AddSongModal({ isOpen, onAdd, onCancel, availableSongs }: AddSongModalProps) {
  const [selectedSong, setSelectedSong] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.Artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedSong) {
      onAdd(selectedSong);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Add Song</h3>
            <p className="text-sm text-gray-400">Select a song to add</p>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-2">
          {filteredSongs.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No songs available</p>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.SongID}
                onClick={() => setSelectedSong(song.SongID)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedSong === song.SongID
                    ? "bg-yellow-400/20 border border-yellow-400"
                    : "bg-[#0a0a0a] hover:bg-gray-800 border border-transparent"
                }`}
              >
                <h4 className="font-semibold text-white">{song.Title}</h4>
                <p className="text-sm text-gray-400">{song.Artist || "Unknown Artist"}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedSong}
            className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Playlist
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const playlistId = params.id;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [addSongModal, setAddSongModal] = useState(false);
  const { playSong } = usePlayer();
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  // Move fetch functions inside useEffect to avoid cascading renders
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const response = await fetch(`${BASE_URL}/playlist/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlaylist(data.playlist);
          setSongs(data.songs || []);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    const fetchAllSongs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${BASE_URL}/songs?page=1&limit=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAllSongs(data.songs || []);
        }
      } catch (error) {
        console.error("Error fetching all songs:", error);
      }
    };

    fetchPlaylistDetails();
    fetchAllSongs();
  }, [playlistId, router, BASE_URL]);

  const handleAddSong = async (songId: string) => {
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
        // Refresh playlist to get updated songs
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${BASE_URL}/playlist/${playlistId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setPlaylist(data.playlist);
            setSongs(data.songs || []);
          }
        }
        setAddSongModal(false);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add song to playlist");
      }
    } catch (error) {
      console.error("Error adding song:", error);
      alert("Failed to add song to playlist");
    }
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Remove this song from the playlist?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await fetch(`${BASE_URL}/playlist/${playlistId}/songs/${songId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSongs((prev) => prev.filter((s) => s.SongID !== songId));
      } else {
        alert("Failed to remove song");
      }
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove song");
    }
  };

  const handlePlaySong = (song: Song) => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const availableSongs = allSongs.filter(
    (song) => !songs.some((s) => s.SongID === song.SongID)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Add Song Modal */}
      <AddSongModal
        isOpen={addSongModal}
        onAdd={handleAddSong}
        onCancel={() => setAddSongModal(false)}
        availableSongs={availableSongs}
      />

      {/* Playlist Header */}
      <div className="bg-linear-to-b from-yellow-400/20 to-transparent px-6 py-12">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 bg-linear-to-br from-yellow-400/30 to-purple-500/30 rounded-lg flex items-center justify-center shadow-2xl">
            <svg className="w-24 h-24 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase text-gray-400 mb-2">Playlist</p>
            <h1 className="text-5xl font-bold mb-4">{playlist?.Name}</h1>
            {playlist?.Description && (
              <p className="text-gray-300 mb-4">{playlist.Description}</p>
            )}
            <p className="text-sm text-gray-400">{songs.length} songs</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 flex items-center gap-4">
        {songs.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition shadow-lg"
          >
            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => setAddSongModal(true)}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Songs
        </button>
        <button
          onClick={() => router.push("/dashboard/playlists")}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
        >
          Back to Playlists
        </button>
      </div>

      {/* Songs List */}
      <div className="px-6 pb-8">
        {songs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No songs in this playlist yet.</div>
        ) : (
          songs.map((song, index) => (
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
              <button
                onClick={(e) => handleRemoveSong(song.SongID, e)}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Remove from playlist"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}