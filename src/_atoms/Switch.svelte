<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let style;

  let checked = false;
  export let optionOne = 'false';
  export let optionTwo = 'true';

  const switchInput = () => dispatch('switchInput', checked);
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    display: inline-grid;
    grid-template-columns: repeat(3, auto);
    column-gap: 0.5rem;
    align-items: center;
    width: auto;
    height: 28px;
    border-radius: 3.5rem;
    cursor: pointer;

    .option {
      margin: 0;
      text-transform: capitalize;
      color: $secondary;
      transition: color 0.3s ease-in-out;

      &--checked {
        color: $black;
      }
    }
  }

  .switch {
    position: relative;
    top: 0;
    left: 0;
    width: 56px;
    height: 28px;
    overflow: hidden;
    background: $white;
    border: 1px solid $white;
    border-radius: 56px;
    background: $white;
    cursor: pointer;

    .toggle {
      position: absolute;
      display: block;
      top: -28px;
      width: 24px;
      height: 24px;
      background: $secondary;
      border-radius: 100%;
      z-index: 5;
      outline: none;
      transition: left 0.2s ease-in-out;

      &::after {
        content: '';
        position: absolute;
        display: block;
        top: 29px;
        left: 0;
        width: 24px;
        height: 24px;
        background: $secondary;
        border-radius: 100%;
        z-index: 5;
      }

      &--false {
        left: 1px;
      }

      &--true {
        left: calc(3.5rem - 26px - 1px);
      }
    }
  }
</style>

<div class="wrapper" {style}>
  <p class="option" class:option--checked={!checked}>{optionOne}</p>
  <label class="switch">
    <input
      class={`toggle toggle--${checked}`}
      type="checkbox"
      bind:checked
      on:change={switchInput} />
  </label>
  <p class="option" class:option--checked={checked}>{optionTwo}</p>
</div>
