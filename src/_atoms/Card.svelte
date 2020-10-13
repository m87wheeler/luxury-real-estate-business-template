<script>
  export let low = false;
  export let relative = false;
  export let inline = false;
  export let center = false;
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .card {
    overflow: hidden;
    background: $white;
    box-shadow: 0px 6px 15px 3px rgba(0, 0, 0, 0.25);
    transition: margin 0.5s ease-in-out, opacity 0.5s ease-in-out;

    &--low {
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }

    &--relative {
      position: relative;
    }

    &--inline {
      display: inline-block;
      margin: 0;
    }

    &--center {
      align-self: center;
    }

    &--fade {
      margin-left: -150vw;
      opacity: 0;
    }
  }
</style>

<div
  class="card"
  class:card--low={low}
  class:card--relative={relative}
  class:card--inline={inline}
  class:card--center={center}
  {style}>
  <slot />
</div>
