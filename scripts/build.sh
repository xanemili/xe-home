#!/usr/bin/env bash
set -e

echo "Building xe-home..."

# Clean and recreate public directory
rm -rf public
mkdir -p public

# Copy static assets
cp index.html resume.html favicon.ico robots.txt sitemap.xml public/
cp src/favicon.svg src/apple-touch-icon.png src/favicon-96x96.png \
   src/site.webmanifest src/web-app-manifest-192x192.png \
   src/web-app-manifest-512x512.png public/

# Copy resume markdown source
cp resume.md public/resume.md

# Generate resume PDF from resume.html
echo "Generating resume PDF..."
bun run src/resume-converter.ts resume.html public/
mv public/Alexander_Emili_Resume.pdf public/resume.pdf
rm -f public/Alexander_Emili_Resume.md

echo "Build complete. Output in public/"
