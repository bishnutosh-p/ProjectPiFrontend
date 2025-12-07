"use client";

import { useEffect, useState } from "react";

interface Song {
  ID: number;
  Title: string;
  Artist: string;
}

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]); // Explicitly type the state

  useEffect(() => {
    async function fetchSongs() {
      const response = await fetch("http://localhost:8080/songs");
      const data = await response.json();
      setSongs(data.songs || []);
    }
    fetchSongs();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Your Songs</h1>
        <ul>
          {songs.map((song) => (
            <li key={song.ID} className="mb-2">
              <strong>{song.Title}</strong> by {song.Artist}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}