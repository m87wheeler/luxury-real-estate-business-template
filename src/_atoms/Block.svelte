<script>
  export let height = 'auto';
  export let primary = false;
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .block {
    position: relative;
    width: 100%;
    background: $white;

    &--primary {
      background: $primary;
    }
  }
</style>

<div
  class="block"
  class:block--primary={primary}
  style={`height: ${height}; ${style ? style : ''}`}>
  <slot />
</div>
