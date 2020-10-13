<script>
  export let type = 'h1';
  export let upper = false;
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .title {
    letter-spacing: 0.15em;
    margin: 0;

    &--h1 {
    }

    &--h2 {
    }

    &--h3 {
    }

    &--h4 {
      padding: 1rem 0 2rem;
      font-size: 2.25rem;
      font-weight: 400;
      text-align: center;
    }

    &--h5 {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.25em;
      text-align: center;
    }

    &--h6 {
      padding: 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      text-align: center;
    }

    &--upper {
      text-transform: uppercase;
    }
  }
</style>

{#if type === 'h1'}
  <h1 class={`title title--${type}`} class:title--upper={upper} {style}>
    <slot />
  </h1>
{:else if type === 'h2'}
  <h2 class={`title title--${type}`} class:title--upper={upper} {style}>
    <slot />
  </h2>
{:else if type === 'h3'}
  <h3 class={`title title--${type}`} class:title--upper={upper} {style}>
    <slot />
  </h3>
{:else if type === 'h4'}
  <h4 class={`title title--${type}`} class:title--upper={upper} {style}>
    <slot />
  </h4>
{:else if type === 'h5'}
  <h5 class={`title title--${type}`} class:title--upper={upper} {style}>
    <slot />
  </h5>
{:else if type === 'h6'}
  <h6 class={`title title--${type}`} class:title--upper={upper} {style}>
    <slot />
  </h6>
{/if}
