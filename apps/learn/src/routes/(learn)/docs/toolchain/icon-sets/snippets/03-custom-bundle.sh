# Bundle SVG folders into Iconify JSON (one file per subfolder)
npx @rokkit/cli@latest bundle --input ./src/icons --output ./dist

# Full Iconify package structure (for publishing as a package)
npx @rokkit/cli@latest build --input ./src/icons --output ./dist
