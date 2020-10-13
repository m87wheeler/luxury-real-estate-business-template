<script>
  import DateToggle from '../_atoms/DateToggle.svelte';

  export let currentDate;
  export let viewedDate;

  let month = [];
  const daysInMonth = (y, m) => {
    month.length = 0;
    let m2 = m + 1 === 12 ? 0 : m + 1;
    let days = new Date(y, m2, 0).getDate();
    for (let i = 1; i <= days; i++) {
      month.push(i);
    }
  };

  let selectedDate = currentDate + 1;
  const updateSelected = e => {
    if (new Date().getMonth() !== viewedDate[0]) {
      selectedDate = e.detail;
    } else {
      e.detail > currentDate && (selectedDate = e.detail);
    }
  };

  const monthStart = arr => {
    let month = arr[0];
    let year = arr[1];
    let date = new Date(year, month, 1);
    let firstDay = date.getDay();
    return firstDay;
  };

  $: gridStart = monthStart(viewedDate);
  $: daysInMonth(viewedDate[1], viewedDate[0]);
</script>

<style type="text/scss">
  .calendar {
    width: 100%;
    height: 100%;
    min-width: 280px;
    min-height: 200px;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(6, 1fr);
    align-items: center;
    justify-items: center;

    .day {
      font-weight: 600;
    }
  }
</style>

<form class="calendar">
  <span class="day">S</span>
  <span class="day">M</span>
  <span class="day">T</span>
  <span class="day">W</span>
  <span class="day">T</span>
  <span class="day">F</span>
  <span class="day">S</span>

  <div
    class="placeholder"
    style={`
        display: ${gridStart === 0 ? 'none' : 'block'};
        grid-column: 1 / ${gridStart + 1};
        `} />

  {#each month as date, i}
    {#if parseInt(currentDate - 1) === i && new Date().getMonth() === viewedDate[0]}
      <DateToggle
        name="date"
        number={date}
        value={date}
        {selectedDate}
        current
        on:updateSelected={updateSelected} />
    {:else}
      <DateToggle
        name="date"
        number={date}
        value={date}
        {selectedDate}
        on:updateSelected={updateSelected} />
    {/if}
  {/each}
</form>
