<script>
  export let primary = false;
  export let secondary = false;
  export let link = '';
  export let danger = false;
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .button {
    padding: 0.5rem 1.5rem;
    border: none;
    font-size: 1rem;
    line-height: 1.25rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: $white;
    color: $white;

    &--primary {
      background: $confirm;
      color: $white;
    }

    &--secondary {
      background: $secondary;
    }

    &--danger {
      background: $danger;
    }
  }

  .link {
    @extend .button;
    display: block;
    text-decoration: none;
  }
</style>

{#if link}
  <a
    class="link"
    class:button--primary={primary}
    class:button--secondary={secondary}
    class:button--danger={danger}
    href={link}
    {style}>
    <slot />
  </a>
{:else}
  <button
    class="button"
    class:button--primary={primary}
    class:button--secondary={secondary}
    class:button--danger={danger}
    {style}>
    <slot />
  </button>
{/if}
