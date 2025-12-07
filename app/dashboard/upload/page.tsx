"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const BASE_URL = "http://localhost:8080";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        setMessage("File size exceeds 50MB limit");
        return;
      }

      // Validate file type
      const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.mp3')) {
        setMessage("Invalid file type. Please upload MP3 or WAV files");
        return;
      }

      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("artist", formData.artist);
      formDataObj.append("file", file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setMessage("Song uploaded successfully!");
          setUploadProgress(100);
          // Reset form
          setFormData({ title: "", artist: "" });
          setFile(null);
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else if (xhr.status === 401) {
          localStorage.removeItem("token");
          router.push("/signin");
        } else {
          const data = JSON.parse(xhr.responseText);
          setMessage(data.error || "Upload failed");
        }
        setIsLoading(false);
      });

      xhr.addEventListener("error", () => {
        setMessage("Failed to connect to server");
        setIsLoading(false);
      });

      xhr.open("POST", `${BASE_URL}/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formDataObj);

    } catch (error) {
      setMessage("Failed to connect to server" + {error});
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upload Your Music</h1>
          <p className="text-gray-400">Share your favorite tracks and build your personal library</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Audio File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  file
                    ? "border-yellow-400 bg-yellow-400/5"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  {file ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm text-yellow-400 hover:text-yellow-500"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-400">
                          MP3, WAV (max 50MB)
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter song title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none transition"
                required
              />
            </div>

            {/* Artist Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name
              </label>
              <input
                type="text"
                name="artist"
                placeholder="Enter artist name"
                value={formData.artist}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none transition"
              />
            </div>

            {/* Upload Progress */}
            {isLoading && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="text-yellow-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Uploading..." : "Upload Song"}
            </button>

            {/* Message */}
            {message && (
              <p className={`text-center text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}

            {/* Info */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upload Guidelines
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Supported formats: MP3, WAV</li>
                <li>• Maximum file size: 50MB</li>
                <li>• Please ensure you have rights to upload this content</li>
              </ul>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}