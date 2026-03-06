<article data-article-root>
  <p>
    Rokkit's interactivity is built on two composable primitives: <strong>controllers</strong>
    (pure state machines with no DOM dependency) and the <strong>navigator</strong> Svelte action
    (which binds a controller to the DOM, adds keyboard handlers, and manages ARIA attributes).
  </p>
  <h2>Why this matters</h2>
  <p>
    The separation means you can use a controller in tests without a browser, and swap the
    visual rendering without touching the interaction logic. It also means you can build your
    own accessible components by reusing the same controllers Rokkit uses internally.
  </p>
  <p>See <a href="/docs/utilities/controllers">Controllers</a> and <a href="/docs/utilities/navigator">Navigator</a> for details.</p>
</article>
