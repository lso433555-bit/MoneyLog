import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    // Supabase API 요청은 항상 최신 데이터를 써야 하는 가계부 데이터라 캐시하지 않는다.
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.hostname.endsWith(".supabase.co"),
        handler: "NetworkOnly",
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
