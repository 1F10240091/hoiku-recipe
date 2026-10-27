if (process.env.VERCEL === "1") {
  const origin = process.env.NEXT_PUBLIC_API_URL;
  if (!origin || !/^https:\/\/[^/]+\/?$/.test(origin)) {
    throw new Error("Set NEXT_PUBLIC_API_URL to the public HTTPS backend origin before building on Vercel.");
  }
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    throw new Error("Disable NEXT_PUBLIC_DEMO_MODE for Vercel deployments.");
  }
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
