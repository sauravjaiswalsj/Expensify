import type { NextConfig } from "next";

// Guard Next SSR against broken Node webstorage setups (invalid --localstorage-file).
if (typeof globalThis.window === "undefined") {
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  if (!localStorageDescriptor || localStorageDescriptor.configurable) {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: {
        getItem() {
          return null;
        },
        setItem() { },
        removeItem() { },
      },
    });
  }
}

const nextConfig: NextConfig = {
  async rewrites() {
    const apiTarget =
      process.env.API_SERVER_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
