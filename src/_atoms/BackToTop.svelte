<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  const scrollToTop = () => dispatch('scrollToTop', 'smooth');
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  button {
    width: 4rem;
    height: 4rem;
    line-height: 4rem;
    text-align: center;
    border: none;
    background: $black;
    color: $white;
  }
</style>

<button on:click={scrollToTop} {style}>TOP</button>
