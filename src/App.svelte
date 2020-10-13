<script>
  import router from 'page';
  import Home from './_views/Home.svelte';
  import Properties from './_views/Properties.svelte';
  import NotFound from './_views/NotFound.svelte';
  import PageContainer from './_atoms/PageContainer.svelte';

  let page;
  router('/', () => (page = Home));
  router('/properties', () => (page = Properties));
  router('/*', () => (page = NotFound));

  router.start();

  let element;
  const handleScroll = e => {
    element
      ? element.scrollTo({
          top: 0,
          left: 0,
          behavior: e.detail,
        })
      : null;
  };
</script>

<style type="text/scss">
  @import './__base/theme.scss';

  :global(body) {
    font-family: 'Playfair Display', sans-serif;
    font-size: 16px;
    letter-spacing: 0.15em;
    color: $black;
  }

  #app {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: scroll;
    perspective-origin: center;
    perspective: 10px;
  }
</style>

<div id="app" bind:this={element}>
  <PageContainer on:scrollToTop={handleScroll}>
    <svelte:component this={page} />
  </PageContainer>
</div>
