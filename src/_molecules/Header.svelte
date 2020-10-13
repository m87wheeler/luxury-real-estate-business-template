<script>
  import LogoSvg from '../_atoms/LogoSVG.svelte';
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  header {
    width: 100%;
    height: 12vh;
    background: $primary;
    z-index: 99999;
  }
</style>

<header {style}>
  <LogoSvg
    style="display: block; height: 8vh; margin: 2vh auto; opacity: .9;" />
</header>
