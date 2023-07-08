<script lang="ts">
  import Markdown from "@app/components/Markdown.svelte";

  export let content: string;
  export let rawPath: string;
  export let path: string;
  export let hash: string | undefined = undefined;
</script>

<style>
  article {
    padding: 2rem;
    width: 100%;
    background-color: var(--background-float);
    /* background: var(--color-background-1); */
  }
</style>

<article>
  <Markdown {content} {hash} {rawPath} {path} />
</article>
