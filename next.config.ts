import type { NextConfig } from "next";

const supabaseProjectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Prisma ships native query-engine binaries; keep it (and the generated
  // client) out of the server bundle so Next.js loads it from node_modules
  // at runtime instead of trying to trace/bundle it.
  serverExternalPackages: ["@prisma/client"],

  images: {
    qualities: [75, 85],
    // Supabase Storage already serves images over a global CDN — running them
    // through Next.js image optimization just adds a redundant server-side
    // fetch that times out on slow connections. Serve the originals directly.
    unoptimized: true,
    remotePatterns: [
      // Product images served from Supabase Storage buckets.
      ...(supabaseProjectRef
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseProjectRef,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },

  // TLS termination itself happens at the hosting platform (Vercel and
  // virtually every modern host auto-provision HTTPS certificates — this
  // app has no plaintext-HTTP code path for anything sensitive regardless).
  // HSTS is the one piece of transport security that genuinely belongs
  // here: once a browser has loaded the site once over HTTPS, this header
  // tells it to refuse plain HTTP for this domain for the next year,
  // closing the window for a downgrade/strip attack on a future visit.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
