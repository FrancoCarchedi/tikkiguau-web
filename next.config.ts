import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite usar la app vía ngrok en `next dev` (JS/HMR cross-origin).
  // Sin esto, /disenar carga HTML pero los clicks del diseñador no responden.
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
};

export default nextConfig;
