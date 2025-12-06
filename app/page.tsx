"use client";

import { useEffect, useState } from "react";
import { pingBackend } from "./lib/api";

export default function Home() {
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const data = await pingBackend();
      setBackendMessage(data.message);
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Hello, World!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Backend says: <span className="font-semibold">{backendMessage}</span>
        </p>
      </div>
    </div>
  );
}