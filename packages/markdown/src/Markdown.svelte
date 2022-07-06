<script>
  import marked from 'marked'
  import Prism from 'prismjs'
  import 'prismjs/components/prism-c'
  import 'prismjs/components/prism-clike'
  import 'prismjs/components/prism-cpp'
  import 'prismjs/components/prism-csharp'
  import 'prismjs/components/prism-css'
  import 'prismjs/components/prism-docker'
  import 'prismjs/components/prism-go'
  import 'prismjs/components/prism-java'
  import 'prismjs/components/prism-jq'
  import 'prismjs/components/prism-json'
  import 'prismjs/components/prism-julia'
  import 'prismjs/components/prism-kotlin'
  import 'prismjs/components/prism-python'
  import 'prismjs/components/prism-r'
  import 'prismjs/components/prism-ruby'
  import 'prismjs/components/prism-rust'
  import 'prismjs/components/prism-scss'
  import 'prismjs/components/prism-sql'
  import 'prismjs/components/prism-typescript'
  import 'prismjs/components/prism-yaml'

  export let content = ''
  $: preview = marked(content || '')
</script>

<style>
  @import url('./prism.css');

  .markdown-body {
    padding: 0 1em;
    font-family: var(--font-body);
    background-color: var(--bg-600);
    color: var(--fg-600);
  }
</style>

<article class="markdown-body">
  {@html preview}
</article>
