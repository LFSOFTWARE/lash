// Site estático (GitHub Pages). No CI, PAGES_BASE_PATH=/lash.
const basePath = process.env.PAGES_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  // Só no build local com `next dev` aberto: NEXT_DIST_DIR=.next-build (o site sai nessa pasta).
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
