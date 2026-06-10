/** @type {import('next').NextConfig} */

const { copyFileSync, existsSync } = require("node:fs")
const { join } = require("node:path")

/**
 * Gitignored `src/mocks/custom-handlers/index.ts` is optional; Turbopack still needs the file on disk.
 * Runs whenever Next loads this config (`next dev`, `next build`, etc.).
 */
function ensureMswCustomHandlers() {
  const dir = join(__dirname, "src/mocks/custom-handlers")
  const target = join(dir, "index.ts")
  const example = join(dir, "index.example.ts")
  if (!existsSync(target)) {
    copyFileSync(example, target)
    console.info(
      "[MSW] Created src/mocks/custom-handlers/index.ts from index.example.ts (gitignored; created when Next loads config if missing).",
    )
  }
}

ensureMswCustomHandlers()

// Global self polyfill for environments where it's not defined
if (typeof self === "undefined") {
  global.self = global
}

const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "@vechain/vebetterdao-contracts",
      "@vechain/dapp-kit-react",
      "@vechain/vechain-kit",
      // "@chakra-ui/react", // Adding this breaks the vechain-kit building process
      "react-icons",
      "react-icons/bs",
      "react-icons/fa",
      "react-icons/fa6",
      "react-icons/md",
      "react-icons/io",
      "react-icons/io5",
      "iconoir-react",
      "react-hook-form",
    ],
  },
  turbopack: {
    root: join(__dirname, "../.."),
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  compress: true,
  transpilePackages: ["express", "ts-node", "@vechain/vebetterdao-contracts"],
  // Disable type checking and linting during build to save memory
  // These checks are run in separate CI jobs
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            typescript: true,
            ext: "tsx",
          },
        },
      ],
    })
    return config
  },
  rewrites: () => [{ source: "/allocations", destination: "/allocations/vote" }],
}

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

module.exports = withBundleAnalyzer(nextConfig)
