<script lang="ts">
  import type { BaseUrl, Issue } from "@httpd-client";

  import { formatObjectId, formatTimestamp } from "@app/lib/utils";

  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
  export let issue: Issue;
  export let projectId: string;

  $: commentCount = issue.discussion.reduce((acc, _curr, index) => {
    if (index !== 0) {
      return acc + 1;
    }
    return acc;
  }, 0);
</script>

<style>
  .issue-teaser {
    display: flex;
    padding: 0.75rem 0;
    background-color: var(--color-foreground-1);
  }
  .issue-teaser:hover {
    background-color: var(--color-foreground-2);
  }
  .subtitle {
    color: var(--color-foreground-6);
    font-size: var(--font-size-tiny);
    font-family: var(--font-family-monospace);
    margin-right: 0.4rem;
  }
  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding-right: 1rem;
  }
  .issue-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
  .issue-title:hover {
    text-decoration: underline;
  }
  .comment-count {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 1rem;
    gap: 0.5rem;
    color: var(--color-foreground-5);
  }
  .tags {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
  .tag {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .right {
    align-self: center;
    justify-self: center;
    margin-left: auto;
  }
  .state {
    justify-self: center;
    align-self: center;
    margin: 0 1rem 0 1.25rem;
  }
  .open {
    color: var(--color-positive-6);
  }
  .closed {
    color: var(--color-negative-6);
  }

  @media (max-width: 960px) {
    .tags {
      display: none;
    }
  }
</style>

<div class="issue-teaser">
  <div
    class="state"
    class:closed={issue.state.status === "closed"}
    class:open={issue.state.status === "open"}>
    <Icon name="exclamation-circle" />
  </div>
  <div>
    <div class="summary">
      <Link
        route={{
          resource: "projects",
          params: {
            id: projectId,
            baseUrl,
            view: {
              resource: "issue",
              params: { issue: issue.id },
            },
          },
        }}>
        <span class="issue-title">
          <InlineMarkdown content={issue.title} />
        </span>
      </Link>
      <span class="tags">
        {#each issue.tags.slice(0, 4) as tag}
          <Badge style="max-width:7rem" variant="secondary">
            <span class="tag">{tag}</span>
          </Badge>
        {/each}
        {#if issue.tags.length > 4}
          <Badge variant="foreground">
            <span class="tag">+{issue.tags.length - 4} more tags</span>
          </Badge>
        {/if}
      </span>
    </div>
    <div class="summary subtitle">
      {formatObjectId(issue.id)} opened {formatTimestamp(
        issue.discussion[0].timestamp,
      )} by
      <Authorship authorId={issue.author.id} authorAlias={issue.author.alias} />
    </div>
  </div>
  {#if commentCount > 0}
    <div class="right">
      <div class="comment-count">
        <Icon name="chat" />
        <span>{commentCount}</span>
      </div>
    </div>
  {/if}
</div>
