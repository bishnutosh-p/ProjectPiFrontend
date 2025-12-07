import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://<your-repo>-<port>-<username>.github.dev/:path*", // Replace with your Codespace URL
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/signin",
        permanent: true, // Set to true for a 308 permanent redirect
      },
    ];
  },
};

export default nextConfig;
