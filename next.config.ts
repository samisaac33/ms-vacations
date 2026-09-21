import type { NextConfig } from "next";

function r2RemotePattern(): { protocol: "https"; hostname: string; pathname: string } | null {
  const raw = process.env.R2_PUBLIC_URL?.trim();
  if (!raw) return null;
  try {
    const { hostname } = new URL(raw);
    return { protocol: "https", hostname, pathname: "/**" };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "srtoqhmjydbpmwhyuurw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "tikrziworaajjatulzsg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(r2RemotePattern() ? [r2RemotePattern()!] : []),
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
    ],
  },
};

export default nextConfig;
