// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "./contexts/playercontext";
import { HealthProvider } from "./contexts/healthcontext";
import GlobalPlayer from "./components/globalplayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ProjectPi",
  description: "Your personal music streaming platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HealthProvider>
          <PlayerProvider>
            {children}
            <GlobalPlayer />
          </PlayerProvider>
        </HealthProvider>
      </body>
    </html>
  );
}