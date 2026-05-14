#!/usr/bin/env bash
set -e

echo "Building xe-home..."

# Clean and recreate public directory
rm -rf public
mkdir -p public

# Copy static assets
cp index.html favicon.ico robots.txt sitemap.xml public/
cp src/favicon.svg src/apple-touch-icon.png src/favicon-96x96.png \
   src/site.webmanifest src/web-app-manifest-192x192.png \
   src/web-app-manifest-512x512.png public/

echo "Build complete. Output in public/"
