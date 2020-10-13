<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  export let month = 0;
  export let year = 2020;

  $: fullMonth = months[month];
  $: fullYear = year;

  const iterateMonth = iterator =>
    dispatch('iterateMonth', { iterator, months });
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    justify-items: center;
    padding: 1.5rem 0;
    text-align: center;
    background: $primary;

    .next,
    .prev {
      height: 100%;
      width: 3rem;
      border: none;
      font-size: 1.25rem;
      background: transparent;
      color: $white;
    }

    .month,
    .year {
      color: $white;
      margin: 0;
    }

    .month {
      font-size: 1.5rem;
    }
  }
</style>

<div class="wrapper">
  <button class="prev" on:click={() => iterateMonth(-1)}>&ltrif;</button>
  <div class="display">
    <p class="month">{fullMonth}</p>
    <p class="year">{fullYear}</p>
  </div>
  <button class="next" on:click={() => iterateMonth(1)}>&rtrif;</button>
</div>
