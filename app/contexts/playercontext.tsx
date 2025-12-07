"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface Song {
  ID: number;
  SongID: string;
  Title: string;
  Artist: string;
  Filename: string;
  CreatedAt: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
  repeatMode: "off" | "one" | "all";
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  stopAndClear: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
  const audioRef = useRef<HTMLAudioElement>(null);
  const isLoadingRef = useRef(false);

  const BASE_URL = "https://effective-halibut-9w4xp4qppggf7qv5-8080.app.github.dev/";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === "one") {
        // Repeat current song
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === "all" || currentIndex < queue.length - 1) {
        // Play next song
        playNext();
      } else {
        // Stop at the end
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatMode, currentIndex, queue.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !isLoadingRef.current) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else if (!isPlaying && !isLoadingRef.current) {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const loadAndPlaySong = (song: Song) => {
    const token = localStorage.getItem("token");
    if (audioRef.current && token) {
      isLoadingRef.current = true;
      const streamUrl = `${BASE_URL}/stream/${song.SongID}`;

      fetch(streamUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          if (audioRef.current) {
            audioRef.current.src = url;
            setCurrentSong(song);

            // Wait for audio to be ready before playing
            audioRef.current.onloadeddata = () => {
              isLoadingRef.current = false;
              setIsPlaying(true);
              audioRef.current?.play().catch((error) => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
              });
            };
          }
        })
        .catch((error) => {
          console.error("Error loading audio:", error);
          isLoadingRef.current = false;
          setIsPlaying(false);
        });
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      // New queue provided (e.g., from playlist)
      setQueue(newQueue);
      const index = newQueue.findIndex((s) => s.SongID === song.SongID);
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      // Single song play - create queue with just this song
      setQueue([song]);
      setCurrentIndex(0);
    }
    loadAndPlaySong(song);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
  };

  const stopAndClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.onloadeddata = null;
    }
    isLoadingRef.current = false;
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setQueue([]);
    setCurrentIndex(0);
  };

  const playNext = () => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        return; // End of queue
      }
    }

    setCurrentIndex(nextIndex);
    loadAndPlaySong(queue[nextIndex]);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;

    // If more than 3 seconds into the song, restart it
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === "all") {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0; // Stay at first song
      }
    }

    setCurrentIndex(prevIndex);
    loadAndPlaySong(queue[prevIndex]);
  };

  const toggleRepeat = () => {
    setRepeatMode((current) => {
      if (current === "off") return "all";
      if (current === "all") return "one";
      return "off";
    });
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        currentIndex,
        repeatMode,
        playSong,
        togglePlayPause,
        seekTo,
        setVolume,
        stopAndClear,
        playNext,
        playPrevious,
        toggleRepeat,
      }}
    >
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}