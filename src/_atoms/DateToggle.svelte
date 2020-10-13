<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let name;
  export let number;
  export let current = false;
  export let selectedDate;
  export let value;

  const updateSelected = () => dispatch('updateSelected', value);
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    position: relative;
    display: block;
    width: 38px;
    height: 38px;
    overflow: hidden;
    background: $white;
    border-radius: 100%;
    cursor: pointer;
    transition: background 0.2s ease-in-out;

    input {
      position: absolute;
      top: 0;
      right: -40px;
      visibility: hidden;
    }

    .number {
      margin: 0;
      margin-top: -0.1rem;
      font-family: map-get($font, serif);
      line-height: 40px;
      text-align: center;
      letter-spacing: 0;
      color: $black;
    }

    &--current {
      background: $primary;

      .number {
        color: $white;
      }
    }

    &--true {
      background: $confirm;

      .number {
        color: $white;
      }
    }
  }
</style>

<label
  class={`wrapper wrapper--${selectedDate === value ? true : false}`}
  class:wrapper--current={current}>
  <input type="checkbox" {name} {value} on:click={updateSelected} />
  <p class="number">{number}</p>
</label>
