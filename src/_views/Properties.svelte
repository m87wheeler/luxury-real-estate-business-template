<script>
  import { Search } from '../__stores/SearchStore.js';
  import { properties } from '../assets/data/properties.js';

  import Card from '../_atoms/Card.svelte';
  import PropertySearchCard from '../_molecules/PropertySearchCard.svelte';
  import PropertyCard from '../_organisms/PropertyCard.svelte';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    padding-bottom: 4rem;
  }
</style>

<div class="wrapper">
  <PropertySearchCard
    data={$Search}
    style="width: calc(100% - 2rem); margin: 1rem auto; padding: 1rem;" />
  {#each properties as property}
    <Card
      low
      style="width: calc(100% - 2rem); margin-left: 1rem; margin-bottom: 1rem;">
      <PropertyCard data={property} />
    </Card>
  {/each}
</div>
