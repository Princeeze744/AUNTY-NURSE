import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets your phone on the same Wi-Fi load the dev site properly.
  allowedDevOrigins: ["192.168.1.134"],
};

export default nextConfig;
