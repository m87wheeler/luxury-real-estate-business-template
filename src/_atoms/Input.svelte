<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let type = 'text';
  export let placeholder = '';
  export let style = '';
  export let name = '';

  let value;
  const handleInput = () => dispatch('inputUpdate', [name, value]);
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .input {
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: $white;
  }
</style>

{#if type === 'text'}
  <input
    class="input"
    type="text"
    {placeholder}
    {style}
    {name}
    bind:value
    on:input={handleInput} />
{:else if type === 'number'}
  <input
    class="input"
    type="number"
    {placeholder}
    {style}
    {name}
    bind:value
    on:input={handleInput} />
{/if}
