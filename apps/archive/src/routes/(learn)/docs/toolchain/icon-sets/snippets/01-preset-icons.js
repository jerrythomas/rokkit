// rokkit.config.js — the key becomes the UnoCSS class prefix
export default {
  icons: {
    glyph: '@rokkit/icons/glyph.json',  // → i-glyph:icon-name
    logo:  '@rokkit/icons/auth.json',   // → i-logo:google
    app:   '@rokkit/icons/app.json',    // → i-app:alert-bell
    // Any Iconify-compatible JSON works:
    solar: '@iconify-json/solar/icons.json'  // → i-solar:icon-name
  }
}
