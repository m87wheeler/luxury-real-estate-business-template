<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let array = [];

  let count = 0;

  const iterateImg = iterator => {
    if (iterator > 0) {
      if (count + 1 === array.length) {
        count = 0;
      } else {
        count = count + iterator;
      }
    } else {
      if (count === 0) {
        count = array.length - 1;
      } else {
        count = count + iterator;
      }
    }
  };

  const handleClick = index => {
    dispatch('changeImg', index);
  };
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    position: relative;
    width: 100%;
    height: 8rem;
    margin: 0.5rem 0;
    overflow: hidden;

    .next,
    .prev {
      position: absolute;
      top: 0;
      height: 100%;
      width: 2rem;
      border: none;
      font-size: 1.25rem;
      background: rgba($primary, 0.5);
      color: $white;
      z-index: 10;

      &:hover {
        background: rgba($primary, 0.9);
      }
    }

    .prev {
      left: 0;
    }
    .next {
      right: 0;
    }

    .slider {
      position: absolute;
      top: 0;
      display: flex;
      flex-flow: row nowrap;
      height: inherit;
      width: auto;
      background: pink;
      transition: left 0.3s ease-in-out;

      .img {
        position: relative;
        height: 8rem;
        width: 12rem;
        min-width: 12rem;
        border: 1px solid $white;
        background-size: cover;
        background-color: $secondary;

        &:first-of-type {
          border-left: none;
        }
        &:last-of-type {
          border-right: none;
        }
      }
    }
  }
</style>

<div class="wrapper">
  <button class="prev" on:click={() => iterateImg(-1)}>&ltrif;</button>
  <div class="slider" style={`left: -${12 * count}rem;`}>
    {#each array as img, i}
      <div
        class="img"
        style={`background-image: url(${img});`}
        on:click={() => handleClick(i)} />
    {/each}
    <div class="div img" />
  </div>
  <button class="next" on:click={() => iterateImg(1)}>&rtrif;</button>
</div>
