<article data-article-root>
  <p>
    Rokkit separates layout CSS (structural) from theme CSS (visual). Components ship unstyled
    with <code>data-*</code> attribute hooks. Themes provide the visual layer — colors, radii,
    shadows — without touching structure.
  </p>
  <h2>Activating a theme</h2>
  <p>Add a data attribute to <code>&lt;html&gt;</code> and import the theme CSS:</p>
  <pre><code>&lt;html data-palette="rokkit" data-mode="dark"&gt;</code></pre>
  <p>
    See <a href="/docs/theming/color-system">Color System</a> and
    <a href="/docs/theming/styling">Styling</a> for full reference.
  </p>
</article>
