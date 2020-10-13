<script>
  import { numberWithCommas } from '../assets/functions/functions.js';
  export let data;
</script>

<style>
  p {
    line-height: 1.5rem;
  }
</style>

<p>
  Your're looking for a property to
  <strong>{data.buy ? 'buy' : 'rent'}</strong>
  in
  <strong>{data.area}</strong>
  between
  <strong>£{numberWithCommas(data.min)}</strong>
  and
  <strong>£{numberWithCommas(data.max)}</strong>.
</p>
