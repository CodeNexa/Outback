/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Points the client at the FastAPI backend. Set this in your hosting
  // provider's environment variables (Vercel/Netlify project settings).
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
  },
};

export default nextConfig;
