<script>
  import Card from '../_atoms/Card.svelte';
  import SearchDisplay from '../_atoms/SearchDisplay.svelte';

  export let data;
  export let style = '';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  a {
    color: $black;
    font-weight: 600;
    text-decoration: none;

    span {
      text-decoration: underline;
    }
  }
</style>

<Card {style}>
  <a href="/">&ltrif; <span>Go Back</span></a>
  <SearchDisplay {data} />
</Card>
