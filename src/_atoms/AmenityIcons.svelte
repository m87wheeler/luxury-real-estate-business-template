<script>
  export let data;
  export let style = '';
  let amenity = data.amenities;
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: center;
    width: auto;
    height: auto;
    padding: 0.25rem 0.5rem;
    background: $primary;
    border-top: 2px solid $white;
    border-left: 2px solid $white;
  }

  .icon {
    height: 1.5rem;
    margin: 0.25rem;
    line-height: 1.5rem;

    img {
      height: inherit;
    }
  }
</style>

<div class="wrapper" {style}>
  <div class="icon">
    <img src="/images/bed.png" alt="bedroom" />
    {data.details.bedrooms}
  </div>
  <div class="icon">
    <img src="/images/bath.png" alt="bathroom" />
    {data.details.bathrooms}
  </div>
  {#if amenity.garden.front || amenity.garden.rear || amenity.garden.communal}
    <div class="icon">
      <img src="/images/gardening-tools.png" alt="garden" />
    </div>
  {/if}
  {#if amenity.balcony}
    <div class="icon"><img src="/images/balcony.png" alt="balcony" /></div>
  {/if}
  {#if amenity.parking.driveway || amenity.parking.street || amenity.parking.garage || amenity.parking.secured}
    <div class="icon">
      <img src="/images/car-of-hatchback-model.png" alt="parking" />
    </div>
  {/if}
  {#if amenity.pool.indoor || amenity.pool.outdoor}
    <div class="icon"><img src="/images/springboard.png" alt="pool" /></div>
  {/if}
</div>
