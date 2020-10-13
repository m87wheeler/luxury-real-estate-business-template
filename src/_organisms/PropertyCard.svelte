<script>
  import { numberWithCommas } from '../assets/functions/functions.js';
  import AmenityIcons from '../_atoms/AmenityIcons.svelte';
  import Slideshow from '../_atoms/Slideshow.svelte';

  export let data;

  let index = 0;
  const changeImg = e => (index = e.detail);
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .property {
    width: 100%;
    height: auto;

    &__styling-top {
      width: 100%;
      height: 1rem;
      background: $primary;
      margin-bottom: 0.5rem;
    }

    &__title,
    &__price,
    &__description {
      padding: 0 1rem;
      line-height: 1.5em;
    }

    &__title,
    &__price {
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: capitalize;
    }

    &__cover-image {
      width: 100%;
      height: 0;
      padding-top: calc(75% + 1.5rem);
      overflow: hidden;
      position: relative;
      background-size: cover;
      background-position: center;
    }

    &__styling-bottom {
      width: 100%;
      height: 0.5rem;
      background: $primary;
      margin-top: 0.5rem;
    }
  }
</style>

<div class="property">
  <div class="property__styling-top" />
  <p class="property__title">
    {data.details.bedrooms}
    bedroom
    {data.type}
    in
    {data.location.city}
  </p>
  <p class="property__price">£{numberWithCommas(data.price)}</p>
  <div
    class="property__cover-image"
    style={`background-image: url(${data.images[index]})`}>
    <AmenityIcons {data} style="position: absolute;
    bottom: 0; right: 0;" />
  </div>
  <Slideshow array={data.images} on:changeImg={changeImg} />
  <div class="property__styling-bottom" />
</div>
