import type { NextConfig } from "next";

// Cache Components stays disabled: `dynamicParams` is not available with it.
// No `output: "export"`: Vercel serves the prerendered app as is.
const nextConfig: NextConfig = {};

export default nextConfig;
