import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy WorldTimeAPI to avoid CORS issues
      {
        source: "/api/proxy/time",
        destination: "http://worldtimeapi.org/api/timezone/Asia/Kolkata",
      },
    ];
  },
};

export default nextConfig;
