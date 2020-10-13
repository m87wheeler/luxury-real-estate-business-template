<script>
  import { scrollY } from '../__stores/ScrollStore.js';
  import Header from '../_molecules/Header.svelte';
  import Footer from '../_molecules/Footer.svelte';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .main {
    width: 100%;
    min-height: 90vh;
    padding-top: 12vh;
  }
</style>

<Header style="
position: fixed;
top: 0;
left: 0;" />
<main class="main" on:scroll>
  <slot />
</main>
<Footer on:scrollToTop />
