<script>
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  export let src;
  let element;
  let visible = false;

  const startFlyIn = elem => {
    elem.getBoundingClientRect().top < window.innerHeight
      ? (visible = true)
      : null;
  };

  onMount(() => {
    setTimeout(() => {
      startFlyIn(element);
    }, 500);
  });
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    position: relative;
    width: 100%;
    height: 90vh;
    transform-origin: center;
    transform: translateZ(-3px) scale(1.3);

    .img {
      width: 100%;
      height: 100%;
      background-size: cover;
      filter: brightness(0.75);
    }

    p {
      position: absolute;
      top: 25%;
      left: 10%;
      width: 80%;
      font-size: 3rem;
      text-align: center;
      text-transform: capitalize;
      color: $white;
    }
  }
</style>

<div class="wrapper" bind:this={element}>
  <div class="img" style={`background-image: url(${src})`} />
  {#if visible}
    <p transition:fly={{ y: 200, duration: 2000 }}>
      <slot />
    </p>
  {/if}
</div>
