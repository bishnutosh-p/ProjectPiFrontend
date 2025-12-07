import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "./contexts/playercontext";
import GlobalPlayer from "./components/globalplayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProjectPi - Your Personal Music Library",
  description: "Stream your music anywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PlayerProvider>
          {children}
          <GlobalPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
