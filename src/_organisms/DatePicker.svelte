<script>
  import MonthPicker from '../_atoms/MonthPicker.svelte';
  import Calendar from '../_molecules/Calendar.svelte';

  let date = new Date();
  let currentYear = date.getFullYear();
  let currentMonth = date.getMonth();
  let currentDate = date.getDate();

  const iterateMonth = e => {
    if (e.detail.iterator > 0) {
      if (currentMonth + 1 === e.detail.months.length) {
        currentMonth = 0;
        currentYear += 1;
      } else {
        currentMonth = currentMonth + e.detail.iterator;
      }
    } else {
      if (currentMonth === 0) {
        currentMonth = e.detail.months.length - 1;
        currentYear -= 1;
      } else {
        currentMonth = currentMonth + e.detail.iterator;
      }
    }
  };
  $: viewedDate = [currentMonth, currentYear];
</script>

<style type="text/scss">
</style>

<div class="calendar">
  <MonthPicker
    year={currentYear}
    month={currentMonth}
    on:iterateMonth={iterateMonth} />
  <Calendar {currentDate} {viewedDate} />
</div>
