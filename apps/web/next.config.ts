import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${target}/api/v1/:path*`,
      },
    ];
  },
  ...(process.env.FIGMA
    ? {
        allowedDevOrigins: [
          process.env.FIGMA_PUBLIC_URL
            ? new URL(process.env.FIGMA_PUBLIC_URL).hostname
            : "app-x3tgasnnmdx4dprlspr7xq6linnihm37hnt4z7gw4ktl7dshnjra.makeproxy-c.figma.site",
        ],
      }
    : {}),
};

export default nextConfig;